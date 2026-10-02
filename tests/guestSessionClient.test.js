const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { once } = require('node:events');
const { createHash, webcrypto } = require('node:crypto');
const { parseHTML } = require('linkedom');
const { IDBFactory } = require('fake-indexeddb');
const { GuestSessionController } = require('../src/client/guestSessionController');
const { mountMobileGuest } = require('../src/client/mobileGuestView');
const { HttpLearningFlowTransport } = require('../src/client/httpLearningFlowTransport');
const { LearningSessionController } = require('../src/client/learningSessionController');
const { createGuestAuthService } = require('../src/server/guestAuthService');
const { createLearningFlowHttpServer } = require('../src/server/learningFlowHttpServer');
const { buildMobile } = require('../scripts/build-mobile');

const START = Date.parse('2026-10-02T12:00:00Z');
const USER_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ID = '22222222-2222-4222-8222-222222222222';
const TOKEN = 'synthetic-guest-client-token';
const PRIVATE = '합성 비공개 진단 token=' + TOKEN;
const ORIGIN = 'https://lle.example';
const guest = (expires = START + 86400000) => ({ user_id: USER_ID, access_token: TOKEN,
  token_type: 'Bearer', expires_at: new Date(expires).toISOString() });
const ok = (data) => Response.json({ status: 'ok', data });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const flush = () => new Promise((resolve) => setImmediate(resolve));

// 네이티브 보안 저장소가 아니다. 원자적인 내부 계약을 확인하는 합성 메모리 fixture다.
function store(initial = { kind: 'empty' }) {
  let record = structuredClone(initial);
  const calls = [];
  return {
    calls,
    current: () => structuredClone(record),
    persist(value) { record = structuredClone(value); },
    async read() { calls.push('read'); return structuredClone(record); },
    async beginCreation() {
      calls.push('begin');
      if (record.kind !== 'empty') return false;
      record = { kind: 'pending' }; return true;
    },
    async commitGuest(value) {
      calls.push('commit');
      if (record.kind !== 'pending' && !(record.kind === 'stored' &&
          JSON.stringify(record.guest) === JSON.stringify(value))) throw new Error(PRIVATE);
      record = { kind: 'stored', guest: structuredClone(value) };
    },
  };
}

function controller(guestStore, fetchImpl = async () => ok(guest()), options = {}) {
  return new GuestSessionController({ guestStore, fetchImpl, origin: ORIGIN, now: () => START, ...options });
}

function transport(auth, options = {}) {
  return new HttpLearningFlowTransport({ getAccessToken: () => auth.getAccessToken(),
    fetchImpl: auth.createFlowFetch(), ...options });
}

test('발급 표시와 토큰 저장 재확인 전에는 flow와 사용자 식별자를 열지 않는다', async () => {
  const s = store(), gate = deferred(), statuses = [], sent = [];
  const commit = s.commitGuest;
  s.commitGuest = async (value) => { await gate.promise; return commit(value); };
  const auth = controller(s, async (url, init) => {
    sent.push({ url, init }); assert.equal(s.current().kind, 'pending'); return ok(guest());
  });
  auth.subscribe((state) => statuses.push(state));
  const first = auth.start(), second = auth.start();
  assert.equal(first, second);
  await flush();
  assert.equal(auth.getState().status, 'SAVING');
  assert.equal(auth.getUserId(), null);
  assert.equal(await auth.getAccessToken(), null);
  await assert.rejects(transport(auth).startSession(USER_ID, 'VI'));
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, '/auth/guest');
  assert.equal(sent[0].init.method, 'POST');
  assert.equal(sent[0].init.body, '{}');
  assert.deepEqual(sent[0].init.headers, { 'Content-Type': 'application/json' });
  assert.equal(sent[0].init.cache, 'no-store');
  assert.equal(sent[0].init.credentials, 'omit');
  assert.equal(sent[0].init.redirect, 'error');
  assert.deepEqual(s.calls, ['read', 'begin', 'read']);
  gate.resolve(); await first;
  assert.equal(auth.getState().status, 'READY');
  assert.equal(auth.getUserId(), USER_ID);
  assert.equal(await auth.getAccessToken(), TOKEN);
  assert.deepEqual(s.calls, ['read', 'begin', 'read', 'commit', 'read']);
  assert.equal(JSON.stringify(statuses).includes(TOKEN), false);
  assert.deepEqual(Object.keys(auth.getState()).sort(), ['canRetry', 'status']);
  await auth.start(); assert.equal(sent.length, 1);
});

test('동시 제어기 두 개는 원자적 발급 표시를 공유해 POST 한 번만 보낸다', async () => {
  const s = store(), response = deferred(); let posts = 0;
  const fetchImpl = () => { posts += 1; return response.promise; };
  const a = controller(s, fetchImpl), b = controller(s, fetchImpl);
  const aStart = a.start(), bStart = b.start();
  await flush();
  assert.equal(posts, 1);
  assert.equal(b.getState().status, 'CREATION_UNCERTAIN');
  response.resolve(ok(guest())); await Promise.all([aStart, bStart]);
  assert.equal(a.getState().status, 'READY');
  await b.retryStorage(); assert.equal(b.getUserId(), USER_ID);
  assert.equal(posts, 1);
});

