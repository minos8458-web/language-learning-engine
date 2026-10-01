const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash, createHmac, webcrypto } = require('node:crypto');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createGuestTokenCodec, parseGuestSigningKey } = require('../src/server/guestTokenCodec');
const { createGuestAuthService } = require('../src/server/guestAuthService');
const { createPostgresGuestHost } = require('../src/server/postgresGuestHost');
const { createLearningFlowHttpServer } = require('../src/server/learningFlowHttpServer');
const { startLearningApi } = require('../scripts/serve-learning-api');
const { InProcessLearningFlowTransport } = require('../src/transport/inProcessLearningFlowTransport');
const { HttpLearningFlowTransport } = require('../src/client/httpLearningFlowTransport');
const { LearningSessionController } = require('../src/client/learningSessionController');

// Public deterministic test material, never a default production key.
const KEY = createHash('sha256').update('public synthetic LLE guest key fixture').digest();
const USER_ID = '11111111-1111-4111-8111-111111111111';
const AUTH_ID = '22222222-2222-4222-8222-222222222222';
const PRIVATE = 'SQL password=synthetic-secret; token=synthetic-private-value';
const START = Date.parse('2026-10-01T12:00:00Z');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function syntheticPool() {
  const users = new Map(), queries = [];
  return {
    users, queries,
    async query(sql, values) {
      queries.push({ sql, values });
      if (/^INSERT INTO users/.test(sql.trim())) {
        assert.match(sql, /auth_provider, auth_identifier, display_name, timezone, converted_at/);
        assert.match(sql, /VALUES \(\$1, 'GUEST', \$2, NULL, \$3, NULL\)/);
        assert.equal(values.length, 3);
        assert.match(values[0], UUID); assert.match(values[1], UUID);
        assert.notEqual(values[0], values[1]);
        assert.equal(users.has(values[0]), false);
        users.set(values[0], { user_id: values[0], auth_identifier: values[1], auth_provider: 'GUEST', timezone: values[2] });
        return { rows: [{ user_id: values[0] }] };
      }
      assert.match(sql, /WHERE user_id = \$1 AND auth_provider = 'GUEST' AND auth_identifier = \$2/);
      const row = users.get(values[0]);
      return { rows: row?.auth_provider === 'GUEST' && row.auth_identifier === values[1] ? [{ user_id: row.user_id }] : [] };
    },
  };
}

function codec(options = {}) {
  return createGuestTokenCodec({ signingKey: KEY, now: () => START, tokenTtlSeconds: 60, ...options });
}

function signRaw(header, payload, key = KEY) {
  const input = `${Buffer.from(header).toString('base64url')}.${Buffer.from(payload).toString('base64url')}`;
  return `${input}.${createHmac('sha256', key).update(input).digest('base64url')}`;
}

async function fixture(t, options = {}) {
  const pool = options.pool || syntheticPool();
  const auth = createGuestAuthService({ pool, signingKey: KEY, now: () => START, ...options.authOptions });
  const calls = [];
  const transport = {
    startSession: async (...args) => {
      calls.push(['session', ...args]);
      return { next_action: args[2] ? 'IDLE' : 'CONVERSATION' };
    },
    startExplicitStudy: async (...args) => { calls.push(['study', ...args]); return { state: 'INTRODUCED' }; },
  };
  const server = createLearningFlowHttpServer({ ...auth, transport, ...options.serverOptions });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    const closed = once(server, 'close'); server.close(); server.closeAllConnections(); await closed;
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const guest = async (init = {}) => {
    const response = await fetch(baseUrl + '/auth/guest', { method: 'POST', ...init });
    return { status: response.status, headers: response.headers, body: await response.json() };
  };
  return { pool, auth, transport, calls, server, baseUrl, guest };
}

