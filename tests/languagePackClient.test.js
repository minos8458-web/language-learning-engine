const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash, webcrypto } = require('node:crypto');
const { IDBFactory } = require('fake-indexeddb');
const { parseHTML } = require('linkedom');
const { LanguagePackCache, LanguagePackService, normalizeCatalog, formatPackSize, WIFI_RECOMMEND_BYTES } = require('../src/client/languagePackService');
const { LanguagePackController } = require('../src/client/languagePackController');
const { mountLanguagePacks } = require('../src/client/languagePackView');
const { createPreviewLanguagePackService } = require('../mobile/previewLanguagePacks');

const ORIGIN = 'https://lle.example';
const BYTES = new TextEncoder().encode('합성 다운로드 검증 전용 파일');
const HASH = createHash('sha256').update(BYTES).digest('hex');
const PACK = { id: 'test-en', language: 'EN', name: '영어', country: '미국', version: 'synthetic-test-1', downloadBytes: BYTES.length, sha256: HASH, downloadUrl: '/packs/test-en.llepack' };
const settle = () => new Promise((resolve) => setImmediate(resolve));

function setup(context, options = {}) {
  const indexedDB = new IDBFactory();
  const cache = new LanguagePackCache({ indexedDB });
  const calls = [];
  const service = new LanguagePackService({ catalog: [PACK], origin: ORIGIN, cache, cryptoImpl: webcrypto,
    fetchImpl: async (url, init) => { calls.push({ url, init }); return new Response(BYTES); }, ...options });
  context.after(() => cache.close());
  return { indexedDB, cache, service, calls };
}

test('작은 배포 목록만 읽고 다운로드는 명시적 요청 전까지 시작하지 않는다', async (context) => {
  const { service, calls } = setup(context);
  assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
  const controller = new LanguagePackController(service);
  await controller.load(); controller.choose(PACK.id);
  assert.equal(controller.getState().confirmation.language, 'EN');
  assert.equal(calls.length, 0);
  controller.cancel(); assert.equal(calls.length, 0);
});

test('용량 단위는 decimal KB/MB/GB이며 미확인 값을 실제 용량으로 꾸미지 않는다', () => {
  assert.equal(formatPackSize(null), '용량 미확인');
  assert.equal(formatPackSize(-1), '용량 미확인');
  assert.equal(formatPackSize(0), '0 KB');
  assert.equal(formatPackSize(1500), '2 KB');
  assert.equal(formatPackSize(24e6), '24 MB');
  assert.equal(formatPackSize(1.5e9), '1.5 GB');
  assert.equal(WIFI_RECOMMEND_BYTES, 100e6);
});

test('여러 언어와 미발행 항목을 목록에 남기고 정확한 크기·해시·같은 origin 주소가 있는 팩만 허용한다', () => {
  const catalog = normalizeCatalog([PACK, { ...PACK, id: 'test-ja', language: 'JA', name: '일본어', country: '일본', downloadBytes: null, sha256: null }], ORIGIN);
  assert.equal(catalog[0].available, true);
  assert.equal(catalog[0].downloadUrl, `${ORIGIN}/packs/test-en.llepack`);
  assert.equal(catalog[1].available, false);
  assert.equal(catalog[1].downloadBytes, null);
  assert.ok(Object.isFrozen(catalog) && Object.isFrozen(catalog[0]));
  for (const downloadUrl of ['https://other.example/file', 'data:text/plain,a', 'javascript:alert(1)', '', '/file#fragment', 'https://user:password@lle.example/file']) {
    assert.equal(normalizeCatalog([{ ...PACK, downloadUrl }], ORIGIN)[0].available, false);
  }
  for (const override of [{ downloadBytes: 0 }, { downloadBytes: Infinity }, { sha256: 'wrong' }]) {
    assert.equal(normalizeCatalog([{ ...PACK, ...override }], ORIGIN)[0].available, false);
  }
});