test('저장한 동일 게스트로 재실행하며 새 발급과 기록 변경을 하지 않는다', async () => {
  const s = store(); let posts = 0;
  const fetchImpl = async () => { posts += 1; return ok(guest()); };
  const first = controller(s, fetchImpl); await first.start(); first.dispose();
  const reopened = controller(s, fetchImpl); await reopened.start();
  assert.equal(reopened.getUserId(), USER_ID);
  assert.equal(await reopened.getAccessToken(), TOKEN);
  assert.equal(posts, 1);
  assert.deepEqual(s.current(), { kind: 'stored', guest: guest() });
});

test('저장 만료와 실행 중 시계 만료는 발급 없이 차단하고 기록을 보존한다', async () => {
  for (const expires of [START, START - 1]) {
    const s = store({ kind: 'stored', guest: guest(expires) }); let requests = 0;
    const auth = controller(s, () => { requests += 1; throw new Error(PRIVATE); });
    await auth.start(); await auth.retryStorage();
    assert.equal(auth.getState().status, 'EXPIRED');
    assert.equal(await auth.getAccessToken(), null);
    assert.equal(requests, 0); assert.equal(s.current().guest.expires_at, guest(expires).expires_at);
  }
  let time = START;
  const s = store({ kind: 'stored', guest: guest(START + 1) });
  const auth = controller(s, undefined, { now: () => time });
  await auth.start(); time += 1;
  assert.equal(await auth.getAccessToken(), null);
  assert.equal(auth.getState().status, 'EXPIRED');
  time = START; assert.equal(auth.getState().status, 'EXPIRED');
  assert.equal(s.current().kind, 'stored');
});

test('호스트 메서드와 HTTPS 주소가 불충분하면 저장이나 네트워크를 사용하지 않는다', async () => {
  for (const options of [
    { guestStore: undefined }, { guestStore: { read() {} } }, { baseUrl: 'http://lle.example' },
    { baseUrl: 'https://name:password@lle.example' }, { baseUrl: 'https://lle.example?token=synthetic' },
    { baseUrl: 'https://lle.example#fragment' }, { origin: 'https://lle.example/path' },
    { timeoutMs: 0 }, { fetchImpl: null },
  ]) {
    const s = store(); let requests = 0;
    const auth = controller(s, () => { requests += 1; throw new Error(PRIVATE); }, options);
    await auth.start(); await auth.retryStorage();
    assert.equal(auth.getState().status, 'HOST_UNAVAILABLE');
    assert.deepEqual(s.calls, []); assert.equal(requests, 0);
  }
});

test('손상·부분·추가 필드 기록은 empty로 해석하거나 재발급하지 않는다', async () => {
  const bad = [
    null, {}, { kind: 'unknown' }, { kind: 'empty', guest: guest() }, { kind: 'pending', version: 2 },
    { kind: 'stored', guest: { ...guest(), extra: true } },
    ...[{ user_id: 'bad' }, { access_token: '' }, { access_token: TOKEN + '\n' },
      { access_token: 'x'.repeat(4097) }, { token_type: 'Basic' }, { expires_at: 'bad' }]
      .map((patch) => ({ kind: 'stored', guest: { ...guest(), ...patch } })),
  ];
  for (const record of bad) {
    const s = store(record); let requests = 0;
    const auth = controller(s, () => { requests += 1; throw new Error(PRIVATE); });
    await auth.start(); await auth.retryStorage();
    assert.equal(auth.getState().status, 'STORAGE_ERROR');
    assert.equal(requests, 0);
    assert.deepEqual(s.current(), record);
    assert.equal(s.calls.includes('begin'), false);
  }
});

test('읽기 실패 뒤의 빈 기록 재확인은 새 발급을 시작하지 않는다', async () => {
  const s = store(), read = s.read; let fail = true, posts = 0;
  s.read = async () => { if (fail) throw new Error(PRIVATE); return read(); };
  const auth = controller(s, () => { posts += 1; return ok(guest()); });
  await auth.start(); assert.equal(auth.getState().status, 'STORAGE_ERROR');
  fail = false; await auth.retryStorage(); await auth.start();
  assert.equal(auth.getState().status, 'STORAGE_ERROR');
  assert.equal(posts, 0); assert.equal(s.current().kind, 'empty');
});

test('발급 표시 저장 실패·거짓 성공은 POST 전에 차단한다', async () => {
  for (const result of [false, true, 'true', new Error(PRIVATE)]) {
    const s = store(); let posts = 0;
    s.beginCreation = async () => { if (result instanceof Error) throw result; return result; };
    const auth = controller(s, () => { posts += 1; return ok(guest()); });
    await auth.start(); await auth.retryStorage();
    assert.equal(auth.getState().status, 'STORAGE_ERROR');
    assert.equal(posts, 0); assert.equal(s.current().kind, 'empty');
  }
});

