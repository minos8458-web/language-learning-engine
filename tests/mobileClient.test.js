const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const { HttpLearningFlowTransport } = require('../src/client/httpLearningFlowTransport');
const { LearningSessionController } = require('../src/client/learningSessionController');
const { CapacityAdmissionConflictError } = require('../src/client/learningFlowTransportContract');
const { mobileScreenModel, mountMobileSession } = require('../src/client/mobileSessionView');
const { parseHTML } = require('linkedom');
const { createPreviewTransport } = require('../mobile/previewTransport');
const { buildMobile } = require('../scripts/build-mobile');
const { createMobileServer } = require('../scripts/serve-mobile');

const TOKEN = 'synthetic-mobile-test-token';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const ok = (data) => Response.json({ status: 'ok', data });
const errorResponse = (code, message = '합성 오류', status = 422) => Response.json({ status: 'error', error_code: code, message }, { status });

function transportFor(fetchImpl, options = {}) {
  return new HttpLearningFlowTransport({ getAccessToken: () => TOKEN, fetchImpl, ...options });
}

test('HTTP 경로·토큰 헤더·acknowledgement를 유지하고 user_id를 전송하지 않는다', async () => {
  const calls = [];
  const transport = transportFor(async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return ok({ next_action: 'IDLE' });
  }, { baseUrl: 'https://learning.example/' });
  await transport.startSession(USER_ID, 'VI');
  await transport.startSession(USER_ID, 'VI', false);
  await transport.startSession(USER_ID, 'VI', true);
  assert.deepEqual(calls.map((call) => call.body), [
    { language: 'VI' },
    { language: 'VI', conversation_boundary_acknowledged: false },
    { language: 'VI', conversation_boundary_acknowledged: true },
  ]);
  for (const call of calls) {
    assert.equal(call.url, 'https://learning.example/flow/start-session');
    assert.equal(call.options.method, 'POST');
    assert.equal(call.options.headers.Authorization, `Bearer ${TOKEN}`);
    assert.equal(call.options.cache, 'no-store');
    assert.equal(call.options.redirect, 'error');
    assert.equal(call.options.credentials, 'omit');
    assert.equal(Object.hasOwn(call.body, 'user_id'), false);
  }
});

test('명시적 학습 시작에는 서버가 제안한 node_id만 보낸다', async () => {
  let observed;
  const transport = transportFor(async (url, options) => {
    observed = { url, body: JSON.parse(options.body) };
    return ok({ node_id: 'NODE_MOBILE_TEST_A', state: 'INTRODUCED' });
  });
  await transport.startExplicitStudy(USER_ID, 'NODE_MOBILE_TEST_A');
  assert.deepEqual(observed, { url: '/flow/start-explicit-study', body: { node_id: 'NODE_MOBILE_TEST_A' } });
});

test('다섯 서버 응답을 변경 없이 소비한다', async () => {
  const decisions = [
    { next_action: 'REVIEW', review_batch: [{ node_id: 'NODE_MOBILE_TEST_B' }, { node_id: 'NODE_MOBILE_TEST_A' }] },
    { next_action: 'NEW_GRAMMAR', node_id: 'NODE_MOBILE_TEST_A' },
    { next_action: 'INTERLEAVING', node_sequence: ['B', 'A', 'B', 'A'] },
    { next_action: 'CONVERSATION' },
    { next_action: 'IDLE' },
  ];
  for (const decision of decisions) {
    const transport = transportFor(async () => ok(decision));
    assert.deepEqual(await transport.startSession(USER_ID, 'VI'), decision);
  }
});

test('잘못된 성공 응답은 정상 학습 화면으로 통과하지 않는다', async () => {
  const invalid = [
    null, [], {},
    { next_action: 'UNKNOWN' },
    { next_action: 'IDLE', node_id: 'unexpected' },
    { next_action: 'NEW_GRAMMAR', node_id: '' },
    { next_action: 'REVIEW', review_batch: ['A'] },
    { next_action: 'INTERLEAVING', node_sequence: ['A', null] },
  ];
  for (const decision of invalid) {
    const transport = transportFor(async () => ok(decision));
    await assert.rejects(transport.startSession(USER_ID, 'VI'));
  }
});

test('세션 시작의 empty 응답과 일반 텍스트 오류를 성공으로 바꾸지 않는다', async () => {
  for (const response of [Response.json({ status: 'empty', data: null }), new Response('<html>오류</html>')]) {
    const transport = transportFor(async () => response);
    await assert.rejects(transport.startSession(USER_ID, 'VI'));
  }
});