test('HS256 발급 결과를 별도의 WebCrypto HMAC API로 확인한다', async () => {
  const c = codec();
  const issued = c.issue(USER_ID, AUTH_ID);
  const parts = issued.accessToken.split('.');
  const key = await webcrypto.subtle.importKey('raw', KEY, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  assert.equal(await webcrypto.subtle.verify('HMAC', key, Buffer.from(parts[2], 'base64url'), Buffer.from(parts.slice(0, 2).join('.'))), true);
  assert.deepEqual(JSON.parse(Buffer.from(parts[0], 'base64url')), { alg: 'HS256', typ: 'lle-guest+jwt' });
  assert.deepEqual(c.verify(issued.accessToken), {
    iss: 'lle-guest', aud: 'lle-learning-api', sub: USER_ID, jti: AUTH_ID, iat: START / 1000, exp: START / 1000 + 60,
  });
  assert.equal(issued.expiresAt, '2026-10-01T12:01:00.000Z');
});

test('변조·잘못된 키·padding·과대·누락된 JWT는 검증되지 않는다', () => {
  const c = codec();
  const valid = c.issue(USER_ID, AUTH_ID).accessToken;
  const parts = valid.split('.');
  const changedPayload = Buffer.from(JSON.stringify({ ...c.verify(valid), sub: AUTH_ID })).toString('base64url');
  const differentKey = Buffer.from(KEY); differentKey[0] ^= 255;
  const tokens = [null, undefined, '', 'a.b.c', valid + '.extra', 'x'.repeat(4097), valid + '=',
    `${parts[0]}.${changedPayload}.${parts[2]}`, `${parts[0]}.${parts[1]}.AAAA`,
    codec({ signingKey: differentKey }).issue(USER_ID, AUTH_ID).accessToken];
  for (const token of tokens) assert.equal(c.verify(token), null);
});

test('알고리즘 none·다른 typ·임의 kid/JWK 헤더를 받아들이지 않는다', () => {
  const c = codec(), issued = c.issue(USER_ID, AUTH_ID).accessToken;
  const payload = Buffer.from(issued.split('.')[1], 'base64url').toString('utf8');
  for (const header of [
    { alg: 'none', typ: 'lle-guest+jwt' }, { alg: 'RS256', typ: 'lle-guest+jwt' },
    { alg: 'HS256', typ: 'JWT' }, { alg: 'HS256', typ: 'lle-guest+jwt', kid: '../synthetic-key' },
    { alg: 'HS256', typ: 'lle-guest+jwt', jwk: { k: KEY.toString('base64url') } },
  ]) assert.equal(c.verify(signRaw(JSON.stringify(header), payload)), null);
});

test('서명된 토큰도 잘못된 issuer/audience·식별자·시간·추가 필드면 거절한다', () => {
  const c = codec(), token = c.issue(USER_ID, AUTH_ID).accessToken;
  const header = Buffer.from(token.split('.')[0], 'base64url').toString('utf8');
  const valid = c.verify(token);
  for (const patch of [
    { iss: 'another-service' }, { aud: 'another-app' }, { sub: 'invalid' }, { jti: null },
    { iat: valid.iat + 1 }, { iat: -1 }, { exp: valid.exp + 1 }, { exp: valid.iat },
    { exp: String(valid.exp) }, { exp: null }, { exp: valid.exp + 0.5 }, { extra: true },
  ]) assert.equal(c.verify(signRaw(header, JSON.stringify({ ...valid, ...patch }))), null);
});

test('중복 claim·비정상 JSON·UTF-8·배열 형식은 서명이 맞아도 거절한다', () => {
  const c = codec(), token = c.issue(USER_ID, AUTH_ID).accessToken;
  const header = Buffer.from(token.split('.')[0], 'base64url').toString('utf8');
  const payload = Buffer.from(token.split('.')[1], 'base64url').toString('utf8');
  const duplicate = payload.replace('{', '{"sub":"' + AUTH_ID + '",');
  for (const data of [duplicate, ' ' + payload, '[]', 'null', '{', Buffer.from([0xff, 0xfe])]) {
    assert.equal(c.verify(signRaw(header, data)), null);
  }
});

test('만료 경계에 도달하면 거절하고 발급 키의 외부 메모리 변경에 영향을 받지 않는다', () => {
  const externalKey = Buffer.from(KEY);
  let time = START;
  const c = codec({ signingKey: externalKey, now: () => time });
  const token = c.issue(USER_ID, AUTH_ID).accessToken;
  externalKey.fill(0);
  time += 59999; assert.equal(c.verify(token).sub, USER_ID);
  time += 1; assert.equal(c.verify(token), null);
});

test('키·TTL·시계·식별자 오류는 발급 전에 닫힌다', () => {
  for (const options of [
    {}, { signingKey: 'unsafe-password' }, { signingKey: Buffer.alloc(31) },
    { signingKey: KEY, tokenTtlSeconds: 0 }, { signingKey: KEY, tokenTtlSeconds: 2592001 },
    { signingKey: KEY, tokenTtlSeconds: Infinity }, { signingKey: KEY, now: 1 },
  ]) assert.throws(() => createGuestTokenCodec(options), TypeError);
  assert.throws(() => codec({ now: () => NaN }).issue(USER_ID, AUTH_ID), TypeError);
  assert.throws(() => codec().issue('invalid', AUTH_ID), TypeError);
  assert.throws(() => codec().issue(USER_ID, 'invalid'), TypeError);
});

test('키 환경값은 정확한 32-byte base64url만 받고 원문을 오류에 노출하지 않는다', () => {
  assert.deepEqual(parseGuestSigningKey(KEY.toString('base64url')), KEY);
  for (const value of [undefined, '', PRIVATE, KEY.toString('base64url') + '=', 'A'.repeat(42), 'A'.repeat(44)]) {
    assert.throws(() => parseGuestSigningKey(value), (error) => {
      assert.equal(error.message.includes(PRIVATE), false);
      return error instanceof TypeError;
    });
  }
});

test('기존 users 컬럼과 서버 UUID만 저장하고 정상 저장 결과 뒤에 자격을 반환한다', async () => {
  const pool = syntheticPool();
  const auth = createGuestAuthService({ pool, signingKey: KEY, now: () => START, defaultTimezone: 'Asia/Seoul' });
  const first = await auth.createGuest();
  const second = await auth.createGuest();
  assert.notEqual(first.user_id, second.user_id);
  assert.equal(first.token_type, 'Bearer');
  assert.match(first.user_id, UUID);
  assert.equal(pool.users.get(first.user_id).timezone, 'Asia/Seoul');
  assert.equal(pool.users.size, 2);
  assert.ok(pool.queries.every((q) => !q.sql.includes('target_language') && !q.sql.includes('progress')));
  assert.equal(await auth.resolveUserId(first.access_token), first.user_id);
  assert.equal(await auth.resolveUserId(second.access_token), second.user_id);
});

test('키·timezone·pool 설정 오류나 발급 시계 실패로 사용자 행을 만들지 않는다', async () => {
  const pool = syntheticPool();
  for (const options of [
    { pool }, { pool, signingKey: KEY, defaultTimezone: 'invalid-zone' },
    { pool, signingKey: KEY, defaultTimezone: '+09:00' }, { pool: {}, signingKey: KEY },
  ]) assert.throws(() => createGuestAuthService(options));
  const auth = createGuestAuthService({ pool, signingKey: KEY, now: () => NaN });
  await assert.rejects(auth.createGuest());
  assert.equal(pool.queries.length, 0);
});

test('취소된 요청으로 새 INSERT나 사용자 조회를 시작하지 않는다', async () => {
  const pool = syntheticPool();
  const auth = createGuestAuthService({ pool, signingKey: KEY, now: () => START });
  const signal = AbortSignal.abort();
  await assert.rejects(auth.createGuest({ signal }));
  await assert.rejects(auth.resolveUserId(codec().issue(USER_ID, AUTH_ID).accessToken, { signal }));
  assert.equal(pool.queries.length, 0);
});

test('이미 삭제·전환되었거나 guest identifier가 바뀐 토큰은 거절한다', async () => {
  const pool = syntheticPool();
  const auth = createGuestAuthService({ pool, signingKey: KEY, now: () => START });
  const guest = await auth.createGuest(), row = pool.users.get(guest.user_id);
  pool.users.delete(guest.user_id);
  assert.equal(await auth.resolveUserId(guest.access_token), null);
  pool.users.set(row.user_id, { ...row, auth_provider: 'EMAIL' });
  assert.equal(await auth.resolveUserId(guest.access_token), null);
  pool.users.set(row.user_id, { ...row, auth_identifier: AUTH_ID });
  assert.equal(await auth.resolveUserId(guest.access_token), null);
});

test('변조·만료 토큰으로 DB에 조회하지 않는다', async () => {
  const pool = syntheticPool(); let time = START;
  const auth = createGuestAuthService({ pool, signingKey: KEY, tokenTtlSeconds: 60, now: () => time });
  const guest = await auth.createGuest();
  const before = pool.queries.length;
  assert.equal(await auth.resolveUserId(guest.access_token + '='), null);
  time += 60000;
  assert.equal(await auth.resolveUserId(guest.access_token), null);
  assert.equal(pool.queries.length, before);
});

test('사용자 조회 도중 만료된 토큰도 학습 사용자로 반환하지 않는다', async () => {
  const pool = syntheticPool(); let time = START;
  const auth = createGuestAuthService({ pool, signingKey: KEY, tokenTtlSeconds: 1, now: () => time });
  const guest = await auth.createGuest();
  const query = pool.query.bind(pool);
  pool.query = async (...args) => { const result = await query(...args); time += 1000; return result; };
  assert.equal(await auth.resolveUserId(guest.access_token), null);
});

test('저장 완료·올바른 user_id 반환 전에는 토큰을 응답하지 않는다', async () => {
  const gate = deferred(), entered = deferred();
  let released = false;
  const auth = createGuestAuthService({ signingKey: KEY, now: () => START, pool: {
    query: async (_sql, values) => { entered.resolve(); await gate.promise; return { rows: [{ user_id: values[0] }] }; },
  } });
  const pending = auth.createGuest().then((value) => { released = true; return value; });
  await entered.promise;
  assert.equal(released, false);
  gate.resolve();
  assert.match((await pending).user_id, UUID);
  for (const result of [{ rows: [] }, { rows: [{ user_id: USER_ID }] }, {}, { rows: [{ user_id: USER_ID }, { user_id: USER_ID }] }]) {
    const broken = createGuestAuthService({ signingKey: KEY, now: () => START, pool: { query: async () => result } });
    await assert.rejects(broken.createGuest());
  }
});

test('빈 POST와 빈 JSON에서 게스트를 발급하고 no-store·닫힌 응답 필드를 보존한다', async (t) => {
  const f = await fixture(t);
  for (const init of [{}, { headers: { 'Content-Type': 'application/json' }, body: '{}' }]) {
    const result = await f.guest(init);
    assert.equal(result.status, 200);
    assert.equal(result.body.status, 'ok');
    assert.deepEqual(Object.keys(result.body.data).sort(), ['access_token', 'expires_at', 'token_type', 'user_id']);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(result.headers.get('access-control-allow-origin'), null);
    assert.equal(await f.auth.resolveUserId(result.body.data.access_token), result.body.data.user_id);
  }
  assert.equal(f.pool.users.size, 2);
});

test('HTTP 발급한 실제 서명 토큰으로 기존 앱 전송과 대화 확인을 이어간다', async (t) => {
  const f = await fixture(t);
  const { data } = (await f.guest()).body;
  const client = new HttpLearningFlowTransport({ baseUrl: f.baseUrl, getAccessToken: () => data.access_token });
  const controller = new LearningSessionController({ transport: client, userId: AUTH_ID, language: 'VI' });
  await controller.start();
  await controller.acknowledgeConversationBoundary();
  assert.equal(controller.getState().currentScreen.kind, 'IDLE');
  assert.deepEqual(await client.startExplicitStudy(AUTH_ID, 'VI_NODE_A'), { state: 'INTRODUCED' });
  assert.deepEqual(f.calls, [['session', data.user_id, 'VI', false], ['session', data.user_id, 'VI', true], ['study', data.user_id, 'VI_NODE_A']]);
  assert.equal(f.pool.users.size, 1);
});

test('가입 입력으로 식별자·timezone을 지정할 수 없고 잘못된 JSON/media를 거절한다', async (t) => {
  const f = await fixture(t);
  for (const body of [{ user_id: USER_ID }, { auth_identifier: AUTH_ID }, { timezone: 'Asia/Seoul' }, [], null]) {
    const result = await f.guest({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(result.status, 400);
    assert.equal(result.body.error_code, undefined);
  }
  assert.equal((await f.guest({ headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await f.guest({ headers: { 'Content-Type': 'text/plain' }, body: '{}' })).status, 415);
  assert.equal((await f.guest({ body: Buffer.from('{}') })).status, 415);
  assert.equal(f.pool.users.size, 0);
});

test('게스트 요청도 크기·method·정확한 경로 제한을 적용한다', async (t) => {
  const f = await fixture(t, { serverOptions: { maxBodyBytes: 12 } });
  assert.equal((await f.guest({ headers: { 'Content-Type': 'application/json' }, body: ' '.repeat(13) })).status, 413);
  const wrong = await f.guest({ method: 'GET' });
  assert.equal(wrong.status, 405); assert.equal(wrong.headers.get('allow'), 'POST');
  for (const route of ['/auth/guest?user_id=' + USER_ID, '/auth/convert', '/auth/refresh']) {
    const response = await fetch(f.baseUrl + route, { method: 'POST' });
    assert.equal(response.status, 404); await response.text();
  }
  assert.equal(f.pool.users.size, 0);
});

test('만료·변조·삭제된 토큰은 HTTP 401이며 엔진과 새 게스트 생성으로 넘어가지 않는다', async (t) => {
  let time = START;
  const f = await fixture(t, { authOptions: { tokenTtlSeconds: 1, now: () => time } });
  const data = (await f.guest()).body.data;
  for (const token of [data.access_token + '=', data.access_token]) {
    if (token === data.access_token) time += 1000;
    const response = await fetch(f.baseUrl + '/flow/start-session', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: '{"language":"VI"}',
    });
    assert.equal(response.status, 401); assert.equal((await response.json()).error_code, undefined);
  }
  time = START;
  f.pool.users.delete(data.user_id);
  const client = new HttpLearningFlowTransport({ baseUrl: f.baseUrl, getAccessToken: () => data.access_token });
  const controller = new LearningSessionController({ transport: client, userId: data.user_id, language: 'VI' });
  const state = await controller.start();
  assert.equal(state.requestStatus, 'ERROR'); assert.equal(state.currentScreen, null);
  assert.equal(f.calls.length, 0);
  assert.equal(f.pool.queries.filter((q) => /^INSERT/.test(q.sql.trim())).length, 1);
});

test('가입·조회 DB 실패는 일반 503으로 닫히며 내부 진단·새 엔진 코드를 노출하지 않는다', async (t) => {
  const f = await fixture(t);
  const data = (await f.guest()).body.data;
  f.pool.query = async () => { throw Object.assign(new Error(PRIVATE), { code: 'CONTRACT_VIOLATION' }); };
  const failed = await f.guest();
  assert.equal(failed.status, 503); assert.equal(failed.body.error_code, undefined);
  const response = await fetch(f.baseUrl + '/flow/start-session', {
    method: 'POST', headers: { Authorization: 'Bearer ' + data.access_token, 'Content-Type': 'application/json' }, body: '{"language":"VI"}',
  });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.error_code, undefined);
  assert.equal(JSON.stringify([failed.body, body]).includes('synthetic-secret'), false);
  assert.equal(f.calls.length, 0);
});

test('미연결·잘못된 발급 콜백 결과를 가짜 토큰이나 정상 학습으로 바꾸지 않는다', async (t) => {
  for (const createGuest of [undefined, async () => null, async () => ({ access_token: PRIVATE })]) {
    const f = await fixture(t, { serverOptions: { createGuest } });
    const result = await f.guest();
    assert.equal(result.status, 503); assert.equal(result.body.error_code, undefined);
    assert.equal(JSON.stringify(result.body).includes(PRIVATE), false);
    assert.equal(f.pool.users.size, 0);
  }
  assert.throws(() => createLearningFlowHttpServer({ createGuest: 'unsafe' }), TypeError);
});

test('HTTP 시간 제한 뒤 완료된 INSERT를 rollback으로 보고하거나 발급을 재전송하지 않는다', { timeout: 5000 }, async (t) => {
  const pool = syntheticPool(), entered = deferred(), gate = deferred(), finished = deferred();
  const query = pool.query.bind(pool);
  pool.query = async (...args) => { entered.resolve(); await gate.promise; return query(...args); };
  const auth = createGuestAuthService({ pool, signingKey: KEY, now: () => START });
  const f = await fixture(t, { pool, serverOptions: {
    operationTimeoutMs: 80,
    createGuest: async (context) => { try { return await auth.createGuest(context); } finally { finished.resolve(); } },
  } });
  const pending = f.guest();
  await entered.promise;
  const response = await pending;
  assert.equal(response.status, 503); assert.equal(response.body.data, undefined);
  gate.resolve(); await finished.promise; await new Promise(setImmediate);
  assert.equal(pool.users.size, 1);
  assert.equal(pool.queries.length, 1);
  assert.equal(f.calls.length, 0);
});

test('PostgreSQL 호스트 factory는 기존 엔진 전송·인증·pool 종료를 같은 연결에 묶는다', async () => {
  const pool = syntheticPool(); let closed = 0;
  pool.end = async () => { closed++; };
  const host = createPostgresGuestHost({ pool, signingKey: KEY, now: () => START });
  assert.ok(host.transport instanceof InProcessLearningFlowTransport);
  assert.equal(host.transport.pool, pool);
  const guest = await host.createGuest();
  assert.equal(await host.resolveUserId(guest.access_token), guest.user_id);
  await host.onClose(); assert.equal(closed, 1);
});

test('CLI 공통 실행 함수가 발급 콜백과 호스트 종료 hook을 연결한다', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lle-synthetic-guest-host-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const modulePath = path.join(dir, 'host.cjs');
  const expires = new Date(START + 60000).toISOString();
  fs.writeFileSync(modulePath, `module.exports = {
    createGuest: async () => ({ user_id: ${JSON.stringify(USER_ID)}, access_token: 'synthetic-host-token', token_type: 'Bearer', expires_at: ${JSON.stringify(expires)} }),
    closed: 0, onClose: async () => { module.exports.closed++; }
  };`);
  let log = '';
  const server = await startLearningApi({ port: 0, hostModulePath: modulePath, output: { write: (s) => { log += s; } } });
  t.after(() => { if (server.listening) { server.close(); server.closeAllConnections(); } });
  const response = await fetch(`http://127.0.0.1:${server.address().port}/auth/guest`, { method: 'POST' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.user_id, USER_ID);
  assert.equal(log.includes('synthetic-host-token'), false);
  assert.match(log, /POST \/auth\/guest/);
  const close = once(server, 'close'); server.close(); server.closeAllConnections(); await close;
  await new Promise(setImmediate);
  assert.equal(require(modulePath).closed, 1);
});

test('기본 CLI의 게스트 미연결과 명시 호스트의 키 미설정은 발급되지 않는다', { timeout: 5000 }, async (t) => {
  const f = await fixture(t, { serverOptions: { createGuest: undefined } });
  assert.equal((await f.guest()).status, 503);
  const env = { ...process.env, LLE_API_HOST_MODULE: path.resolve(__dirname, '../scripts/postgres-guest-host.js'), LLE_API_PORT: '0' };
  delete env.LLE_GUEST_SIGNING_KEY;
  const child = spawn(process.execPath, [path.resolve(__dirname, '../scripts/serve-learning-api.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => { if (child.exitCode === null) child.kill('SIGTERM'); });
  let stdout = '', stderr = '';
  child.stdout.on('data', (s) => { stdout += s; }); child.stderr.on('data', (s) => { stderr += s; });
  const [code] = await once(child, 'close');
  assert.equal(code, 1); assert.equal(stdout, '');
  assert.match(stderr, /시작할 수 없습니다/);
  assert.equal(stderr.includes('LLE_GUEST_SIGNING_KEY'), false);
});