test('저장 읽기 시간 초과는 빈 기록으로 취급하지 않고 늦은 기존 기록만 재확인한다', async () => {
  const s = store({ kind: 'stored', guest: guest() }), read = s.read, gate = deferred(); let posts = 0;
  s.read = () => gate.promise;
  const auth = controller(s, () => { posts += 1; return ok(guest()); }, { timeoutMs: 20 });
  await auth.start(); assert.equal(auth.getState().status, 'STORAGE_ERROR');
  assert.equal(await auth.getAccessToken(), null); assert.equal(posts, 0);
  gate.resolve(s.current()); await flush();
  assert.equal(auth.getState().status, 'STORAGE_ERROR');
  s.read = read; await auth.retryStorage(); assert.equal(auth.getState().status, 'READY');
  assert.equal(auth.getUserId(), USER_ID); assert.equal(posts, 0);
});

test('발급 표시 저장 확인이 유실되면 pending을 유지하고 재발급하지 않는다', async () => {
  const s = store(), begin = s.beginCreation; let posts = 0;
  s.beginCreation = async () => { await begin(); throw new Error(PRIVATE); };
  const auth = controller(s, () => { posts += 1; return ok(guest()); });
  await auth.start(); assert.equal(auth.getState().status, 'STORAGE_ERROR');
  await auth.retryStorage();
  assert.equal(auth.getState().status, 'CREATION_UNCERTAIN');
  assert.equal(posts, 0); assert.equal(s.current().kind, 'pending');
});

test('비정상·실패 발급 응답은 pending으로 남고 재확인·재실행에서 POST를 반복하지 않는다', async () => {
  const responses = [
    () => new Response(PRIVATE, { status: 503 }),
    () => ok(guest(START)), () => ok({ ...guest(), user_id: 'invalid' }),
    () => Response.json({ status: 'ok', data: guest(), extra: true }),
    () => new Response('{', { status: 200 }),
    () => { throw new Error(PRIVATE); },
  ];
  for (const response of responses) {
    const s = store(); let posts = 0;
    const fetchImpl = async () => { posts += 1; return response(); };
    const auth = controller(s, fetchImpl);
    await auth.start(); await auth.retryStorage();
    assert.equal(auth.getState().status, 'CREATION_UNCERTAIN');
    assert.equal(await auth.getAccessToken(), null);
    assert.equal(posts, 1); assert.equal(s.current().kind, 'pending');
    const reopened = controller(s, fetchImpl); await reopened.start();
    assert.equal(reopened.getState().status, 'CREATION_UNCERTAIN');
    assert.equal(posts, 1);
    assert.equal(JSON.stringify(auth.getState()).includes(PRIVATE), false);
  }
});

test('발급 시간 초과는 취소하며 늦은 성공으로 저장하거나 재발급하지 않는다', async () => {
  const s = store(), late = deferred(); let signal, posts = 0;
  const auth = controller(s, (_url, init) => { signal = init.signal; posts += 1; return late.promise; }, { timeoutMs: 20 });
  await auth.start();
  assert.equal(auth.getState().status, 'CREATION_UNCERTAIN');
  assert.equal(signal.aborted, true);
  late.resolve(ok(guest())); await flush(); await auth.retryStorage();
  assert.equal(s.current().kind, 'pending'); assert.equal(posts, 1);
});

test('저장 시간 초과는 빈 기록으로 바꾸지 않으며 늦은 같은 기록을 재확인한다', async () => {
  const s = store(), commit = s.commitGuest, gate = deferred();
  s.commitGuest = async (value) => { await gate.promise; return commit(value); };
  let posts = 0;
  const auth = controller(s, () => { posts += 1; return ok(guest()); }, { timeoutMs: 20 });
  await auth.start(); assert.equal(auth.getState().status, 'STORAGE_ERROR');
  assert.equal(s.current().kind, 'pending');
  gate.resolve(); await flush();
  await auth.retryStorage(); assert.equal(auth.getState().status, 'READY');
  assert.equal(posts, 1);
});

test('후보 저장 실패는 같은 후보만 로컬 재시도하며 서버에 재발급을 요청하지 않는다', async () => {
  const s = store(), commit = s.commitGuest; let fail = true, posts = 0;
  s.commitGuest = async (value) => { if (fail) throw new Error(PRIVATE); return commit(value); };
  const auth = controller(s, () => { posts += 1; return ok(guest()); });
  await auth.start(); assert.equal(auth.getState().status, 'STORAGE_ERROR');
  assert.equal(await auth.getAccessToken(), null);
  fail = false;
  const retry = auth.retryStorage(); assert.equal(retry, auth.retryStorage()); await retry;
  assert.equal(auth.getUserId(), USER_ID); assert.equal(posts, 1);
});

test('저장 확인 응답 유실은 동일 stored 기록 재확인으로 복구한다', async () => {
  const s = store(), commit = s.commitGuest; let posts = 0;
  s.commitGuest = async (value) => { await commit(value); throw new Error(PRIVATE); };
  const auth = controller(s, () => { posts += 1; return ok(guest()); });
  await auth.start(); assert.equal(auth.getState().status, 'STORAGE_ERROR');
  await auth.retryStorage(); assert.equal(auth.getState().status, 'READY');
  assert.equal(s.calls.filter((call) => call === 'commit').length, 1);
  assert.equal(posts, 1);
});