test('토큰이 없거나 잘못되면 네트워크 호출을 하지 않는다', async () => {
  for (const token of [null, '', 'a\r\nInjected: value', 123]) {
    let called = false;
    const transport = transportFor(async () => { called = true; return ok({ next_action: 'IDLE' }); }, { getAccessToken: async () => token });
    await assert.rejects(transport.startSession(USER_ID, 'VI'));
    assert.equal(called, false);
  }
});

test('서버 진단과 토큰은 일반 오류 메시지에 포함하지 않는다', async () => {
  for (const fetchImpl of [
    async () => { throw new Error(`SQL connection password=${TOKEN}`); },
    async () => Response.json({ status: 'error', message: `SQL password=${TOKEN}` }, { status: 500 }),
  ]) {
    await assert.rejects(transportFor(fetchImpl).startSession(USER_ID, 'VI'), (error) => {
      assert.equal(error.message.includes(TOKEN), false);
      assert.equal(error.message.includes('SQL'), false);
      return true;
    });
  }
});

test('공개 오류 코드는 보존하고 원문 진단은 감춘다', async () => {
  for (const code of ['INVALID_ID', 'MISSING_REQUIRED_FIELD', 'OUT_OF_RANGE_VALUE', 'UNAUTHORIZED_CALLER', 'CONTRACT_VIOLATION']) {
    await assert.rejects(transportFor(async () => errorResponse(code, TOKEN)).startSession(USER_ID, 'VI'), (error) => {
      assert.equal(error.code, code);
      assert.equal(error.message.includes(TOKEN), false);
      return true;
    });
  }
});

test('인증 만료는 재생성·미리보기 대체·자동 재시도 없이 오류 화면이 된다', async () => {
  let calls = 0;
  const transport = transportFor(async () => { calls += 1; return errorResponse('INVALID_ID', TOKEN, 401); });
  const controller = new LearningSessionController({ transport, userId: USER_ID, language: 'VI' });
  const state = await controller.start();
  assert.equal(state.requestStatus, 'ERROR');
  assert.equal(state.currentScreen, null);
  assert.equal(state.error.message.includes(TOKEN), false);
  assert.equal(calls, 1);
});

test('capacity 오류만 기존 제어기의 최신 서버 판단 재조회로 연결한다', async () => {
  const calls = [];
  let starts = 0;
  const transport = transportFor(async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    if (url.endsWith('/start-explicit-study')) {
      return errorResponse('CONTRACT_VIOLATION', 'active Grammar Node limit 초과: 합성 capacity 충돌');
    }
    starts += 1;
    return ok(starts === 1 ? { next_action: 'NEW_GRAMMAR', node_id: 'NODE_MOBILE_TEST_A' } : { next_action: 'INTERLEAVING', node_sequence: ['B', 'A', 'B', 'A'] });
  });
  const controller = new LearningSessionController({ transport, userId: USER_ID, language: 'VI' });
  await controller.start();
  await controller.startProposedExplicitStudy();
  assert.deepEqual(calls.map((call) => call.url), ['/flow/start-session', '/flow/start-explicit-study', '/flow/start-session']);
  assert.equal(controller.getState().currentScreen.kind, 'INTERLEAVING');
});

test('일반 계약 위반은 capacity 오류로 재분류하지 않는다', async () => {
  let calls = 0;
  const transport = transportFor(async (url) => {
    calls += 1;
    return url.endsWith('/start-session') ? ok({ next_action: 'NEW_GRAMMAR', node_id: 'A' }) : errorResponse('CONTRACT_VIOLATION', '합성 다른 계약 위반');
  });
  const controller = new LearningSessionController({ transport, userId: USER_ID, language: 'VI' });
  await controller.start();
  await controller.startProposedExplicitStudy();
  assert.equal(controller.getState().requestStatus, 'ERROR');
  assert.equal(calls, 2);
  await assert.rejects(transport.startExplicitStudy(USER_ID, 'A'), (error) => !(error instanceof CapacityAdmissionConflictError));
});

