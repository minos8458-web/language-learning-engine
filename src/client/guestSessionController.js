const GUEST_STATUS = Object.freeze({
  CHECKING: 'CHECKING', CREATING: 'CREATING', SAVING: 'SAVING', READY: 'READY',
  HOST_UNAVAILABLE: 'HOST_UNAVAILABLE', STORAGE_ERROR: 'STORAGE_ERROR',
  CREATION_UNCERTAIN: 'CREATION_UNCERTAIN', EXPIRED: 'EXPIRED',
  AUTH_REJECTED: 'AUTH_REJECTED', DISPOSED: 'DISPOSED',
});
const RETRYABLE = new Set(['HOST_UNAVAILABLE', 'STORAGE_ERROR', 'CREATION_UNCERTAIN']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GUEST_KEYS = ['user_id', 'access_token', 'token_type', 'expires_at'];
const FLOW_PATHS = ['/flow/start-session', '/flow/start-explicit-study'];
const SAFE_ERROR = '게스트 연결을 확인한 뒤 다시 시도해 주세요.';

function exactObject(value, keys) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function copyGuest(value) {
  if (!exactObject(value, GUEST_KEYS)) throw new Error(SAFE_ERROR);
  const guest = Object.fromEntries(GUEST_KEYS.map((key) => [key, value[key]]));
  if (typeof guest.user_id !== 'string' || !UUID.test(guest.user_id) ||
      typeof guest.access_token !== 'string' || !guest.access_token || guest.access_token.length > 4096 ||
      /[\x00-\x20\x7f]/.test(guest.access_token) || guest.token_type !== 'Bearer' ||
      typeof guest.expires_at !== 'string' || !Number.isFinite(Date.parse(guest.expires_at))) {
    throw new Error(SAFE_ERROR);
  }
  return Object.freeze(guest);
}

function sameGuest(a, b) {
  return GUEST_KEYS.every((key) => a[key] === b[key]);
}

function snapshot(value) {
  if (exactObject(value, ['kind']) && ['empty', 'pending'].includes(value.kind)) return { kind: value.kind };
  if (exactObject(value, ['kind', 'guest']) && value.kind === 'stored') return { kind: 'stored', guest: copyGuest(value.guest) };
  throw new Error(SAFE_ERROR);
}

function linkAbort(source, target) {
  if (!source) return () => {};
  if (source.aborted) { target.abort(); return () => {}; }
  const abort = () => target.abort();
  source.addEventListener('abort', abort, { once: true });
  return () => source.removeEventListener('abort', abort);
}

// 실제 host adapter를 소비한다. 평문 저장·새 게스트 복구·서명 검증을 대체하지 않는다.
class GuestSessionController {
  #store; #fetch; #baseUrl; #origin; #flowUrls; #configured = false;
  #now; #timeoutMs; #status = GUEST_STATUS.HOST_UNAVAILABLE;
  #guest = null; #candidate = null; #started = false; #operation = null;
  #epoch = 0; #listeners = new Set(); #lifetime = new AbortController();
  #flowRequests = new Set();

  constructor({ guestStore, fetchImpl = globalThis.fetch, baseUrl = '', origin, timeoutMs = 10000, now = Date.now } = {}) {
    this.#store = guestStore;
    this.#fetch = fetchImpl;
    this.#now = now;
    this.#timeoutMs = timeoutMs;
    try {
      if (typeof baseUrl !== 'string' || typeof now !== 'function' || typeof fetchImpl !== 'function' ||
          !Number.isInteger(timeoutMs) || timeoutMs <= 0) throw new Error(SAFE_ERROR);
      this.#baseUrl = baseUrl.replace(/\/+$/, '');
      const base = new URL(this.#baseUrl || origin);
      if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error(SAFE_ERROR);
      if (!this.#baseUrl && origin !== base.origin) throw new Error(SAFE_ERROR);
      this.#origin = base.origin;
      this.#flowUrls = new Set(FLOW_PATHS.map((path) => new URL(this.#baseUrl + path, this.#origin).href));
      this.#configured = true;
      if (this.#hasHost()) this.#status = GUEST_STATUS.CHECKING;
    } catch {
      this.#configured = false;
    }
  }

  getState() {
    this.#checkExpiry();
    return { status: this.#status, canRetry: RETRYABLE.has(this.#status) };
  }

  getUserId() {
    this.#checkExpiry();
    return this.#status === GUEST_STATUS.READY ? this.#guest.user_id : null;
  }

  async getAccessToken() {
    this.#checkExpiry();
    return this.#status === GUEST_STATUS.READY ? this.#guest.access_token : null;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('상태를 받을 함수가 필요합니다.');
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  start() {
    if (this.#operation) return this.#operation;
    if (this.#started || this.#status === GUEST_STATUS.DISPOSED) return Promise.resolve(this.getState());
    this.#started = true;
    return this.#run(true);
  }

  retryStorage() {
    if (this.#operation) return this.#operation;
    if (!RETRYABLE.has(this.#status)) return Promise.resolve(this.getState());
    return this.#run(false);
  }

  dispose() {
    if (this.#status === GUEST_STATUS.DISPOSED) return;
    this.#lifetime.abort();
    this.#setStatus(GUEST_STATUS.DISPOSED);
    this.#guest = null;
    this.#candidate = null;
    this.#listeners.clear();
  }

  createFlowFetch() {
    return async (url, options = {}) => {
      let request;
      let unlink = () => {};
      let handedOff = false;
      try {
        this.#checkExpiry();
        if (this.#status !== GUEST_STATUS.READY || typeof url !== 'string' ||
            !this.#flowUrls.has(new URL(url, this.#origin).href) || options.method !== 'POST') {
          throw new Error(SAFE_ERROR);
        }
        const token = this.#guest.access_token;
        const headers = options.headers;
        const values = typeof headers?.get === 'function' ? [headers.get('Authorization')] :
          Object.entries(headers || {}).filter(([key]) => key.toLowerCase() === 'authorization').map(([, value]) => value);
        if (values.length !== 1 || values[0] !== 'Bearer ' + token) throw new Error(SAFE_ERROR);
        const epoch = this.#epoch;
        request = new AbortController();
        unlink = linkAbort(options.signal, request);
        this.#flowRequests.add(request);
        const response = await this.#wait(
          Promise.resolve().then(() => {
            request.signal.throwIfAborted();
            return this.#fetch(url, { ...options, signal: request.signal });
          }),
          request.signal, () => request.abort()
        );
        this.#checkExpiry();
        if (epoch !== this.#epoch || this.#status !== GUEST_STATUS.READY) throw new Error(SAFE_ERROR);
        // 받은 응답은 그대로 전송 경계에 넘긴다. 호출자의 취소는 본문을 읽는 동안에도 연결한다.
        this.#flowRequests.delete(request);
        handedOff = true;
        if (response.status === 401) this.#setStatus(GUEST_STATUS.AUTH_REJECTED);
        // 응답 본문·error_code·capacity 표식을 읽거나 바꾸지 않는다.
        return response;
      } catch {
        throw new Error(SAFE_ERROR);
      } finally {
        if (!handedOff) unlink();
        if (request) this.#flowRequests.delete(request);
      }
    };
  }

  #hasHost() {
    return this.#configured && ['read', 'beginCreation', 'commitGuest'].every((key) => typeof this.#store?.[key] === 'function');
  }

  #clock() {
    const value = this.#now();
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(SAFE_ERROR);
    return value;
  }

  #checkExpiry() {
    if (this.#status !== GUEST_STATUS.READY) return;
    try {
      if (Date.parse(this.#guest.expires_at) <= this.#clock()) this.#setStatus(GUEST_STATUS.EXPIRED);
    } catch {
      this.#setStatus(GUEST_STATUS.STORAGE_ERROR);
    }
  }

  #setStatus(status) {
    if (this.#status === GUEST_STATUS.DISPOSED || this.#status === status) return;
    this.#status = status;
    this.#epoch += 1;
    if (status !== GUEST_STATUS.READY) {
      for (const request of this.#flowRequests) request.abort();
    }
    const state = { status, canRetry: RETRYABLE.has(status) };
    for (const listener of [...this.#listeners]) {
      try { listener({ ...state }); } catch { /* 표시 함수의 예외에 인증 기록을 전달하지 않는다. */ }
    }
  }

  #wait(operation, signal = this.#lifetime.signal, onTimeout = () => {}) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let timer;
      const done = (callback, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener('abort', aborted);
        callback(value);
      };
      const aborted = () => done(reject, new Error(SAFE_ERROR));
      // 이미 취소됐어도 늦게 끝나는 작업의 거절을 처리한다.
      Promise.resolve(operation).then((value) => done(resolve, value), (error) => done(reject, error));
      if (signal.aborted) { aborted(); return; }
      signal.addEventListener('abort', aborted, { once: true });
      timer = setTimeout(() => {
        done(reject, new Error(SAFE_ERROR));
        onTimeout();
      }, this.#timeoutMs);
    });
  }

  #callStore(method, ...args) {
    return this.#wait(Promise.resolve().then(() => {
      this.#lifetime.signal.throwIfAborted();
      return this.#store[method](...args);
    }));
  }

  #run(allowCreation) {
    this.#operation = Promise.resolve().then(() => this.#prepare(allowCreation)).finally(() => { this.#operation = null; });
    return this.#operation;
  }

  async #read() {
    return snapshot(await this.#callStore('read'));
  }

  #acceptStored(guest) {
    this.#lifetime.signal.throwIfAborted();
    if (this.#candidate && !sameGuest(guest, this.#candidate)) {
      this.#setStatus(GUEST_STATUS.STORAGE_ERROR);
      return;
    }
    this.#guest = guest;
    this.#candidate = null;
    this.#setStatus(Date.parse(guest.expires_at) > this.#clock() ? GUEST_STATUS.READY : GUEST_STATUS.EXPIRED);
  }

  async #prepare(allowCreation) {
    if (this.#status === GUEST_STATUS.DISPOSED) return this.getState();
    if (!this.#hasHost()) { this.#setStatus(GUEST_STATUS.HOST_UNAVAILABLE); return this.getState(); }
    this.#setStatus(GUEST_STATUS.CHECKING);
    try {
      const stored = await this.#read();
      this.#lifetime.signal.throwIfAborted();
      if (stored.kind === 'stored') this.#acceptStored(stored.guest);
      else if (stored.kind === 'pending') {
        if (this.#candidate) await this.#saveCandidate();
        else this.#setStatus(GUEST_STATUS.CREATION_UNCERTAIN);
      } else if (!allowCreation || this.#candidate) {
        this.#setStatus(GUEST_STATUS.STORAGE_ERROR);
      } else {
        const began = await this.#callStore('beginCreation');
        if (began === false) {
          const current = await this.#read();
          if (current.kind === 'stored') this.#acceptStored(current.guest);
          else this.#setStatus(current.kind === 'pending' ? GUEST_STATUS.CREATION_UNCERTAIN : GUEST_STATUS.STORAGE_ERROR);
        } else if (began === true && (await this.#read()).kind === 'pending') {
          this.#setStatus(GUEST_STATUS.CREATING);
          try {
            const candidate = await this.#requestGuest();
            this.#lifetime.signal.throwIfAborted();
            this.#candidate = candidate;
          }
          catch { this.#setStatus(GUEST_STATUS.CREATION_UNCERTAIN); return this.getState(); }
          await this.#saveCandidate();
        } else {
          this.#setStatus(GUEST_STATUS.STORAGE_ERROR);
        }
      }
    } catch {
      this.#setStatus(GUEST_STATUS.STORAGE_ERROR);
    }
    return this.getState();
  }

  async #requestGuest() {
    const request = new AbortController();
    const unlink = linkAbort(this.#lifetime.signal, request);
    try {
      return await this.#wait(Promise.resolve().then(async () => {
        request.signal.throwIfAborted();
        const response = await this.#fetch(this.#baseUrl + '/auth/guest', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
          cache: 'no-store', credentials: 'omit', redirect: 'error', signal: request.signal,
        });
        if (response.status !== 200) throw new Error(SAFE_ERROR);
        const envelope = await response.json();
        if (!exactObject(envelope, ['status', 'data']) || envelope.status !== 'ok') throw new Error(SAFE_ERROR);
        const guest = copyGuest(envelope.data);
        if (Date.parse(guest.expires_at) <= this.#clock()) throw new Error(SAFE_ERROR);
        return guest;
      }), request.signal, () => request.abort());
    } finally {
      unlink();
    }
  }

  async #saveCandidate() {
    this.#lifetime.signal.throwIfAborted();
    if (Date.parse(this.#candidate.expires_at) <= this.#clock()) {
      this.#setStatus(GUEST_STATUS.EXPIRED);
      return;
    }
    this.#setStatus(GUEST_STATUS.SAVING);
    await this.#callStore('commitGuest', { ...this.#candidate });
    const stored = await this.#read();
    this.#lifetime.signal.throwIfAborted();
    if (stored.kind !== 'stored' || !sameGuest(stored.guest, this.#candidate)) throw new Error(SAFE_ERROR);
    this.#acceptStored(stored.guest);
  }
}

module.exports = { GuestSessionController, GUEST_STATUS };