test('다른 게스트 또는 잘못된 저장 재확인은 READY로 수용하거나 덮어쓰지 않는다', async () => {
  for (const record of [{ kind: 'empty' }, { kind: 'pending' },
    { kind: 'stored', guest: { ...guest(), user_id: OTHER_ID } }]) {
    const s = store();
    s.commitGuest = async () => s.persist(record);
    let posts = 0; const auth = controller(s, () => { posts += 1; return ok(guest()); });
    await auth.start(); await auth.retryStorage();
    assert.equal(auth.getState().status, 'STORAGE_ERROR');
    assert.equal(await auth.getAccessToken(), null);
    assert.deepEqual(s.current(), record); assert.equal(posts, 1);
  }
});

test('호스트가 넘긴 객체를 바꿔도 private 인증 기록은 변경하지 않는다', async () => {
  const s = store();
  s.commitGuest = async (value) => { s.persist({ kind: 'stored', guest: value }); value.access_token = 'changed'; };
  const auth = controller(s);
  auth.subscribe((state) => { state.status = 'changed'; throw new Error(PRIVATE); });
  await auth.start(); assert.equal(await auth.getAccessToken(), TOKEN);
  const copy = s.current(); copy.guest.access_token = 'changed-again';
  assert.equal(await auth.getAccessToken(), TOKEN);
});

test('dispose 직전·저장 대기·발급 대기의 늦은 결과는 종료 상태를 바꾸지 않는다', async () => {
  const before = controller(store()); const pending = before.start(); before.dispose(); await pending;
  assert.equal(before.getState().status, 'DISPOSED');
  for (const phase of ['read', 'fetch', 'commit']) {
    const s = store(), gate = deferred(); let requests = 0, signal;
    if (phase === 'read') s.read = () => gate.promise;
    if (phase === 'commit') {
      const commit = s.commitGuest;
      s.commitGuest = async (value) => { await gate.promise; return commit(value); };
    }
    const auth = controller(s, (_url, init) => {
      requests += 1; signal = init.signal; return phase === 'fetch' ? gate.promise : ok(guest());
    });
    const start = auth.start(); await flush(); auth.dispose();
    gate.resolve(phase === 'fetch' ? ok(guest()) : { kind: 'empty' });
    await start; await flush();
    assert.equal(auth.getState().status, 'DISPOSED');
    assert.equal(await auth.getAccessToken(), null);
    assert.equal(auth.getUserId(), null);
    if (phase === 'read') assert.equal(requests, 0);
    if (phase === 'fetch') { assert.equal(signal.aborted, true); assert.equal(s.current().kind, 'pending'); }
    await auth.start(); await auth.retryStorage();
    assert.equal(auth.getState().status, 'DISPOSED');
  }
});

test('flow는 현재 Bearer와 지정한 두 POST 경로만 사용한다', async () => {
  const s = store({ kind: 'stored', guest: guest() }); let requests = 0;
  const auth = controller(s, () => { requests += 1; return ok({ next_action: 'IDLE' }); },
    { baseUrl: 'https://api.example/v1/' });
  await auth.start();
  const flow = auth.createFlowFetch();
  for (const [url, options] of [
    ['https://other.example/v1/flow/start-session', {}],
    ['https://api.example/v1/flow/start-session?extra=1', {}],
    ['https://api.example/v1/auth/guest', {}],
    ['https://api.example/v1/flow/start-session', { method: 'GET' }],
    ['https://api.example/v1/flow/start-session', { headers: { Authorization: 'Bearer other' } }],
    ['https://api.example/v1/flow/start-session', { headers: { Authorization: 'Bearer ' + TOKEN, authorization: 'Bearer ' + TOKEN } }],
  ]) {
    await assert.rejects(flow(url, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, ...options }),
      (error) => !Object.hasOwn(error, 'code') && !error.message.includes(TOKEN));
  }
  assert.equal(requests, 0);
  await transport(auth, { baseUrl: 'https://api.example/v1' }).startSession(OTHER_ID, 'VI', false);
  await flow('https://api.example/v1/flow/start-explicit-study',
    { method: 'POST', headers: new Headers({ Authorization: 'Bearer ' + TOKEN }) });
  assert.equal(requests, 2);
});

test('실제 401은 원본 응답과 본문을 보존하면서 현재 인증을 차단한다', async () => {
  const s = store({ kind: 'stored', guest: guest() });
  const response = Response.json({ status: 'error', message: PRIVATE }, { status: 401 });
  const auth = controller(s, () => response); await auth.start();
  const returned = await auth.createFlowFetch()('/flow/start-session',
    { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN } });
  assert.equal(returned, response);
  assert.equal(response.bodyUsed, false);
  assert.deepEqual(await returned.json(), { status: 'error', message: PRIVATE });
  assert.equal(auth.getState().status, 'AUTH_REJECTED');
  assert.equal(await auth.getAccessToken(), null);
  await assert.rejects(transport(auth).startSession(USER_ID, 'VI'));
  await auth.retryStorage(); assert.equal(auth.getState().status, 'AUTH_REJECTED');
  assert.deepEqual(s.current(), { kind: 'stored', guest: guest() });
});

