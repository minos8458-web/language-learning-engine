const http = require('node:http');
const {
  assertLearningFlowTransport,
  CapacityAdmissionConflictError,
} = require('../client/learningFlowTransportContract');

const PUBLIC_ERRORS = Object.freeze({
  INVALID_ID: [404, '요청한 학습 항목을 찾을 수 없습니다.'],
  MISSING_REQUIRED_FIELD: [400, '필수 입력이 누락되었습니다.'],
  OUT_OF_RANGE_VALUE: [400, '입력 범위를 확인해 주세요.'],
  UNAUTHORIZED_CALLER: [403, '이 요청에 대한 권한이 없습니다.'],
  CONTRACT_VIOLATION: [422, '요청 형식을 확인해 주세요.'],
});
const CAPACITY_MESSAGE = 'active Grammar Node limit 초과: 최신 학습 상태를 다시 확인해 주세요.';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROUTES = new Set(['/flow/start-session', '/flow/start-explicit-study', '/auth/guest']);

// HTTP framing/configuration failures are not new engine error codes.
class HttpBoundaryError extends Error {
  constructor(statusCode, errorCode) {
    super('HTTP request rejected');
    this.statusCode = statusCode;
    this.code = errorCode;
  }
}

function contractError(code) {
  return new HttpBoundaryError(PUBLIC_ERRORS[code][0], code);
}

function positiveInteger(value, name, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > max) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

function headerValues(request, name) {
  // Keep duplicates visible even on runtimes that truncate parsed header collections.
  const values = [];
  for (let i = 0; i < request.rawHeaders.length; i += 2) {
    if (request.rawHeaders[i].toLowerCase() === name) values.push(request.rawHeaders[i + 1]);
  }
  return values;
}

function bearerToken(request) {
  const values = headerValues(request, 'authorization');
  if (values.length !== 1) throw new HttpBoundaryError(401);
  const match = /^Bearer ([\x21-\x7e]+)$/i.exec(values[0]);
  if (!match) throw new HttpBoundaryError(401);
  return match[1];
}

function checkBodyHeaders(request, maxBodyBytes, allowEmpty = false) {
  const types = headerValues(request, 'content-type');
  if (!(allowEmpty && types.length === 0) && (types.length !== 1 ||
      !/^application\/json(?:\s*;\s*charset\s*=\s*(?:"utf-8"|utf-8))?$/i.test(types[0]))) {
    throw new HttpBoundaryError(415);
  }
  const encodings = headerValues(request, 'content-encoding');
  if (encodings.length && (encodings.length !== 1 || encodings[0].toLowerCase() !== 'identity')) {
    throw new HttpBoundaryError(415);
  }
  const length = request.headers['content-length'];
  if (length !== undefined && Number(length) > maxBodyBytes) throw new HttpBoundaryError(413);
}

function readJson(request, maxBodyBytes, signal, allowEmpty = false) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const cleanup = () => {
      request.removeListener('data', onData);
      request.removeListener('end', onEnd);
      request.removeListener('error', onError);
      signal.removeEventListener('abort', onAbort);
    };
    const fail = (error) => { cleanup(); request.resume(); reject(error); };
    const onAbort = () => fail(signal.reason);
    const onError = () => fail(new HttpBoundaryError(400));
    const onData = (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) return fail(new HttpBoundaryError(413));
      chunks.push(chunk);
    };
    const onEnd = () => {
      cleanup();
      try {
        if (!request.complete) throw new Error('incomplete request');
        if (size === 0 && allowEmpty) return resolve({});
        if (allowEmpty && headerValues(request, 'content-type').length === 0) throw new HttpBoundaryError(415);
        const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
        const data = JSON.parse(text);
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('not an object');
        resolve(data);
      } catch (error) {
        reject(error instanceof HttpBoundaryError ? error : new HttpBoundaryError(400));
      }
    };
    request.on('data', onData);
    request.once('end', onEnd);
    request.once('error', onError);
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) onAbort();
  });
}

function validateInput(route, body) {
  const session = route === '/flow/start-session';
  const allowed = session ? ['language', 'conversation_boundary_acknowledged'] : ['node_id'];
  if (Object.keys(body).some((key) => !allowed.includes(key))) {
    throw contractError('CONTRACT_VIOLATION');
  }
  const required = session ? 'language' : 'node_id';
  if (!Object.hasOwn(body, required)) throw contractError('MISSING_REQUIRED_FIELD');
  if (typeof body[required] !== 'string') throw contractError('CONTRACT_VIOLATION');
  if (session) {
    if (!/^[A-Z]{2}$/.test(body.language)) throw contractError('OUT_OF_RANGE_VALUE');
    if (Object.hasOwn(body, 'conversation_boundary_acknowledged') &&
        typeof body.conversation_boundary_acknowledged !== 'boolean') {
      throw contractError('CONTRACT_VIOLATION');
    }
  }
}

// Observe late rejection as well as resolution; a deadline never replays an engine call.
function withinDeadline(promise, signal) {
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', onAbort);
    });
    if (signal.aborted) onAbort();
  });
}

function sendJson(response, statusCode, body) {
  if (response.destroyed || response.writableEnded) return;
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(statusCode >= 400 ? { Connection: 'close' } : {}),
  });
  response.end(payload);
}

