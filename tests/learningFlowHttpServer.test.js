const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const { createLearningFlowHttpServer } = require('../src/server/learningFlowHttpServer');
const { startLearningApi } = require('../scripts/serve-learning-api');
const { HttpLearningFlowTransport } = require('../src/client/httpLearningFlowTransport');
const { LearningSessionController } = require('../src/client/learningSessionController');
const { CapacityAdmissionConflictError } = require('../src/client/learningFlowTransportContract');

const TOKEN = 'synthetic-api-test-token';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const ATTACKER_ID = '22222222-2222-4222-8222-222222222222';
const SESSION = '/flow/start-session';
const STUDY = '/flow/start-explicit-study';
const PRIVATE_DIAGNOSTIC = `SQL password=${TOKEN}; provider detail`;

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

async function fixture(t, options = {}) {
  const calls = [];
  const authCalls = [];
  const server = createLearningFlowHttpServer({
    resolveUserId: async (token) => {
      authCalls.push(token);
      return token === TOKEN ? USER_ID : null;
    },
    transport: {
      startSession: async (...args) => { calls.push(['session', ...args]); return { next_action: 'IDLE' }; },
      startExplicitStudy: async (...args) => { calls.push(['study', ...args]); return { state: 'INTRODUCED' }; },
    },
    ...options,
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    const closed = once(server, 'close');
    server.close();
    server.closeAllConnections();
    await closed;
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const request = async (route = SESSION, body = { language: 'VI' }, init = {}) => {
    const response = await fetch(baseUrl + route, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      ...init,
    });
    return { status: response.status, headers: response.headers, body: await response.json() };
  };
  const client = new HttpLearningFlowTransport({ baseUrl, getAccessToken: () => TOKEN });
  return { server, baseUrl, request, client, calls, authCalls };
}

function rawRequest(baseUrl, { headers, chunks = [], method = 'POST', route = SESSION } = {}) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(headers)) {
      // Raw header arrays do not get an implicit Host field from http.request.
      headers = [...headers, 'Host', new URL(baseUrl).host, 'Content-Length',
        String(chunks.reduce((size, chunk) => size + Buffer.byteLength(chunk), 0))];
    }
    const request = http.request(baseUrl + route, { method, headers }, (response) => {
      const data = [];
      response.on('data', (chunk) => data.push(chunk));
      response.once('error', reject);
      response.once('end', () => resolve({
        status: response.statusCode,
        text: Buffer.concat(data).toString('utf8'),
      }));
    });
    request.once('error', reject);
    for (const chunk of chunks) request.write(chunk);
    request.end();
  });
}

test('HTTP의 두 경로에서 토큰으로 확인한 사용자만 기존 전송에 전달한다', async (t) => {
  const f = await fixture(t);
  assert.deepEqual(await f.client.startSession(ATTACKER_ID, 'VI'), { next_action: 'IDLE' });
  assert.deepEqual(await f.client.startExplicitStudy(ATTACKER_ID, 'VI_NODE_A'), { state: 'INTRODUCED' });
  assert.deepEqual(f.calls, [['session', USER_ID, 'VI', undefined], ['study', USER_ID, 'VI_NODE_A']]);
  assert.deepEqual(f.authCalls, [TOKEN, TOKEN]);
});

test('다섯 서버 분기와 복습 필드·순서·interleaving 중복을 HTTP로 보존한다', async (t) => {
  const decisions = [
    { next_action: 'REVIEW', review_batch: [
      { node_id: 'B', state: 'STUDYING', next_review_at: '2026-10-01T00:00:00Z', overdue_by: 100, priority: 2, reason: 'synthetic' },
      { node_id: 'A', state: 'PRACTICING', next_review_at: '2026-09-30T00:00:00Z', overdue_by: 200, priority: 1, reason: 'synthetic' },
    ] },
    { next_action: 'NEW_GRAMMAR', node_id: 'A' },
    { next_action: 'INTERLEAVING', node_sequence: ['B', 'A', 'B', 'A', 'B', 'A'] },
    { next_action: 'CONVERSATION' },
    { next_action: 'IDLE' },
  ];
  let index = 0;
  const f = await fixture(t, { transport: {
    startSession: async () => decisions[index++], startExplicitStudy: async () => ({ state: 'INTRODUCED' }),
  } });
  for (const decision of decisions) assert.deepEqual(await f.client.startSession(USER_ID, 'VI'), decision);
});

