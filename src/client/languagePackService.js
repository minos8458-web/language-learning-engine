// 앱 배포 파일의 메타데이터/캐시 경계다. Tier A Language Pack 스키마나 검증 규칙이 아니다.
const WIFI_RECOMMEND_BYTES = 100 * 1000 * 1000;

function abortIfNeeded(signal) {
  if (signal && signal.aborted) {
    const error = new Error('다운로드를 취소했어요.');
    error.name = 'AbortError';
    throw error;
  }
}

function formatPackSize(bytes) {
  if (!Number.isSafeInteger(bytes) || bytes < 0) return '용량 미확인';
  if (bytes < 1000 * 1000) return `${Math.ceil(bytes / 1000)} KB`;
  if (bytes < 1000 * 1000 * 1000) return `${(bytes / (1000 * 1000)).toFixed(1).replace(/\.0$/, '')} MB`;
  return `${(bytes / (1000 * 1000 * 1000)).toFixed(1)} GB`;
}

function normalizeCatalog(catalog = [], origin) {
  if (!Array.isArray(catalog)) throw new TypeError('언어팩 목록을 확인해 주세요.');
  const ids = new Set();
  return Object.freeze(catalog.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)
      || typeof entry.id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(entry.id)
      || typeof entry.language !== 'string' || !/^[A-Z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(entry.language)
      || ['name', 'country', 'version'].some((field) => typeof entry[field] !== 'string' || !entry[field].trim() || entry[field].length > 120)
      || ids.has(entry.id)) throw new TypeError('언어팩 목록을 확인해 주세요.');
    ids.add(entry.id);
    let url = null;
    try {
      const candidate = new URL(entry.downloadUrl, origin);
      if (typeof entry.downloadUrl === 'string' && entry.downloadUrl.trim() && /^https?:$/.test(candidate.protocol)
        && candidate.origin === new URL(origin).origin && !candidate.username && !candidate.password && !candidate.hash) url = candidate.href;
    } catch { /* 미발행 항목은 목록에 남기되 다운로드를 비활성화한다. */ }
    const downloadBytes = Number.isSafeInteger(entry.downloadBytes) && entry.downloadBytes > 0 ? entry.downloadBytes : null;
    const sha256 = typeof entry.sha256 === 'string' && /^[a-fA-F0-9]{64}$/.test(entry.sha256) ? entry.sha256.toLowerCase() : null;
    return Object.freeze({ id: entry.id, language: entry.language, name: entry.name, country: entry.country, version: entry.version,
      downloadBytes, sha256, downloadUrl: url, available: Boolean(url && downloadBytes && sha256) });
  }));
}

function matchesInstalled(pack, record) {
  return Boolean(pack.available && record && record.id === pack.id && record.language === pack.language
    && record.version === pack.version && record.sha256 === pack.sha256 && record.downloadBytes === pack.downloadBytes);
}

class LanguagePackCache {
  constructor({ indexedDB, databaseName = 'lle-language-packs' } = {}) {
    this.indexedDB = indexedDB;
    this.databaseName = databaseName;
    this.opening = null;
  }

  async open() {
    if (!this.indexedDB) throw new Error('이 환경에서는 언어팩을 저장할 수 없어요.');
    if (this.opening) return this.opening;
    this.opening = new Promise((resolve, reject) => {
      const request = this.indexedDB.open(this.databaseName, 1);
      let blocked = false;
      request.onupgradeneeded = () => {
        for (const store of ['metadata', 'assets', 'settings']) request.result.createObjectStore(store, { keyPath: 'id' });
      };
      request.onerror = () => reject(new Error('언어팩 저장소를 열지 못했어요.'));
      request.onblocked = () => { blocked = true; reject(new Error('다른 LLE 창을 닫고 다시 시도해 주세요.')); };
      request.onsuccess = () => {
        const db = request.result;
        if (blocked) { db.close(); return; }
        db.onversionchange = () => { db.close(); this.opening = null; };
        resolve(db);
      };
    });
    try { return await this.opening; } catch (error) { this.opening = null; throw error; }
  }