test('flow 503·네트워크 오류는 같은 게스트로 기존 재시도를 허용한다', async () => {
  const s = store({ kind: 'stored', guest: guest() }); let calls = 0;
  const auth = controller(s, () => {
    calls += 1;
    if (calls === 1) return new Response(PRIVATE, { status: 503 });
    if (calls === 2) throw new Error(PRIVATE);
    return ok({ next_action: 'IDLE' });
  });
  await auth.start(); const client = transport(auth);
  await assert.rejects(client.startSession(USER_ID, 'VI'));
  await assert.rejects(client.startSession(USER_ID, 'VI'), (error) => !error.message.includes(TOKEN));
  assert.deepEqual(await client.startSession(USER_ID, 'VI'), { next_action: 'IDLE' });
  assert.equal(auth.getState().status, 'READY'); assert.equal(await auth.getAccessToken(), TOKEN);
  assert.equal(s.calls.includes('begin'), false);
});

test('capacity 충돌 원문은 기존 학습 제어기의 재조회 동작으로 전달된다', async () => {
  const calls = [], s = store({ kind: 'stored', guest: guest() });
  const auth = controller(s, (url, init) => {
    calls.push([url, JSON.parse(init.body)]);
    if (url.endsWith('start-explicit-study')) return Response.json({ status: 'error',
      error_code: 'CONTRACT_VIOLATION', message: 'active Grammar Node limit 초과: 합성 fixture' }, { status: 422 });
    return ok(calls.length === 1 ? { next_action: 'NEW_GRAMMAR', node_id: 'VI_SYNTHETIC_NODE' } :
      { next_action: 'REVIEW', review_batch: [{ node_id: 'VI_EXISTING_NODE' }] });
  });
  await auth.start();
  const learning = new LearningSessionController({ transport: transport(auth), userId: USER_ID, language: 'VI' });
  await learning.start(); await learning.startProposedExplicitStudy();
  assert.equal(learning.getState().currentScreen.kind, 'REVIEW');
  assert.deepEqual(calls.map(([url]) => url), ['/flow/start-session', '/flow/start-explicit-study', '/flow/start-session']);
  assert.equal(auth.getState().status, 'READY');
  assert.equal(calls.some(([, body]) => Object.hasOwn(body, 'user_id')), false);
});

test('flow 취소·시간 초과·늦은 과거 401은 새 인증 문맥을 변경하지 않는다', async () => {
  for (const mode of ['caller', 'dispose', 'timeout']) {
    const s = store({ kind: 'stored', guest: guest() }), gate = deferred(); let signal;
    const auth = controller(s, (_url, init) => { signal = init.signal; return gate.promise; }, { timeoutMs: 20 });
    await auth.start(); const cancellation = new AbortController();
    const request = auth.createFlowFetch()('/flow/start-session',
      { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, signal: cancellation.signal });
    const rejection = assert.rejects(request); await flush();
    if (mode === 'caller') cancellation.abort();
    if (mode === 'dispose') auth.dispose();
    await rejection; assert.equal(signal.aborted, true);
    const fresh = controller(s); await fresh.start();
    gate.resolve(new Response('{}', { status: 401 })); await flush();
    assert.equal(fresh.getState().status, 'READY');
    assert.equal(auth.getState().status, mode === 'dispose' ? 'DISPOSED' : 'READY');
  }
});

test('응답 본문을 넘긴 뒤에도 호출자의 취소를 fetch signal에 유지한다', async () => {
  const s = store({ kind: 'stored', guest: guest() }); let signal;
  const response = ok({ next_action: 'IDLE' });
  const auth = controller(s, (_url, init) => { signal = init.signal; return response; }); await auth.start();
  const cancellation = new AbortController();
  assert.equal(await auth.createFlowFetch()('/flow/start-session',
    { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, signal: cancellation.signal }), response);
  cancellation.abort(); assert.equal(signal.aborted, true);
});

test('flow 응답 대기 중 만료되면 늦은 응답을 학습 결과로 전달하지 않는다', async () => {
  let time = START;
  const s = store({ kind: 'stored', guest: guest(START + 1) }), gate = deferred();
  const auth = controller(s, () => gate.promise, { now: () => time }); await auth.start();
  const request = transport(auth).startSession(USER_ID, 'VI');
  const rejection = assert.rejects(request); await flush();
  time += 1; gate.resolve(ok({ next_action: 'IDLE' })); await rejection;
  assert.equal(auth.getState().status, 'EXPIRED'); assert.equal(s.current().kind, 'stored');
});