test('ack 생략·false·true를 그대로 전달하고 대화 확인은 새 앱 세션에서 초기화한다', async (t) => {
  const acks = [];
  const f = await fixture(t, { transport: {
    startSession: async (_userId, _language, ack) => {
      acks.push(ack);
      return { next_action: ack ? 'IDLE' : 'CONVERSATION' };
    },
    startExplicitStudy: async () => ({ state: 'INTRODUCED' }),
  } });
  await f.client.startSession(USER_ID, 'VI');
  const first = new LearningSessionController({ transport: f.client, userId: USER_ID, language: 'VI' });
  await first.start();
  await first.acknowledgeConversationBoundary();
  first.endSession();
  const next = new LearningSessionController({ transport: f.client, userId: USER_ID, language: 'VI' });
  await next.start();
  assert.deepEqual(acks, [undefined, false, true, false]);
  assert.equal(next.getState().currentScreen.kind, 'CONVERSATION_BOUNDARY');
});

test('응답은 JSON·no-store이며 학습 결과 외의 봉투 필드를 추가하지 않는다', async (t) => {
  const f = await fixture(t);
  const response = await f.request();
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok', data: { next_action: 'IDLE' } });
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('누락·만료·잘못된 인증에는 엔진 호출 없이 401을 반환한다', async (t) => {
  const f = await fixture(t);
  for (const token of [undefined, 'expired', '', 'Bearer ' + TOKEN + ' extra', 'Basic ' + TOKEN]) {
    const headers = { 'Content-Type': 'application/json' };
    if (token !== undefined) headers.Authorization = token === 'expired' ? 'Bearer expired' : token;
    const result = await f.request(SESSION, { language: 'VI' }, { headers });
    assert.equal(result.status, 401);
    assert.deepEqual(Object.keys(result.body).sort(), ['message', 'status']);
  }
  assert.equal(f.calls.length, 0);
});

test('중복 Authorization 헤더는 헤더 수 제한 밖의 중복까지 거절한다', async (t) => {
  const f = await fixture(t);
  for (const padding of [0, 40]) {
    const headers = ['Authorization', `Bearer ${TOKEN}`, 'Content-Type', 'application/json'];
    for (let i = 0; i < padding; i++) headers.push(`X-Synthetic-${i}`, 'value');
    headers.push('Authorization', 'Bearer second-synthetic-token');
    const result = await rawRequest(f.baseUrl, { headers, chunks: [JSON.stringify({ language: 'VI' })] });
    // Newer Node versions reject the whole header set before the route handler.
    assert.ok([401, 431].includes(result.status), `unexpected status ${result.status}`);
  }
  assert.equal(f.calls.length, 0);
  assert.equal(f.authCalls.length, 0);
});

test('본문 user_id·추가 키로 인증된 사용자를 바꿀 수 없다', async (t) => {
  const f = await fixture(t);
  for (const [route, body] of [
    [SESSION, { language: 'VI', user_id: ATTACKER_ID }],
    [SESSION, { language: 'VI', userId: ATTACKER_ID }],
    [STUDY, { node_id: 'A', user_id: ATTACKER_ID }],
    [SESSION, JSON.parse('{"language":"VI","__proto__":{"user_id":"synthetic"}}')],
  ]) {
    const result = await f.request(route, body);
    assert.equal(result.status, 422);
    assert.equal(result.body.error_code, 'CONTRACT_VIOLATION');
  }
  assert.equal(f.calls.length, 0);
});

test('URL 사용자 지정·내부 엔진 경로·아직 없는 외부 경로를 열지 않는다', async (t) => {
  const f = await fixture(t);
  for (const route of [SESSION + '?user_id=' + ATTACKER_ID, '/progress/record-attempt', '/auth/convert', '/flow/submit-attempt', '/flow/start-session/']) {
    const result = await f.request(route);
    assert.equal(result.status, 404);
    assert.equal(result.body.error_code, undefined);
  }
  const wrongMethod = await f.request(SESSION, null, { method: 'GET', body: undefined });
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get('allow'), 'POST');
  assert.equal(f.calls.length, 0);
});

test('필수 입력·언어 형식·ack 타입 오류는 기존 공개 코드로 거절한다', async (t) => {
  const f = await fixture(t);
  const cases = [
    [SESSION, {}, 400, 'MISSING_REQUIRED_FIELD'],
    [STUDY, {}, 400, 'MISSING_REQUIRED_FIELD'],
    [SESSION, { language: null }, 422, 'CONTRACT_VIOLATION'],
    [SESSION, { language: 'vi' }, 400, 'OUT_OF_RANGE_VALUE'],
    [SESSION, { language: 'en-US' }, 400, 'OUT_OF_RANGE_VALUE'],
    [SESSION, { language: 'VI', conversation_boundary_acknowledged: null }, 422, 'CONTRACT_VIOLATION'],
    [SESSION, { language: 'VI', conversation_boundary_acknowledged: 'false' }, 422, 'CONTRACT_VIOLATION'],
    [STUDY, { node_id: 1 }, 422, 'CONTRACT_VIOLATION'],
  ];
  for (const [route, body, status, code] of cases) {
    const result = await f.request(route, body);
    assert.equal(result.status, status);
    assert.equal(result.body.error_code, code);
  }
  assert.equal(f.calls.length, 0);
});

test('JSON이 아닌 본문·배열·null·잘못된 UTF-8을 HTTP 오류로 거절한다', async (t) => {
  const f = await fixture(t);
  for (const body of ['{', '', '[]', 'null', '"VI"', Buffer.from([123, 34, 0xff, 34, 58, 49, 125])]) {
    const result = await f.request(SESSION, null, { body });
    assert.equal(result.status, 400);
    assert.equal(result.body.error_code, undefined);
  }
  assert.equal(f.calls.length, 0);
});

test('지원하지 않는 media type·압축·중복 Content-Type을 거절한다', async (t) => {
  const f = await fixture(t);
  for (const headers of [
    { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'text/plain' },
    { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
    { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json; charset=latin1' },
  ]) assert.equal((await f.request(SESSION, { language: 'VI' }, { headers })).status, 415);
  const duplicate = await rawRequest(f.baseUrl, {
    headers: ['Authorization', `Bearer ${TOKEN}`, 'Content-Type', 'application/json', 'Content-Type', 'text/plain'],
    chunks: ['{"language":"VI"}'],
  });
  assert.equal(duplicate.status, 415);
  assert.equal(f.calls.length, 0);
});

test('Content-Length·chunked·다중바이트 본문에 같은 바이트 상한을 적용한다', async (t) => {
  const f = await fixture(t, { maxBodyBytes: 24 });
  assert.equal((await f.request()).status, 200);
  const body = JSON.stringify({ language: 'VI', extra: '한글한글' });
  assert.equal((await f.request(SESSION, null, { body })).status, 413);
  const result = await rawRequest(f.baseUrl, {
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    chunks: ['{"language":"VI",', '"extra":"', '한글한글', '"}'],
  });
  assert.equal(result.status, 413);
  assert.equal(JSON.parse(result.text).error_code, undefined);
  assert.equal(f.calls.length, 1);
});

for (const [code, status] of [
  ['INVALID_ID', 404], ['MISSING_REQUIRED_FIELD', 400], ['OUT_OF_RANGE_VALUE', 400],
  ['UNAUTHORIZED_CALLER', 403], ['CONTRACT_VIOLATION', 422],
]) {
  test(`기존 엔진 ${code}는 ${status}로 매핑하고 내부 진단을 숨긴다`, async (t) => {
    const error = Object.assign(new Error(PRIVATE_DIAGNOSTIC), { code });
    const f = await fixture(t, { transport: {
      startSession: async () => { throw error; }, startExplicitStudy: async () => { throw error; },
    } });
    for (const [route, body] of [[SESSION, { language: 'VI' }], [STUDY, { node_id: 'A' }]]) {
      const result = await f.request(route, body);
      assert.equal(result.status, status);
      assert.equal(result.body.error_code, code);
      assert.equal(JSON.stringify(result.body).includes(TOKEN), false);
      assert.equal(result.body.message.includes('SQL'), false);
    }
    await assert.rejects(f.client.startSession(USER_ID, 'VI'), (error) => error.code === code);
  });
}

test('검증된 capacity 거절만 앱의 최신 판단 재조회 한 번으로 연결한다', async (t) => {
  const calls = [];
  const cause = Object.assign(new Error('active Grammar Node limit 초과: ' + PRIVATE_DIAGNOSTIC), { code: 'CONTRACT_VIOLATION' });
  const f = await fixture(t, { transport: {
    startSession: async (...args) => {
      calls.push(['session', ...args]);
      return calls.length === 1 ? { next_action: 'NEW_GRAMMAR', node_id: 'A' } :
        { next_action: 'INTERLEAVING', node_sequence: ['B', 'A', 'B', 'A'] };
    },
    startExplicitStudy: async (...args) => { calls.push(['study', ...args]); throw new CapacityAdmissionConflictError(cause); },
  } });
  const controller = new LearningSessionController({ transport: f.client, userId: ATTACKER_ID, language: 'VI' });
  await controller.start();
  await controller.startProposedExplicitStudy();
  assert.deepEqual(calls.map((call) => call[0]), ['session', 'study', 'session']);
  assert.ok(calls.every((call) => call[1] === USER_ID));
  assert.equal(controller.getState().currentScreen.kind, 'INTERLEAVING');
  assert.deepEqual(controller.getState().currentScreen.nodeSequence, ['B', 'A', 'B', 'A']);
  const response = await f.request(STUDY, { node_id: 'A' });
  assert.equal(response.status, 422);
  assert.match(response.body.message, /^active Grammar Node limit 초과:/);
  assert.equal(response.body.message.includes(TOKEN), false);
});

test('일반 오류의 capacity 같은 진단 문자열을 재조회 표식으로 쓰지 않는다', async (t) => {
  let calls = 0;
  const error = Object.assign(new Error('active Grammar Node limit 초과: ' + PRIVATE_DIAGNOSTIC), { code: 'CONTRACT_VIOLATION' });
  const f = await fixture(t, { transport: {
    startSession: async () => { calls++; return { next_action: 'NEW_GRAMMAR', node_id: 'A' }; },
    startExplicitStudy: async () => { calls++; throw error; },
  } });
  const controller = new LearningSessionController({ transport: f.client, userId: USER_ID, language: 'VI' });
  await controller.start();
  await controller.startProposedExplicitStudy();
  assert.equal(calls, 2);
  assert.equal(controller.getState().requestStatus, 'ERROR');
  await assert.rejects(f.client.startExplicitStudy(USER_ID, 'A'), (error) => !(error instanceof CapacityAdmissionConflictError));
});

test('기술 실패·잘못된 내부 결과는 503이며 앱의 IDLE이나 empty로 바꾸지 않는다', async (t) => {
  let result;
  const f = await fixture(t, { transport: {
    startSession: async () => { if (result instanceof Error) throw result; return result; },
    startExplicitStudy: async () => ({ state: 'INTRODUCED' }),
  } });
  const circular = {}; circular.self = circular;
  for (result of [new Error(PRIVATE_DIAGNOSTIC), null, [], circular]) {
    const response = await f.request();
    assert.equal(response.status, 503);
    assert.equal(response.body.error_code, undefined);
    assert.equal(JSON.stringify(response.body).includes(TOKEN), false);
    const controller = new LearningSessionController({ transport: f.client, userId: USER_ID, language: 'VI' });
    const state = await controller.start();
    assert.equal(state.requestStatus, 'ERROR');
    assert.equal(state.currentScreen, null);
  }
});

test('인증·전송 중 하나라도 미연결이면 엔진 호출 없이 닫힌다', async (t) => {
  for (const missing of ['transport', 'resolveUserId']) {
    const f = await fixture(t, { [missing]: undefined });
    const response = await f.request();
    assert.equal(response.status, 503);
    assert.equal(response.body.error_code, undefined);
    assert.equal(f.calls.length, 0);
    assert.equal(f.authCalls.length, 0);
  }
});

test('인증 provider 예외·잘못된 사용자 결과를 엔진 오류로 분류하지 않는다', async (t) => {
  let mode;
  const f = await fixture(t, { resolveUserId: async () => {
    if (mode instanceof Error) throw mode;
    return mode;
  } });
  const capacity = new CapacityAdmissionConflictError(Object.assign(new Error(PRIVATE_DIAGNOSTIC), { code: 'CONTRACT_VIOLATION' }));
  for (mode of [new Error(PRIVATE_DIAGNOSTIC), capacity, ATTACKER_ID + '-invalid', { userId: USER_ID }]) {
    const response = await f.request(STUDY, { node_id: 'A' });
    assert.equal(response.status, 503);
    assert.equal(response.body.error_code, undefined);
    assert.equal(JSON.stringify(response.body).includes(TOKEN), false);
  }
  assert.equal(f.calls.length, 0);
});

test('시간이 지난 인증 결과로 뒤늦게 엔진을 호출하지 않는다', { timeout: 5000 }, async (t) => {
  const entered = deferred(), gate = deferred(), finished = deferred();
  let signal;
  const f = await fixture(t, { operationTimeoutMs: 80, resolveUserId: async (_token, context) => {
    signal = context.signal; entered.resolve();
    await gate.promise;
    finished.resolve();
    return USER_ID;
  } });
  const pending = f.request();
  await entered.promise;
  const response = await pending;
  assert.equal(response.status, 503);
  assert.equal(signal.aborted, true);
  gate.resolve();
  await finished.promise;
  await new Promise(setImmediate);
  assert.equal(f.calls.length, 0);
});

test('클라이언트 연결 종료 후 완료된 인증으로 엔진을 시작하지 않는다', { timeout: 5000 }, async (t) => {
  const entered = deferred(), aborted = deferred(), gate = deferred(), finished = deferred();
  const f = await fixture(t, { resolveUserId: async (_token, { signal }) => {
    signal.addEventListener('abort', () => aborted.resolve(), { once: true });
    entered.resolve();
    await gate.promise;
    finished.resolve();
    return USER_ID;
  } });
  const request = http.request(f.baseUrl + SESSION, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  });
  request.on('error', () => {});
  request.end('{"language":"VI"}');
  await entered.promise;
  request.destroy();
  await aborted.promise;
  gate.resolve();
  await finished.promise;
  await new Promise(setImmediate);
  assert.equal(f.calls.length, 0);
});

test('완료되지 않은 본문을 시간 제한으로 닫고 인증·엔진을 호출하지 않는다', { timeout: 5000 }, async (t) => {
  const f = await fixture(t, { operationTimeoutMs: 80 });
  const result = await new Promise((resolve, reject) => {
    const request = http.request(f.baseUrl + SESSION, { method: 'POST', headers: {
      Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Content-Length': 100,
    } }, (response) => {
      response.resume();
      response.once('end', () => resolve(response.statusCode));
    });
    request.once('error', reject);
    request.write('{');
  });
  assert.equal(result, 503);
  assert.equal(f.authCalls.length, 0);
  assert.equal(f.calls.length, 0);
});

test('이미 호출한 명시적 학습의 늦은 실패를 관찰하고 자동 재전송하지 않는다', { timeout: 5000 }, async (t) => {
  const gate = deferred(), entered = deferred();
  let calls = 0;
  const f = await fixture(t, { operationTimeoutMs: 80, transport: {
    startSession: async () => ({ next_action: 'IDLE' }),
    startExplicitStudy: async () => { calls++; entered.resolve(); return gate.promise; },
  } });
  const pending = f.request(STUDY, { node_id: 'A' });
  await entered.promise;
  assert.equal((await pending).status, 503);
  gate.reject(new Error(PRIVATE_DIAGNOSTIC));
  await assert.rejects(gate.promise);
  await new Promise(setImmediate);
  assert.equal(calls, 1);
});

test('잘못된 구성은 listen 전에 거절한다', () => {
  for (const options of [
    { resolveUserId: 'unsafe' }, { transport: {} }, { maxBodyBytes: 0 },
    { operationTimeoutMs: Infinity }, { operationTimeoutMs: 2147483648 }, { requestTimeoutMs: -1 },
  ]) assert.throws(() => createLearningFlowHttpServer(options), TypeError);
});

test('명시적인 합성 호스트 모듈을 주입하면 CLI 공통 실행 함수가 같은 경계를 연결한다', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lle-synthetic-api-host-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const modulePath = path.join(dir, 'host.cjs');
  fs.writeFileSync(modulePath, `module.exports = {
    resolveUserId: (token) => token === ${JSON.stringify(TOKEN)} ? ${JSON.stringify(USER_ID)} : null,
    transport: {
      startSession: async (userId) => ({ next_action: userId === ${JSON.stringify(USER_ID)} ? 'IDLE' : 'INVALID' }),
      startExplicitStudy: async () => ({ state: 'INTRODUCED' })
    }
  };`);
  let log = '';
  const server = await startLearningApi({ port: 0, hostModulePath: modulePath, output: { write: (text) => { log += text; } } });
  t.after(async () => {
    const closed = once(server, 'close'); server.close(); server.closeAllConnections(); await closed;
  });
  assert.equal(server.address().address, '127.0.0.1');
  assert.equal(log.includes(TOKEN), false);
  const client = new HttpLearningFlowTransport({
    baseUrl: `http://127.0.0.1:${server.address().port}`, getAccessToken: () => TOKEN,
  });
  assert.deepEqual(await client.startSession(ATTACKER_ID, 'VI'), { next_action: 'IDLE' });
});

test('실제 CLI는 기본 미연결 모드로 실행하며 SIGTERM으로 종료한다', { timeout: 5000 }, async (t) => {
  const env = { ...process.env, LLE_API_PORT: '0' };
  delete env.LLE_API_HOST_MODULE;
  const child = spawn(process.execPath, [path.resolve(__dirname, '../scripts/serve-learning-api.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => { if (child.exitCode === null) child.kill('SIGTERM'); });
  let stdout = '', stderr = '';
  child.stderr.on('data', (data) => { stderr += data; });
  const port = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', () => { if (!stdout.includes('127.0.0.1:')) reject(new Error('CLI exited before listen')); });
    child.stdout.on('data', (data) => {
      stdout += data;
      const match = /127\.0\.0\.1:(\d+)/.exec(stdout);
      if (match) resolve(Number(match[1]));
    });
  });
  const response = await fetch(`http://127.0.0.1:${port}${SESSION}`, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: '{"language":"VI"}',
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error_code, undefined);
  assert.match(stdout, /미연결/);
  const closed = once(child, 'close'); child.kill('SIGTERM');
  const [code] = await closed;
  assert.equal(code, 0);
  assert.equal(stderr, '');
});

test('CLI 설정 모듈 실패 로그에서 토큰·SQL 진단을 숨긴다', { timeout: 5000 }, async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lle-synthetic-api-error-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const modulePath = path.join(dir, 'host.cjs');
  fs.writeFileSync(modulePath, `throw new Error(${JSON.stringify(PRIVATE_DIAGNOSTIC)});`);
  const child = spawn(process.execPath, [path.resolve(__dirname, '../scripts/serve-learning-api.js')], {
    env: { ...process.env, LLE_API_HOST_MODULE: modulePath, LLE_API_PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => { if (child.exitCode === null) child.kill('SIGTERM'); });
  let stderr = '';
  child.stderr.on('data', (data) => { stderr += data; });
  const [code] = await once(child, 'close');
  assert.equal(code, 1);
  assert.match(stderr, /시작할 수 없습니다/);
  assert.equal(stderr.includes(TOKEN), false);
  assert.equal(stderr.includes('SQL'), false);
});