  async load(catalog) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['metadata', 'assets', 'settings'], 'readonly');
      const metadata = transaction.objectStore('metadata').getAll();
      const assetKeys = transaction.objectStore('assets').getAllKeys();
      const selected = transaction.objectStore('settings').get('active');
      transaction.onabort = () => reject(new Error('저장된 언어팩을 확인하지 못했어요.'));
      transaction.oncomplete = () => {
        const keys = new Set(assetKeys.result);
        const installedIds = catalog.filter((pack) => keys.has(pack.id) && metadata.result.some((record) => matchesInstalled(pack, record))).map((pack) => pack.id);
        resolve({ installedIds, selectedId: installedIds.includes(selected.result?.packId) ? selected.result.packId : null });
      };
    });
  }

  async installAndSelect(pack, bytes, { signal } = {}) {
    const db = await this.open();
    abortIfNeeded(signal);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['metadata', 'assets', 'settings'], 'readwrite');
      const abort = () => { try { transaction.abort(); } catch { /* 이미 끝난 트랜잭션 */ } };
      const cleanup = () => signal?.removeEventListener('abort', abort);
      transaction.onabort = () => { cleanup(); reject(signal?.aborted ? Object.assign(new Error('다운로드를 취소했어요.'), { name: 'AbortError' }) : new Error('저장 공간을 확인하고 다시 시도해 주세요.')); };
      transaction.oncomplete = () => { cleanup(); resolve(); };
      signal?.addEventListener('abort', abort, { once: true });
      try {
        transaction.objectStore('metadata').put({ id: pack.id, language: pack.language, version: pack.version, sha256: pack.sha256, downloadBytes: pack.downloadBytes });
        transaction.objectStore('assets').put({ id: pack.id, blob: new Blob([bytes], { type: 'application/octet-stream' }) });
        transaction.objectStore('settings').put({ id: 'active', packId: pack.id });
      } catch { abort(); }
    });
  }

  async select(pack, { signal } = {}) {
    const db = await this.open();
    abortIfNeeded(signal);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['metadata', 'assets', 'settings'], 'readwrite');
      const abort = () => { try { transaction.abort(); } catch { /* 이미 끝남 */ } };
      const cleanup = () => signal?.removeEventListener('abort', abort);
      signal?.addEventListener('abort', abort, { once: true });
      const record = transaction.objectStore('metadata').get(pack.id);
      record.onsuccess = () => {
        if (!matchesInstalled(pack, record.result)) return transaction.abort();
        const key = transaction.objectStore('assets').getKey(pack.id);
        key.onsuccess = () => {
          if (key.result === undefined) return transaction.abort();
          transaction.objectStore('settings').put({ id: 'active', packId: pack.id });
        };
      };
      transaction.onabort = () => { cleanup(); reject(new Error('언어팩을 다시 내려받아 주세요.')); };
      transaction.oncomplete = () => { cleanup(); resolve(); };
    });
  }

  async close() {
    if (this.opening) (await this.opening).close();
    this.opening = null;
  }
}

class LanguagePackService {
  constructor({ catalog = [], origin, cache, fetchImpl = globalThis.fetch, cryptoImpl = globalThis.crypto } = {}) {
    this.catalog = normalizeCatalog(catalog, origin);
    this.cache = cache;
    this.fetchImpl = fetchImpl;
    this.cryptoImpl = cryptoImpl;
  }

  pack(id) {
    const pack = this.catalog.find((entry) => entry.id === id);
    if (!pack?.available) throw new Error('아직 받을 수 없는 언어팩이에요.');
    return pack;
  }

  async load() { return this.catalog.length ? this.cache.load(this.catalog) : { installedIds: [], selectedId: null }; }
  async select(id, options) { await this.cache.select(this.pack(id), options); }

  async downloadAndSelect(id, { signal, onProgress = () => {} } = {}) {
    const pack = this.pack(id);
    abortIfNeeded(signal);
    if (typeof this.fetchImpl !== 'function' || !this.cryptoImpl?.subtle) throw new Error('이 환경에서는 안전한 다운로드를 지원하지 않아요.');
    const response = await this.fetchImpl(pack.downloadUrl, { signal, credentials: 'omit', cache: 'no-store', redirect: 'error' });
    if (!response.ok || !response.body?.getReader) throw new Error('언어팩을 내려받지 못했어요.');
    const reader = response.body.getReader();
    const cancelReader = () => { void reader.cancel().catch(() => {}); };
    signal?.addEventListener('abort', cancelReader, { once: true });
    let receivedBytes = 0;
    try {
      abortIfNeeded(signal);
      const bytes = new Uint8Array(pack.downloadBytes);
      onProgress({ receivedBytes, totalBytes: pack.downloadBytes, phase: 'downloading' });
      for (;;) {
        abortIfNeeded(signal);
        const { done, value } = await reader.read();
        abortIfNeeded(signal);
        if (done) break;
        if (!(value instanceof Uint8Array) || receivedBytes + value.byteLength > pack.downloadBytes) throw new Error('언어팩 파일 크기를 확인하지 못했어요.');
        bytes.set(value, receivedBytes);
        receivedBytes += value.byteLength;
        onProgress({ receivedBytes, totalBytes: pack.downloadBytes, phase: 'downloading' });
      }
      if (receivedBytes !== pack.downloadBytes) throw new Error('언어팩 파일 크기를 확인하지 못했어요.');
      onProgress({ receivedBytes, totalBytes: pack.downloadBytes, phase: 'verifying' });
      const digest = await this.cryptoImpl.subtle.digest('SHA-256', bytes);
      abortIfNeeded(signal);
      const sha256 = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      if (sha256 !== pack.sha256) throw new Error('언어팩 파일 검증에 실패했어요.');
      onProgress({ receivedBytes, totalBytes: pack.downloadBytes, phase: 'storing' });
      await this.cache.installAndSelect(pack, bytes, { signal });
      abortIfNeeded(signal);
    } catch (error) {
      await reader.cancel().catch(() => {});
      throw error;
    } finally {
      signal?.removeEventListener('abort', cancelReader);
      reader.releaseLock();
    }
  }
}

module.exports = { WIFI_RECOMMEND_BYTES, abortIfNeeded, formatPackSize, normalizeCatalog, matchesInstalled, LanguagePackCache, LanguagePackService };