test('게스트 화면은 안전한 상태와 저장 재확인만 표시하며 기록을 노출하지 않는다', async () => {
  const { document } = parseHTML('<main id="root"></main>');
  const root = document.getElementById('root');
  const s = store({ kind: 'pending' }); let posts = 0;
  const auth = controller(s, () => { posts += 1; return ok(guest()); });
  const view = mountMobileGuest({ root, controller: auth });
  await auth.start();
  assert.equal(root.dataset.guestStatus, 'CREATION_UNCERTAIN');
  assert.equal(root.querySelector('[data-action="start"]'), null);
  root.querySelector('[data-action="guest-retry"]').click(); await flush();
  assert.equal(root.textContent.includes(TOKEN), false); assert.equal(root.textContent.includes(USER_ID), false);
  assert.equal(root.textContent.includes(PRIVATE), false); assert.equal(posts, 0);
  view.destroy(); s.persist({ kind: 'stored', guest: guest() }); await auth.retryStorage();
  assert.equal(root.textContent, '');
});

// Node DOM에서 최종 번들을 실행한다. 실제 브라우저·TLS·Keystore·휴대폰 검증은 아니다.
function runBundle(t, { config, indexedDB = new IDBFactory(), fetchImpl, preview = false } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lle-guest-bundle-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  buildMobile(directory);
  const { document } = parseHTML(fs.readFileSync(path.join(directory, preview ? 'lle-mobile-preview.html' : 'index.html'), 'utf8'));
  const events = new EventTarget();
  const window = { location: { search: '', origin: ORIGIN }, indexedDB, LLE_APP_CONFIG: config,
    addEventListener: events.addEventListener.bind(events) };
  const calls = [];
  vm.runInNewContext(fs.readFileSync(path.join(directory, 'app.js'), 'utf8'), {
    window, document, URL, URLSearchParams, structuredClone, AbortController, Blob, Uint8Array,
    crypto: webcrypto, setTimeout, clearTimeout, fetch: (...args) => {
      calls.push(args);
      if (!fetchImpl) throw new Error(PRIVATE);
      return fetchImpl(...args);
    },
  });
  function dispatch(type, persisted = false) {
    const event = new Event(type); Object.defineProperty(event, 'persisted', { value: persisted }); events.dispatchEvent(event);
  }
  const app = { root: document.getElementById('learning-root'), document, window, calls, dispatch };
  t.after(() => dispatch('pagehide'));
  return app;
}

function waitForDom(app, predicate) {
  if (predicate()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const observer = new app.document.defaultView.MutationObserver(() => {
      if (predicate()) { clearTimeout(timer); observer.disconnect(); resolve(); }
    });
    const timer = setTimeout(() => { observer.disconnect(); reject(new Error('화면 대기 실패: ' + app.root.dataset.screen)); }, 2000);
    observer.observe(app.root, { subtree: true, childList: true, attributes: true });
  });
}

const PACK_BYTES = new TextEncoder().encode('베트남어 합성 게스트 연결 검사 파일');
const PACK_CATALOG = [{ id: 'test-vi', language: 'VI', name: '베트남어', country: '베트남', version: 'test-1',
  downloadBytes: PACK_BYTES.length, sha256: createHash('sha256').update(PACK_BYTES).digest('hex'), downloadUrl: '/packs/test-vi.llepack' }];
async function install(app, id = 'test-vi') {
  await waitForDom(app, () => app.root.querySelector('[data-pack-id="' + id + '"]')?.disabled === false);
  app.root.querySelector('[data-pack-id="' + id + '"]').click();
  assert.match(app.root.querySelector('#pack-dialog-size').textContent, /B|KB|MB|다시 내려받지/);
  app.root.querySelector('[data-action="pack-confirm"]').click();
  await waitForDom(app, () => app.root.dataset.screen === 'HOME');
}

test('관리형 번들은 저장 확인 후 기존 팩·flow에 연결하고 재실행 시 같은 게스트와 팩을 복구한다', async (t) => {
  const s = store(), gate = deferred(), commit = s.commitGuest;
  s.commitGuest = async (value) => { await gate.promise; return commit(value); };
  const db = new IDBFactory(), sent = [], config = { guestStore: s, userId: OTHER_ID, languagePackCatalog: PACK_CATALOG };
  const fetchImpl = (url, init) => {
    sent.push([url, init]);
    if (url === '/auth/guest') return ok(guest(Date.now() + 86400000));
    if (url.includes('/packs/')) return new Response(PACK_BYTES);
    assert.equal(init.headers.Authorization, 'Bearer ' + TOKEN);
    const body = JSON.parse(init.body); assert.equal(Object.hasOwn(body, 'user_id'), false);
    return ok({ next_action: body.conversation_boundary_acknowledged ? 'IDLE' : 'CONVERSATION' });
  };
  const app = runBundle(t, { config, indexedDB: db, fetchImpl });
  await waitForDom(app, () => app.root.dataset.guestStatus === 'SAVING');
  assert.equal(app.root.dataset.screen, 'GUEST_AUTH');
  assert.equal(app.root.querySelector('[data-pack-id]'), null); assert.equal(sent.length, 1);
  assert.equal(JSON.stringify(app.window.LLEMobile).includes(TOKEN), false);
  gate.resolve(); await install(app);
  assert.equal(sent.length, 2);
  app.root.querySelector('[data-action="start"]').click();
  await waitForDom(app, () => app.root.dataset.screen === 'CONVERSATION_BOUNDARY');
  app.root.querySelector('[data-action="acknowledge"]').click();
  await waitForDom(app, () => app.root.dataset.screen === 'IDLE');
  app.dispatch('pagehide');
  const reopened = runBundle(t, { config, indexedDB: db, fetchImpl });
  await waitForDom(reopened, () => reopened.root.dataset.screen === 'HOME');
  assert.equal(sent.length, 4);
  reopened.root.querySelector('[data-action="start"]').click();
  await waitForDom(reopened, () => reopened.root.dataset.screen === 'CONVERSATION_BOUNDARY');
  assert.deepEqual(sent.filter(([url]) => url.startsWith('/flow/')).map(([, init]) => JSON.parse(init.body)),
    [{ language: 'VI', conversation_boundary_acknowledged: false },
      { language: 'VI', conversation_boundary_acknowledged: true },
      { language: 'VI', conversation_boundary_acknowledged: false }]);
  assert.equal(sent.filter(([url]) => url === '/auth/guest').length, 1);
  assert.equal(sent.filter(([url]) => url.includes('/packs/')).length, 1);
});