test('대화 확인은 요청에 반영되고 새 제어기에서 초기화된다', async () => {
  const acknowledgements = [];
  const transport = transportFor(async (_url, options) => {
    const acknowledged = JSON.parse(options.body).conversation_boundary_acknowledged;
    acknowledgements.push(acknowledged);
    return ok({ next_action: acknowledged ? 'IDLE' : 'CONVERSATION' });
  });
  const first = new LearningSessionController({ transport, userId: USER_ID, language: 'VI' });
  await first.start();
  assert.equal(first.getState().currentScreen.kind, 'CONVERSATION_BOUNDARY');
  await first.acknowledgeConversationBoundary();
  assert.equal(first.getState().currentScreen.kind, 'IDLE');
  first.endSession();
  const next = new LearningSessionController({ transport, userId: USER_ID, language: 'VI' });
  await next.start();
  assert.deepEqual(acknowledgements, [false, true, false]);
});

test('시간이 초과된 HTTP 요청을 중단하고 정상 완료로 바꾸지 않는다', async () => {
  let aborted = false;
  const transport = transportFor((_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => { aborted = true; reject(new Error('합성 중단')); }, { once: true });
  }), { timeoutMs: 10 });
  await assert.rejects(transport.startSession(USER_ID, 'VI'));
  assert.equal(aborted, true);
});

test('화면 모델은 서버의 복습 순서와 교차 연습 중복을 유지한다', async () => {
  const transport = transportFor(async () => ok({ next_action: 'INTERLEAVING', node_sequence: ['B', 'A', 'B', 'A'] }));
  const controller = new LearningSessionController({ transport, userId: USER_ID, language: 'VI' });
  assert.equal(mobileScreenModel(controller.getState()).kind, 'HOME');
  const pending = controller.start();
  assert.equal(mobileScreenModel(controller.getState()).kind, 'LOADING');
  await pending;
  const model = mobileScreenModel(controller.getState());
  assert.deepEqual(model.nodeIds, ['B', 'A', 'B', 'A']);
  model.nodeIds.reverse();
  assert.deepEqual(controller.getState().currentScreen.nodeSequence, ['B', 'A', 'B', 'A']);
  const review = new LearningSessionController({ transport: transportFor(async () => ok({ next_action: 'REVIEW', review_batch: [{ node_id: 'B' }, { node_id: 'A' }] })), userId: USER_ID, language: 'VI' });
  assert.deepEqual(mobileScreenModel(await review.start()).nodeIds, ['B', 'A']);
});

test('오류·종료 화면에 학습 완료나 원문 진단을 표시하지 않는다', async () => {
  const controller = new LearningSessionController({ transport: transportFor(async () => { throw new Error(TOKEN); }), userId: USER_ID, language: 'VI' });
  const model = mobileScreenModel(await controller.start());
  assert.equal(model.kind, 'ERROR');
  assert.equal(JSON.stringify(model).includes(TOKEN), false);
  controller.endSession();
  assert.equal(mobileScreenModel(controller.getState()).kind, 'ENDED');
});

test('미리보기 선택을 명시적으로 했을 때만 합성 응답을 얻는다', async () => {
  const preview = new LearningSessionController({ transport: createPreviewTransport('conversation'), userId: USER_ID, language: 'VI' });
  assert.equal((await preview.start()).currentScreen.kind, 'CONVERSATION_BOUNDARY');
  assert.equal((await preview.acknowledgeConversationBoundary()).currentScreen.kind, 'IDLE');
  const failed = new LearningSessionController({ transport: createPreviewTransport('error'), userId: USER_ID, language: 'VI' });
  assert.equal((await failed.start()).requestStatus, 'ERROR');
});

test('브라우저 빌드에는 기존 제어기 원문과 클라이언트 모듈만 포함한다', (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lle-mobile-build-'));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  buildMobile(directory);
  const bundle = fs.readFileSync(path.join(directory, 'app.js'), 'utf8');
  const original = fs.readFileSync(path.join(__dirname, '../src/client/learningSessionController.js'), 'utf8');
  assert.equal(bundle.includes(original), true);
  assert.equal(bundle.includes("require('pg')"), false);
  assert.equal(bundle.includes('PGPASSWORD'), false);
  assert.equal(bundle.includes('evidenceRepository'), false);
  assert.deepEqual(fs.readdirSync(directory).sort(), ['app.js', 'icon.svg', 'index.html', 'lle-mobile-preview.html', 'styles.css']);
});