test('잘못된 언어팩 id·언어·빈 표시명·중복은 다운로드 목록으로 통과하지 않는다', () => {
  for (const override of [{ id: 123 }, { id: '../x' }, { language: 'english' }, { name: '' }, { country: null }, { version: '' }]) {
    assert.throws(() => normalizeCatalog([{ ...PACK, ...override }], ORIGIN));
  }
  assert.throws(() => normalizeCatalog([PACK, PACK], ORIGIN));
  assert.throws(() => normalizeCatalog({ list: [PACK] }, ORIGIN));
});

test('확인한 파일 하나만 받으며 크기·SHA-256·트랜잭션 완료 후 설치와 선택을 복구한다', async (context) => {
  const { service, cache, indexedDB, calls } = setup(context);
  const progress = [];
  await service.downloadAndSelect(PACK.id, { onProgress: (value) => progress.push(value) });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${ORIGIN}${PACK.downloadUrl}`);
  assert.equal(calls[0].init.credentials, 'omit');
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(calls[0].init.cache, 'no-store');
  assert.equal(calls[0].init.headers, undefined);
  assert.deepEqual(progress.map((value) => value.phase), ['downloading', 'downloading', 'verifying', 'storing']);
  const db = await cache.open();
  const asset = await new Promise((resolve, reject) => { const r = db.transaction('assets').objectStore('assets').get(PACK.id); r.onsuccess = () => resolve(r.result); r.onerror = reject; });
  assert.deepEqual(new Uint8Array(await asset.blob.arrayBuffer()), BYTES);
  await cache.close();
  const reopened = new LanguagePackCache({ indexedDB }); context.after(() => reopened.close());
  const freshService = new LanguagePackService({ catalog: [PACK], origin: ORIGIN, cache: reopened });
  assert.deepEqual(await freshService.load(), { installedIds: [PACK.id], selectedId: PACK.id });
});

test('스트리밍 다운로드는 중간 진행률을 보내고 다른 팩을 받지 않는다', async (context) => {
  const requests = [];
  const { service } = setup(context, { catalog: [PACK, { ...PACK, id: 'test-ja', language: 'JA' }],
    fetchImpl: async (url) => { requests.push(url); return new Response(new ReadableStream({ start(controller) {
      controller.enqueue(BYTES.slice(0, 4)); controller.enqueue(BYTES.slice(4)); controller.close();
    } })); } });
  const values = [];
  await service.downloadAndSelect(PACK.id, { onProgress: (value) => values.push(value.receivedBytes) });
  assert.deepEqual(values.slice(0, 3), [0, 4, BYTES.length]);
  assert.deepEqual(await service.load(), { installedIds: [PACK.id], selectedId: PACK.id });
  assert.deepEqual(requests, [`${ORIGIN}${PACK.downloadUrl}`]);
});

test('짧은 파일·너무 긴 파일·잘못된 해시는 설치나 선택 상태를 만들지 않는다', async (context) => {
  for (const bytes of [BYTES.slice(0, -1), new Uint8Array(BYTES.length + 1), new Uint8Array(BYTES.length)]) {
    const { service } = setup(context, { fetchImpl: async () => new Response(bytes) });
    await assert.rejects(service.downloadAndSelect(PACK.id));
    assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
  }
});

test('파일 수신 실패·HTTP 오류·암호 검증 미지원은 설치 완료로 바뀌지 않는다', async (context) => {
  for (const options of [
    { fetchImpl: async () => { throw new Error('합성 연결 실패'); } },
    { fetchImpl: async () => new Response('error', { status: 503 }) },
    { fetchImpl: async () => new Response(new ReadableStream({ start(controller) { controller.error(new Error('stream failed')); } })) },
    { cryptoImpl: null },
  ]) {
    const { service } = setup(context, options);
    await assert.rejects(service.downloadAndSelect(PACK.id));
    assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
  }
});

test('취소된 다운로드는 reader를 닫고 설치·선택을 남기지 않는다', async (context) => {
  let cancelled = false;
  const { service } = setup(context, { fetchImpl: async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(BYTES.slice(0, 4)); }, cancel() { cancelled = true; },
  })) });
  const abort = new AbortController();
  await assert.rejects(service.downloadAndSelect(PACK.id, { signal: abort.signal, onProgress(value) { if (value.receivedBytes === 4) abort.abort(); } }), { name: 'AbortError' });
  assert.equal(cancelled, true);
  assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
});

test('검증 중 취소하면 해시가 나중에 도착해도 저장하지 않는다', async (context) => {
  let resolveDigest;
  const { service } = setup(context, { cryptoImpl: { subtle: { digest: () => new Promise((resolve) => { resolveDigest = resolve; }) } } });
  const abort = new AbortController();
  const pending = service.downloadAndSelect(PACK.id, { signal: abort.signal });
  await settle(); abort.abort();
  resolveDigest(await webcrypto.subtle.digest('SHA-256', BYTES));
  await assert.rejects(pending, { name: 'AbortError' });
  assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
});

test('저장 트랜잭션 취소는 메타데이터·본문·선택을 함께 롤백한다', async (context) => {
  const { service, cache } = setup(context);
  await cache.open();
  const abort = new AbortController();
  const storing = cache.installAndSelect(service.catalog[0], BYTES, { signal: abort.signal });
  await Promise.resolve(); abort.abort();
  await assert.rejects(storing, { name: 'AbortError' });
  assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
});

test('캐시 쓰기 도중 본문 저장이 실패해도 앞서 요청한 메타데이터를 부분 설치로 남기지 않는다', async (context) => {
  const { service, cache } = setup(context);
  const db = await cache.open(); const transact = db.transaction.bind(db);
  db.transaction = (...args) => {
    const tx = transact(...args);
    if (args[1] === 'readwrite') {
      const objectStore = tx.objectStore.bind(tx);
      tx.objectStore = (name) => {
        const store = objectStore(name);
        if (name === 'assets') store.put = () => { throw new Error('합성 저장 공간 오류'); };
        return store;
      };
    }
    return tx;
  };
  try { await assert.rejects(cache.installAndSelect(service.catalog[0], BYTES)); }
  finally { db.transaction = transact; }
  assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
});

test('이미 설치된 언어의 선택 도중 취소하면 이전 학습 언어를 유지한다', async (context) => {
  const { service, cache } = setup(context, { catalog: [PACK, { ...PACK, id: 'test-ja', language: 'JA' }] });
  await service.downloadAndSelect('test-ja'); await service.downloadAndSelect(PACK.id);
  const abort = new AbortController();
  const selecting = cache.select(service.catalog[1], { signal: abort.signal });
  await Promise.resolve(); abort.abort(); await assert.rejects(selecting);
  assert.equal((await service.load()).selectedId, PACK.id);
});

test('저장 공간 실패 때 설치·선택 상태를 만들지 않고 사용자에게 원문 진단을 노출하지 않는다', async (context) => {
  const { service, cache } = setup(context);
  cache.installAndSelect = async () => { throw new Error('QuotaExceededError secret-diagnostic'); };
  const controller = new LanguagePackController(service); await controller.load(); controller.choose(PACK.id);
  assert.equal(await controller.confirm(), null);
  const state = controller.getState();
  assert.deepEqual(state.installedIds, []); assert.equal(state.selectedId, null);
  assert.match(state.error, /저장 공간/); assert.equal(state.error.includes('secret-diagnostic'), false);
  assert.equal(state.confirmation.id, PACK.id);
});

test('새 버전의 다운로드 실패는 이전 파일과 선택 기록을 덮어쓰지 않는다', async (context) => {
  const { service, cache } = setup(context);
  await service.downloadAndSelect(PACK.id);
  const update = new LanguagePackService({ catalog: [{ ...PACK, version: 'synthetic-test-2', sha256: '0'.repeat(64) }], origin: ORIGIN, cache, cryptoImpl: webcrypto, fetchImpl: async () => new Response(BYTES) });
  assert.deepEqual(await update.load(), { installedIds: [], selectedId: null });
  await assert.rejects(update.downloadAndSelect(PACK.id));
  assert.deepEqual(await service.load(), { installedIds: [PACK.id], selectedId: PACK.id });
});

test('본문이 없는 캐시 메타데이터나 없는 팩으로는 언어를 선택할 수 없다', async (context) => {
  const { service, cache } = setup(context);
  await service.downloadAndSelect(PACK.id);
  const db = await cache.open();
  await new Promise((resolve, reject) => { const tx = db.transaction('assets', 'readwrite'); tx.objectStore('assets').delete(PACK.id); tx.oncomplete = resolve; tx.onabort = reject; });
  assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
  await assert.rejects(service.select(PACK.id));
  await assert.rejects(service.downloadAndSelect('not-published'));
});

test('IndexedDB 없는 환경은 설치로 간주하지 않으며 빈 목록은 저장소 없이도 열린다', async () => {
  const cache = new LanguagePackCache();
  const service = new LanguagePackService({ catalog: [PACK], origin: ORIGIN, cache });
  await assert.rejects(service.load());
  const empty = new LanguagePackService({ origin: ORIGIN });
  assert.deepEqual(await empty.load(), { installedIds: [], selectedId: null });
});

test('한 팩의 연속 확인·진행 중 다른 팩 선택은 요청 하나만 만든다', async (context) => {
  let resolveFetch; let requests = 0;
  const { service } = setup(context, { fetchImpl: () => { requests += 1; return new Promise((resolve) => { resolveFetch = resolve; }); } });
  const controller = new LanguagePackController(service); await controller.load(); controller.choose(PACK.id);
  const first = controller.confirm(); assert.equal(await controller.confirm(), null);
  controller.choose('other'); assert.equal(controller.getState().confirmation.id, PACK.id);
  resolveFetch(new Response(BYTES));
  assert.equal((await first).language, 'EN'); assert.equal(requests, 1);
});

test('이미 설치된 같은 버전은 다시 다운로드하지 않고 명시적으로 선택한다', async (context) => {
  const { service, calls } = setup(context); await service.downloadAndSelect(PACK.id);
  const controller = new LanguagePackController(service); await controller.load(); controller.choose(PACK.id);
  assert.equal((await controller.confirm()).id, PACK.id);
  assert.equal(calls.length, 1);
});

test('취소 후 늦게 도착한 응답은 선택이나 다운로드 화면을 되살리지 않는다', async (context) => {
  let resolveFetch;
  const { service } = setup(context, { fetchImpl: () => new Promise((resolve) => { resolveFetch = resolve; }) });
  const controller = new LanguagePackController(service); await controller.load(); controller.choose(PACK.id);
  const pending = controller.confirm(); controller.cancel();
  resolveFetch(new Response(BYTES)); assert.equal(await pending, null);
  assert.equal(controller.getState().confirmation, null); assert.equal(controller.getState().selectedId, null);
  assert.deepEqual(await service.load(), { installedIds: [], selectedId: null });
});

function makeView(service, options = {}) {
  const { document } = parseHTML('<!doctype html><html><body><main id="root"></main></body></html>');
  const root = document.getElementById('root'); const controller = new LanguagePackController(service);
  const view = mountLanguagePacks({ root, controller, ...options });
  return { document, root, controller, view };
}

test('목록 선택은 나라·언어 질문과 용량을 가진 팝업 하나만 열고 취소는 네트워크를 쓰지 않는다', async (context) => {
  const { service, calls } = setup(context); const { root, controller, view } = makeView(service);
  context.after(() => view.destroy()); await controller.load();
  root.querySelector('[data-pack-id="test-en"]').click();
  assert.equal(root.querySelectorAll('dialog[open]').length, 1);
  assert.match(root.querySelector('#pack-dialog-question').textContent, /영어 \(미국\).*받으시겠어요/);
  assert.match(root.querySelector('#pack-dialog-size').textContent, /예상 다운로드 용량/);
  assert.equal(root.querySelector('#pack-dialog-wifi').hidden, true);
  root.querySelector('[data-action="pack-cancel"]').click();
  assert.equal(root.querySelectorAll('dialog[open]').length, 0); assert.equal(calls.length, 0);
});

test('100 MB 이상에서 Wi-Fi 권장을 팝업 아래에 표시하고 예시 용량을 구분한다', async (context) => {
  const service = createPreviewLanguagePackService(); const { root, controller, view } = makeView(service, { preview: true });
  context.after(() => view.destroy()); await controller.load();
  for (const [id, wifiShown] of [['preview-VI', false], ['preview-JA', true], ['preview-ZH', true]]) {
    controller.choose(id);
    assert.equal(root.querySelector('#pack-dialog-wifi').hidden, !wifiShown);
    assert.match(root.querySelector('#pack-dialog-size').textContent, /예시/);
    assert.ok(root.querySelector('dialog').textContent.includes('실제 언어팩은 받지 않아요'));
    controller.cancel();
  }
  const atThreshold = new LanguagePackService({ catalog: [{ ...PACK, downloadBytes: 100e6 }], origin: ORIGIN });
  const threshold = makeView(atThreshold); context.after(() => threshold.view.destroy());
  threshold.controller.update({ loading: false }); threshold.controller.choose(PACK.id);
  assert.equal(threshold.root.querySelector('#pack-dialog-wifi').hidden, false);
});

test('표시 문자열은 텍스트만 사용하고 미확인 크기의 미발행 팩은 다운로드할 수 없다', async (context) => {
  const malicious = '<img src="x" onerror="alert(1)">';
  const service = new LanguagePackService({ catalog: [{ ...PACK, name: malicious, downloadBytes: null }], origin: ORIGIN, cache: { async load() { return { installedIds: [], selectedId: null }; } } });
  const { root, controller, view } = makeView(service); context.after(() => view.destroy()); await controller.load();
  assert.equal(root.querySelectorAll('img').length, 0); assert.match(root.textContent, /용량 미확인/);
  assert.equal(root.querySelector('[data-pack-id]').disabled, true);
  controller.choose(PACK.id); assert.equal(root.querySelectorAll('dialog[open]').length, 0);
});

test('화면 제거 후 저장·선택 결과가 늦게 와도 새 화면을 만들거나 선택 콜백을 부르지 않는다', async (context) => {
  let resolveFetch; let selected = 0;
  const { service } = setup(context, { fetchImpl: () => new Promise((resolve) => { resolveFetch = resolve; }) });
  const { root, controller, view } = makeView(service, { onSelected() { selected += 1; } });
  await controller.load(); controller.choose(PACK.id); root.querySelector('[data-action="pack-confirm"]').click();
  view.destroy(); resolveFetch(new Response(BYTES)); await settle(); await settle();
  assert.equal(root.childNodes.length, 0); assert.equal(selected, 0);
});

test('다운로드 실패 후 같은 팝업에서 재시도하고 저장 성공 후에만 선택 콜백을 부른다', { timeout: 2000 }, async (context) => {
  let requests = 0; const selected = [];
  let resolveSelected; const completed = new Promise((resolve) => { resolveSelected = resolve; });
  const { service } = setup(context, { fetchImpl: async () => { requests += 1; if (requests === 1) throw new Error('secret-network-diagnostic'); return new Response(BYTES); } });
  const { root, controller, view } = makeView(service, { onSelected(pack) { selected.push(pack.language); resolveSelected(); } }); context.after(() => view.destroy());
  await controller.load(); controller.choose(PACK.id); root.querySelector('[data-action="pack-confirm"]').click(); await settle();
  assert.equal(root.querySelectorAll('dialog[open]').length, 1); assert.match(root.textContent, /다시 다운로드/);
  assert.equal(root.textContent.includes('secret-network-diagnostic'), false); assert.deepEqual(selected, []);
  root.querySelector('[data-action="pack-confirm"]').click();
  await completed;
  assert.deepEqual(selected, ['EN']); assert.equal(root.querySelectorAll('dialog[open]').length, 0);
});

test('Escape는 팝업 취소로 이어지고 다운로드 요청을 만들지 않는다', async (context) => {
  const { service, calls } = setup(context); const { document, root, controller, view } = makeView(service); context.after(() => view.destroy());
  await controller.load(); controller.choose(PACK.id);
  const event = new document.defaultView.Event('keydown', { bubbles: true, cancelable: true }); event.key = 'Escape';
  root.querySelector('dialog').dispatchEvent(event);
  assert.equal(event.defaultPrevented, true); assert.equal(root.querySelectorAll('dialog[open]').length, 0); assert.equal(calls.length, 0);
});