test('게스트·레거시 인증 동시 설정과 미설정은 실제 요청 없이 막히고 미리보기는 둘 다 읽지 않는다', async (t) => {
  const s = { read() { throw new Error(PRIVATE); }, beginCreation() { throw new Error(PRIVATE); }, commitGuest() { throw new Error(PRIVATE); } };
  const config = { guestStore: s, getAccessToken() { throw new Error(PRIVATE); }, languagePackCatalog: PACK_CATALOG };
  for (const settings of [config, {}]) {
    const app = runBundle(t, { config: settings });
    await flush();
    assert.equal(app.root.dataset.guestStatus, 'HOST_UNAVAILABLE'); assert.equal(app.calls.length, 0);
    assert.equal(app.root.querySelector('[data-pack-id]'), null);
  }
  const preview = runBundle(t, { config, preview: true });
  await waitForDom(preview, () => preview.root.querySelector('[data-pack-id]')?.disabled === false);
  assert.equal(preview.root.dataset.screen, 'LANGUAGE_PACKS'); assert.equal(preview.calls.length, 0);
});

test('관리형 언어 변경은 게스트를 유지하며 언어별 새 세션의 대화 확인을 초기화한다', async (t) => {
  const s = store({ kind: 'stored', guest: guest(Date.now() + 86400000) }), bodies = [];
  const catalog = [...PACK_CATALOG, { ...PACK_CATALOG[0], id: 'test-ja', language: 'JA', name: '일본어', country: '일본', downloadUrl: '/packs/test-ja.llepack' }];
  const app = runBundle(t, { config: { guestStore: s, languagePackCatalog: catalog }, fetchImpl: (url, init) => {
    if (url.includes('/packs/')) return new Response(PACK_BYTES);
    assert.equal(init.headers.Authorization, 'Bearer ' + TOKEN);
    const body = JSON.parse(init.body); bodies.push(body);
    return ok({ next_action: body.conversation_boundary_acknowledged ? 'IDLE' : 'CONVERSATION' });
  } });
  await install(app); app.root.querySelector('[data-action="start"]').click();
  await waitForDom(app, () => app.root.dataset.screen === 'CONVERSATION_BOUNDARY');
  app.root.querySelector('[data-action="acknowledge"]').click();
  await waitForDom(app, () => app.root.dataset.screen === 'IDLE');
  app.document.getElementById('language-button').click(); await install(app, 'test-ja');
  app.root.querySelector('[data-action="start"]').click();
  await waitForDom(app, () => app.root.dataset.screen === 'CONVERSATION_BOUNDARY');
  assert.deepEqual(bodies, [{ language: 'VI', conversation_boundary_acknowledged: false },
    { language: 'VI', conversation_boundary_acknowledged: true }, { language: 'JA', conversation_boundary_acknowledged: false }]);
  assert.equal(s.current().guest.user_id, USER_ID);
  assert.equal(app.calls.some(([url]) => url === '/auth/guest'), false);
});

test('번들 flow 401은 연결 화면으로 전환하고 재시도 버튼이나 종료된 학습 화면을 남기지 않는다', async (t) => {
  const s = store({ kind: 'stored', guest: guest(Date.now() + 86400000) });
  const config = { guestStore: s, languagePackCatalog: PACK_CATALOG };
  const app = runBundle(t, { config, fetchImpl: (url) => url.includes('/packs/') ? new Response(PACK_BYTES) :
    Response.json({ status: 'error', message: PRIVATE }, { status: 401 }) });
  await install(app); app.root.querySelector('[data-action="start"]').click();
  await waitForDom(app, () => app.root.dataset.guestStatus === 'AUTH_REJECTED'); await flush();
  assert.equal(app.root.dataset.screen, 'GUEST_AUTH');
  assert.equal(app.root.querySelector('[data-action="start"]'), null);
  assert.equal(app.root.querySelector('[data-action="guest-retry"]'), null);
  assert.equal(app.document.getElementById('language-button').hidden, true);
  assert.equal(app.root.textContent.includes(PRIVATE), false);
  assert.equal(s.current().kind, 'stored');
  assert.equal(app.calls.some(([url]) => url === '/auth/guest'), false);
});