test('로컬 실행기는 공개 화면 파일만 제공하고 저장소·학습 API 쓰기를 노출하지 않는다', async (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lle-mobile-server-'));
  buildMobile(directory);
  const server = createMobileServer({ directory });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  context.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const index = await fetch(base + '/?preview=1');
  assert.equal(index.status, 200);
  assert.match(index.headers.get('content-type'), /text\/html/);
  assert.equal(index.headers.get('cache-control'), 'no-store');
  assert.match(await index.text(), /실제 학습 기록은 저장하지 않아요/);
  for (const file of ['/.env', '/PROJECT_VISION.md', '/src/client/learningSessionController.js', '/..%2f.env', '/lle-mobile-preview.html']) {
    assert.equal((await fetch(base + file)).status, 404);
  }
  assert.equal((await fetch(base + '/flow/start-session', { method: 'POST' })).status, 405);
  const head = await fetch(base + '/styles.css', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

// DOM 로직 검사다. 실제 브라우저 화면 크기·레이아웃 검증으로 분류하지 않는다.
const settle = () => new Promise((resolve) => setImmediate(resolve));

function createView(transport, options = {}) {
  const { document } = parseHTML('<!doctype html><html><body><main id="root"></main></body></html>');
  const root = document.getElementById('root');
  const view = mountMobileSession({
    root,
    createController: () => new LearningSessionController({ transport, userId: USER_ID, language: 'VI' }),
    ...options,
  });
  return { root, view };
}

test('실제 화면 렌더 함수가 다섯 서버 상태를 DOM으로 옮긴다', async () => {
  for (const [scene, kind] of [['review', 'REVIEW'], ['new', 'NEW_GRAMMAR'], ['interleaving', 'INTERLEAVING'], ['conversation', 'CONVERSATION_BOUNDARY'], ['idle', 'IDLE']]) {
    const { root, view } = createView(createPreviewTransport(scene), { preview: true });
    await view.refresh();
    assert.equal(root.dataset.screen, kind);
    assert.equal(root.querySelectorAll('h1').length, 1);
    assert.match(root.textContent, /실제 학습 기록은 저장하지 않아요/);
    if (kind === 'REVIEW' || kind === 'INTERLEAVING') assert.equal(root.querySelector('[data-action="unavailable"]').disabled, true);
    if (kind === 'IDLE') assert.equal(root.querySelectorAll('.node-item').length, 0);
    view.destroy();
  }
});

test('DOM에서도 교차 연습의 반복과 서버 순서를 그대로 유지한다', async () => {
  const { root, view } = createView({
    async startSession() { return { next_action: 'INTERLEAVING', node_sequence: ['B', 'A', 'B', 'A'] }; },
    async startExplicitStudy() {},
  });
  await view.refresh();
  assert.deepEqual([...root.querySelectorAll('.node-item')].map((item) => item.dataset.nodeId), ['B', 'A', 'B', 'A']);
  view.destroy();
});

test('노드 표시 문자열을 HTML로 실행하지 않고 텍스트로 표시한다', async () => {
  const label = '<img src="x" onerror="alert(1)">';
  const { root, view } = createView(createPreviewTransport('new'), { labelForNode: () => label });
  await view.refresh();
  assert.equal(root.querySelector('.node-label').textContent, label);
  assert.equal(root.querySelectorAll('img').length, 0);
  view.destroy();
});

test('학습 시작 버튼의 연속 클릭은 요청 하나이며 성공 후 같은 제안을 재전송하지 않는다', async () => {
  let admissionCalls = 0;
  let resolveAdmission;
  const { root, view } = createView({
    async startSession() { return { next_action: 'NEW_GRAMMAR', node_id: 'NODE_MOBILE_TEST_A' }; },
    startExplicitStudy() {
      admissionCalls += 1;
      return new Promise((resolve) => { resolveAdmission = resolve; });
    },
  });
  await view.refresh();
  const admission = root.querySelector('[data-action="admit"]');
  admission.click();
  admission.click();
  assert.equal(admissionCalls, 1);
  assert.equal(root.dataset.screen, 'LOADING');
  assert.equal(root.getAttribute('aria-busy'), 'true');
  resolveAdmission({ node_id: 'NODE_MOBILE_TEST_A', state: 'INTRODUCED' });
  await settle();
  assert.equal(root.querySelector('[data-action="admit"]').disabled, true);
  assert.equal(root.getAttribute('aria-busy'), 'false');
  assert.equal(admissionCalls, 1);
  view.destroy();
});

test('화면의 대화 확인과 새 세션 버튼이 false→true→false 요청을 보낸다', async () => {
  const acknowledgements = [];
  const { root, view } = createView({
    async startSession(_id, _language, acknowledged) {
      acknowledgements.push(acknowledged);
      return { next_action: acknowledged ? 'IDLE' : 'CONVERSATION' };
    },
    async startExplicitStudy() {},
  });
  await view.refresh();
  root.querySelector('[data-action="acknowledge"]').click();
  await settle();
  assert.equal(root.dataset.screen, 'IDLE');
  root.querySelector('[data-action="restart"]').click();
  await settle();
  assert.equal(root.dataset.screen, 'CONVERSATION_BOUNDARY');
  assert.deepEqual(acknowledgements, [false, true, false]);
  view.destroy();
});

test('연결 준비 전 화면은 비활성 버튼이며 네트워크를 호출하지 않는다', async () => {
  let calls = 0;
  const { root, view } = createView({
    async startSession() { calls += 1; return { next_action: 'IDLE' }; },
    async startExplicitStudy() {},
  }, { connected: false });
  assert.equal(root.querySelector('[data-action="start"]').disabled, true);
  await view.refresh();
  assert.equal(calls, 0);
  assert.equal(root.dataset.screen, 'HOME');
  view.destroy();
});

test('늦게 도착한 응답이 종료·제거된 화면을 다시 만들지 않는다', async () => {
  let resolveStart;
  const { root, view } = createView({
    startSession() { return new Promise((resolve) => { resolveStart = resolve; }); },
    async startExplicitStudy() {},
  });
  const pending = view.refresh();
  assert.equal(root.dataset.screen, 'LOADING');
  view.destroy();
  resolveStart({ next_action: 'IDLE' });
  await pending;
  assert.equal(root.childNodes.length, 0);
});

test('전송 실패는 오류 화면과 수동 재시도로 이어지고 원문 진단을 노출하지 않는다', async () => {
  let calls = 0;
  const { root, view } = createView({
    async startSession() {
      calls += 1;
      if (calls === 1) throw new Error(`DB password=${TOKEN}`);
      return { next_action: 'IDLE' };
    },
    async startExplicitStudy() {},
  });
  await view.refresh();
  assert.equal(root.dataset.screen, 'ERROR');
  assert.equal(root.textContent.includes(TOKEN), false);
  assert.equal(calls, 1);
  root.querySelector('[data-action="start"]').click();
  await settle();
  assert.equal(root.dataset.screen, 'IDLE');
  assert.equal(calls, 2);
  view.destroy();
});

function runBundle(context, search, { standalone = false, config } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lle-mobile-bootstrap-'));
  context.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  buildMobile(directory);
  const file = standalone ? 'lle-mobile-preview.html' : 'index.html';
  const { document } = parseHTML(fs.readFileSync(path.join(directory, file), 'utf8'));
  const window = { location: { search }, LLE_APP_CONFIG: config };
  let fetchCalls = 0;
  const code = standalone ? document.querySelector('script').textContent : fs.readFileSync(path.join(directory, 'app.js'), 'utf8');
  vm.runInNewContext(code, {
    window, document, URL, URLSearchParams, structuredClone, AbortController,
    setTimeout, clearTimeout,
    fetch: () => { fetchCalls += 1; throw new Error('합성 네트워크 차단'); },
  });
  return { root: document.getElementById('learning-root'), document, window, fetchCalls: () => fetchCalls };
}

test('최종 브라우저 번들의 기본 진입은 연결 준비 화면이며 합성 학습을 시작하지 않는다', (context) => {
  const app = runBundle(context, '');
  assert.equal(app.root.dataset.screen, 'HOME');
  assert.equal(app.root.querySelector('[data-action="start"]').disabled, true);
  assert.equal(app.document.getElementById('preview-controls').hidden, true);
  assert.equal(app.document.getElementById('preview-notice').hidden, true);
  assert.equal(app.fetchCalls(), 0);
  assert.equal(typeof app.window.LLEMobile.mountMobileSession, 'function');
});

test('최종 번들의 명시적 미리보기는 안내와 합성 대화 경계 확인 흐름을 실행한다', async (context) => {
  const app = runBundle(context, '?preview=1&scene=conversation');
  await settle();
  assert.equal(app.document.getElementById('preview-notice').hidden, false);
  assert.equal(app.root.dataset.screen, 'CONVERSATION_BOUNDARY');
  app.root.querySelector('[data-action="acknowledge"]').click();
  await settle();
  assert.equal(app.root.dataset.screen, 'IDLE');
  assert.equal(app.fetchCalls(), 0);
});

test('다운로드 HTML은 코드·스타일·아이콘을 포함하고 CSP 해시와 네트워크 차단을 선언한다', (context) => {
  const app = runBundle(context, '', { standalone: true });
  const { document } = app;
  assert.equal(document.querySelectorAll('script').length, 1);
  assert.equal(document.querySelectorAll('script[src], link[rel="stylesheet"], iframe').length, 0);
  assert.equal(document.querySelectorAll('style').length, 1);
  assert.match(document.querySelector('link[rel="icon"]').getAttribute('href'), /^data:image\/svg\+xml;base64,/);
  for (const anchor of document.querySelectorAll('a[href]')) assert.match(anchor.getAttribute('href'), /^#/);
  const policy = document.querySelector('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  for (const tag of ['script', 'style']) {
    const hash = createHash('sha256').update(document.querySelector(tag).textContent).digest('base64');
    assert.equal(policy.includes(`${tag}-src 'sha256-${hash}'`), true);
  }
  assert.match(policy, /connect-src 'none'/);
  assert.match(document.querySelector('meta[name="lle-source-commit"]').getAttribute('content'), /^(?:[a-f0-9]{40}(?: \(작업 파일 변경 있음\))?|미확인)$/);
  assert.ok(document.getElementById('preview-guide'));
  assert.equal(app.fetchCalls(), 0);
});

test('다운로드 파일은 query와 호스트 인증 설정에 관계없이 명시된 합성 미리보기만 사용한다', async (context) => {
  let tokenReads = 0;
  const app = runBundle(context, '?preview=0&scene=new', {
    standalone: true,
    config: { baseUrl: 'https://learning.example', getAccessToken: () => { tokenReads += 1; return TOKEN; } },
  });
  await settle();
  assert.equal(app.root.dataset.screen, 'NEW_GRAMMAR');
  assert.equal(app.document.getElementById('preview-notice').hidden, false);
  assert.equal(app.document.getElementById('preview-controls').hidden, false);
  assert.equal(app.root.textContent.includes('실제 학습 기록은 저장하지 않아요'), true);
  assert.equal(tokenReads, 0);
  assert.equal(app.fetchCalls(), 0);
});

function selectScene(app, scene) {
  const selector = app.document.getElementById('preview-scene');
  const option = [...selector.options].find((item) => item.value === scene);
  for (const item of selector.options) item.selected = false;
  option.selected = true;
  selector.dispatchEvent(new app.document.defaultView.Event('change'));
}

test('다운로드 빌드의 장면 선택은 일곱 화면과 교차 연습의 반복 순서를 유지한다', async (context) => {
  const app = runBundle(context, '', { standalone: true });
  for (const [scene, kind] of [['review', 'REVIEW'], ['new', 'NEW_GRAMMAR'], ['interleaving', 'INTERLEAVING'], ['conversation', 'CONVERSATION_BOUNDARY'], ['idle', 'IDLE'], ['error', 'ERROR'], ['home', 'HOME']]) {
    selectScene(app, scene);
    await settle();
    assert.equal(app.root.dataset.screen, kind);
    if (scene === 'interleaving') {
      assert.deepEqual([...app.root.querySelectorAll('.node-item')].map((item) => item.dataset.nodeId), [
        'NODE_MOBILE_PREVIEW_A', 'NODE_MOBILE_PREVIEW_B', 'NODE_MOBILE_PREVIEW_C',
        'NODE_MOBILE_PREVIEW_A', 'NODE_MOBILE_PREVIEW_B', 'NODE_MOBILE_PREVIEW_C',
      ]);
    }
  }
  assert.equal(app.fetchCalls(), 0);
});

test('다운로드 빌드의 학습 시작·대화 확인·새 세션·합성 오류 재시도는 서버를 호출하지 않는다', async (context) => {
  const app = runBundle(context, '?scene=new', { standalone: true });
  await settle();
  app.root.querySelector('[data-action="admit"]').click();
  await settle();
  assert.equal(app.root.querySelector('[data-action="admit"]').disabled, true);
  selectScene(app, 'conversation');
  await settle();
  app.root.querySelector('[data-action="acknowledge"]').click();
  await settle();
  assert.equal(app.root.dataset.screen, 'IDLE');
  app.root.querySelector('[data-action="restart"]').click();
  await settle();
  assert.equal(app.root.dataset.screen, 'CONVERSATION_BOUNDARY');
  selectScene(app, 'error');
  await settle();
  app.root.querySelector('[data-action="start"]').click();
  await settle();
  assert.equal(app.root.dataset.screen, 'ERROR');
  assert.equal(app.fetchCalls(), 0);
});