function publicFailure(error, explicitStudy) {
  if (explicitStudy && error instanceof CapacityAdmissionConflictError) {
    return [422, { status: 'error', error_code: 'CONTRACT_VIOLATION', message: CAPACITY_MESSAGE }];
  }
  const known = error instanceof Error && Object.hasOwn(PUBLIC_ERRORS, error.code);
  if (known) {
    const [statusCode, message] = PUBLIC_ERRORS[error.code];
    return [statusCode, { status: 'error', error_code: error.code, message }];
  }
  const statusCode = error instanceof HttpBoundaryError ? error.statusCode : 503;
  const message = statusCode === 401 ? '인증을 확인해 주세요.' :
    statusCode === 503 ? '학습 서버를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.' :
      'HTTP 요청 형식을 확인해 주세요.';
  return [statusCode, { status: 'error', message }];
}

function createLearningFlowHttpServer({
  transport,
  resolveUserId,
  createGuest,
  maxBodyBytes = 8192,
  operationTimeoutMs = 10000,
  requestTimeoutMs = 15000,
} = {}) {
  if (transport !== undefined) assertLearningFlowTransport(transport);
  if (resolveUserId !== undefined && typeof resolveUserId !== 'function') {
    throw new TypeError('resolveUserId must be a function');
  }
  if (createGuest !== undefined && typeof createGuest !== 'function') throw new TypeError('createGuest must be a function');
  positiveInteger(maxBodyBytes, 'maxBodyBytes');
  positiveInteger(operationTimeoutMs, 'operationTimeoutMs', 2147483647);
  positiveInteger(requestTimeoutMs, 'requestTimeoutMs', 2147483647);

  async function handleRequest(request, response) {
    const abort = new AbortController();
    const stop = () => abort.abort(new HttpBoundaryError(503));
    const onClose = () => { if (!response.writableFinished) stop(); };
    // IncomingMessage errors must stay observed after body listeners have been removed.
    request.on('error', stop);
    response.on('error', stop);
    request.once('aborted', stop);
    response.once('close', onClose);
    const timer = setTimeout(stop, operationTimeoutMs);
    timer.unref();
    let explicitStudy = false;
    try {
      // No query or absolute URL is accepted, including user_id in the URL.
      if (!ROUTES.has(request.url)) throw new HttpBoundaryError(404);
      explicitStudy = request.url === '/flow/start-explicit-study';
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        throw new HttpBoundaryError(405);
      }
      if (request.url === '/auth/guest') {
        if (!createGuest) throw new HttpBoundaryError(503);
        checkBodyHeaders(request, maxBodyBytes, true);
        const body = await readJson(request, maxBodyBytes, abort.signal, true);
        abort.signal.throwIfAborted();
        if (Object.keys(body).length !== 0) throw new HttpBoundaryError(400);
        let guest;
        try { guest = await withinDeadline(createGuest({ signal: abort.signal }), abort.signal); }
        catch { throw new HttpBoundaryError(503); }
        abort.signal.throwIfAborted();
        if (!guest || typeof guest !== 'object' || Array.isArray(guest) || Object.keys(guest).length !== 4 ||
            typeof guest.user_id !== 'string' || !UUID_PATTERN.test(guest.user_id) ||
            typeof guest.access_token !== 'string' || !guest.access_token || guest.access_token.length > 4096 ||
            /[\x00-\x20\x7f]/.test(guest.access_token) || guest.token_type !== 'Bearer' ||
            typeof guest.expires_at !== 'string' || !Number.isFinite(Date.parse(guest.expires_at))) {
          throw new HttpBoundaryError(503);
        }
        sendJson(response, 200, { status: 'ok', data: guest });
        return;
      }
      const token = bearerToken(request);
      if (!transport || !resolveUserId) throw new HttpBoundaryError(503);
      checkBodyHeaders(request, maxBodyBytes);
      const body = await readJson(request, maxBodyBytes, abort.signal);
      abort.signal.throwIfAborted();
      let userId;
      try {
        userId = await withinDeadline(resolveUserId(token, { signal: abort.signal }), abort.signal);
      } catch {
        // Authentication provider exceptions are never engine or capacity errors.
        throw new HttpBoundaryError(503);
      }
      abort.signal.throwIfAborted();
      if (userId === null || userId === undefined) throw new HttpBoundaryError(401);
      if (typeof userId !== 'string' || !UUID_PATTERN.test(userId)) throw new HttpBoundaryError(503);
      validateInput(request.url, body);
      // Identity is supplied solely by the trusted host's token verifier.
      const result = await withinDeadline(explicitStudy ?
        transport.startExplicitStudy(userId, body.node_id) :
        transport.startSession(userId, body.language, body.conversation_boundary_acknowledged), abort.signal);
      abort.signal.throwIfAborted();
      if (!result || typeof result !== 'object' || Array.isArray(result)) throw new HttpBoundaryError(503);
      sendJson(response, 200, { status: 'ok', data: result });
    } catch (error) {
      sendJson(response, ...publicFailure(error, explicitStudy));
      request.resume();
    } finally {
      clearTimeout(timer);
      request.removeListener('aborted', stop);
      response.removeListener('close', onClose);
    }
  }

  const server = http.createServer({
    maxHeaderSize: 16384,
    headersTimeout: Math.min(requestTimeoutMs, 15000),
    requestTimeout: requestTimeoutMs,
  }, (request, response) => {
    handleRequest(request, response).catch(() => response.destroy());
  });
  server.maxHeadersCount = 32;
  return server;
}

module.exports = { createLearningFlowHttpServer };