test('bfcache 재개는 같은 저장 게스트로 새 문맥을 만들며 이전 flow의 늦은 401을 무시한다', async (t) => {
  const s = store({ kind: 'stored', guest: guest(Date.now() + 86400000) }), late = deferred(); let oldSignal;
  const app = runBundle(t, { config: { guestStore: s, languagePackCatalog: PACK_CATALOG },
    fetchImpl: (url, init) => {
      if (url.includes('/packs/')) return new Response(PACK_BYTES);
      oldSignal = init.signal; return late.promise;
    } });
  await install(app); app.root.querySelector('[data-action="start"]').click(); await flush();
  app.dispatch('pagehide'); assert.equal(oldSignal.aborted, true);
  app.dispatch('pageshow', true);
  await waitForDom(app, () => app.root.dataset.screen === 'HOME');
  late.resolve(new Response('{}', { status: 401 })); await flush();
  assert.equal(app.root.dataset.screen, 'HOME');
  assert.equal(app.calls.filter(([url]) => url.includes('/packs/')).length, 1);
  assert.equal(app.calls.some(([url]) => url === '/auth/guest'), false);
});

test('발급 대기 중 pagehide 후 재개는 pending을 보존하고 늦은 성공을 저장하지 않는다', async (t) => {
  const s = store(), late = deferred(); let signal;
  const app = runBundle(t, { config: { guestStore: s, languagePackCatalog: PACK_CATALOG },
    fetchImpl: (_url, init) => { signal = init.signal; return late.promise; } });
  await waitForDom(app, () => app.root.dataset.guestStatus === 'CREATING'); await flush();
  app.dispatch('pagehide'); app.dispatch('pageshow', true);
  await waitForDom(app, () => app.root.dataset.guestStatus === 'CREATION_UNCERTAIN');
  assert.equal(signal.aborted, true);
  late.resolve(ok(guest(Date.now() + 86400000))); await flush();
  assert.equal(app.root.dataset.guestStatus, 'CREATION_UNCERTAIN');
  assert.equal(s.current().kind, 'pending'); assert.equal(app.calls.length, 1);
});

test('실제 Node HTTP 서버의 기존 발급·Bearer·401을 클라이언트와 연결한다: 합성 DB이며 TLS 검증 아님', async (t) => {
  const users = new Map(), learningCalls = [], requests = [];
  const pool = { async query(sql, values) {
    if (sql.trim().startsWith('INSERT INTO users')) {
      users.set(values[0], values[1]); return { rows: [{ user_id: values[0] }] };
    }
    return { rows: users.get(values[0]) === values[1] ? [{ user_id: values[0] }] : [] };
  } };
  const authService = createGuestAuthService({ pool, signingKey: createHash('sha256').update('public synthetic client HTTP fixture key').digest(),
    now: () => START });
  const server = createLearningFlowHttpServer({ ...authService, transport: {
    async startSession(...args) { learningCalls.push(args); return { next_action: 'IDLE' }; },
    async startExplicitStudy() { return { state: 'INTRODUCED' }; },
  } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { const closed = once(server, 'close'); server.close(); server.closeAllConnections(); await closed; });
  const loopback = 'http://127.0.0.1:' + server.address().port;
  // 관리형 설정은 HTTPS만 허용한다. 이 테스트는 소유한 Node 소켓으로 매핑하며 TLS 성공으로 세지 않는다.
  const fixtureFetch = (url, init) => { requests.push([url, init]); return fetch(loopback + new URL(url).pathname, init); };
  const s = store(), auth = controller(s, fixtureFetch, { baseUrl: 'https://synthetic-api.example' });
  await auth.start(); assert.equal(auth.getState().status, 'READY'); assert.equal(users.size, 1);
  const id = auth.getUserId(), client = transport(auth, { baseUrl: 'https://synthetic-api.example' });
  assert.deepEqual(await client.startSession(OTHER_ID, 'VI', false), { next_action: 'IDLE' });
  assert.deepEqual(learningCalls, [[id, 'VI', false]]);
  auth.dispose();
  const reopened = controller(s, fixtureFetch, { baseUrl: 'https://synthetic-api.example' }); await reopened.start();
  assert.equal(reopened.getUserId(), id); assert.equal(users.size, 1);
  users.delete(id);
  await assert.rejects(transport(reopened, { baseUrl: 'https://synthetic-api.example' }).startSession(OTHER_ID, 'VI'));
  assert.equal(reopened.getState().status, 'AUTH_REJECTED');
  assert.equal(requests.filter(([url]) => url.endsWith('/auth/guest')).length, 1);
  assert.equal(s.current().guest.user_id, id);
});
