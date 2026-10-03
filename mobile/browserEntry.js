const { LearningSessionController } = require('../src/client/learningSessionController');
const { HttpLearningFlowTransport } = require('../src/client/httpLearningFlowTransport');
const { GuestSessionController, GUEST_STATUS } = require('../src/client/guestSessionController');
const { mountMobileGuest } = require('../src/client/mobileGuestView');
const { mountMobileSession } = require('../src/client/mobileSessionView');
const { createPreviewTransport, PREVIEW_LABELS } = require('./previewTransport');
const { LanguagePackCache, LanguagePackService } = require('../src/client/languagePackService');
const { LanguagePackController } = require('../src/client/languagePackController');
const { mountLanguagePacks } = require('../src/client/languagePackView');
const { createPreviewLanguagePackService, PREVIEW_PACKS } = require('./previewLanguagePacks');

const config = window.LLE_APP_CONFIG || {};
const query = new URLSearchParams(window.location.search);
// 다운로드용 미리보기 파일은 빌드가 명시한 모드만 사용한다. 서버 오류의 대체 경로가 아니다.
const standalonePreview = document.documentElement.dataset.llePreview === 'standalone';
const preview = standalonePreview || query.get('preview') === '1';
const choices = ['languages', 'home', 'review', 'new', 'interleaving', 'conversation', 'idle', 'error'];
let scene = choices.includes(query.get('scene')) ? query.get('scene') : 'languages';
let mounted;
let mountedKind;
let closed = false;
let guestAuth;
let unsubscribeAuth;
let guestReadyOpened = false;
const legacyAuth = typeof config.getAccessToken === 'function' && config.guestStore == null;
const managedAuth = config.guestStore != null && typeof config.getAccessToken !== 'function';
let selectedPack = null;
let packService;
try {
  packService = preview ? createPreviewLanguagePackService() : new LanguagePackService({
    catalog: config.languagePackCatalog || [], origin: window.location.origin,
    cache: new LanguagePackCache({ indexedDB: window.indexedDB }),
  });
} catch {
  packService = { catalog: [], async load() { throw new Error('언어팩 목록 준비 중'); } };
}
const root = document.getElementById('learning-root');
const languageButton = document.getElementById('language-button');
const connectionLabel = document.getElementById('connection-label');
const selector = document.getElementById('preview-scene');

function destroyMounted() {
  const view = mounted;
  mounted = undefined; mountedKind = undefined;
  if (view) view.destroy();
}

function canLearn() {
  return !closed && (preview || legacyAuth || guestAuth?.getState().status === GUEST_STATUS.READY);
}

function mountSession(pack) {
  if (!canLearn()) return;
  const userId = !preview && managedAuth ? guestAuth.getUserId() : config.userId;
  if (!preview && managedAuth && !userId) return;
  destroyMounted();
  const auth = guestAuth;
  const transport = preview
    ? createPreviewTransport(scene)
    : new HttpLearningFlowTransport({
      getAccessToken: managedAuth ? () => auth.getAccessToken() : config.getAccessToken,
      ...managedAuth && { fetchImpl: auth.createFlowFetch() },
      baseUrl: config.baseUrl || '',
    });
  mounted = mountMobileSession({
    root,
    createController: () => new LearningSessionController({ transport, userId, language: pack.language }),
    labelForNode: preview ? (id) => PREVIEW_LABELS[id] : (id) => typeof config.labelForNode === 'function' ? config.labelForNode(id, pack.language) : null,
    connected: true,
    preview,
  });
  mountedKind = 'session';
  connectionLabel.textContent = preview ? `${pack.name} · 미리보기` : pack.name;
  languageButton.hidden = false;
  if (preview && !['home', 'languages'].includes(scene)) void mounted.refresh();
}

function mountPicker(resume = false) {
  if (!canLearn()) return;
  destroyMounted();
  languageButton.hidden = true;
  connectionLabel.textContent = '언어 선택';
  const controller = new LanguagePackController(packService);
  const view = mountLanguagePacks({ root, controller, preview, onSelected: (pack) => {
    if (closed || mounted !== view || !canLearn()) return;
    selectedPack = pack;
    scene = 'home'; selector.value = scene;
    mountSession(pack);
  } });
  mounted = view;
  mountedKind = 'packs';
  void controller.load().then(() => {
    if (mounted !== view || !resume || !canLearn()) return;
    const state = controller.getState();
    const pack = state.packs.find((entry) => entry.id === state.selectedId && state.installedIds.includes(entry.id));
    if (pack) { selectedPack = pack; mountSession(pack); }
  });
}

function showGuest(state) {
  if (closed) return;
  if (state.status === GUEST_STATUS.READY) {
    if (!guestReadyOpened) { guestReadyOpened = true; mountPicker(true); }
    return;
  }
  guestReadyOpened = false;
  languageButton.hidden = true;
  connectionLabel.textContent = '게스트 시작';
  if (mountedKind !== 'guest') {
    destroyMounted();
    mounted = mountMobileGuest({ root, controller: guestAuth });
    mountedKind = 'guest';
  }
}

function startApp() {
  closed = false;
  if (preview) {
    if (scene !== 'languages') mountSession(selectedPack || PREVIEW_PACKS[0]);
    else mountPicker();
  } else if (legacyAuth) mountPicker(true);
  else {
    guestReadyOpened = false;
    guestAuth = new GuestSessionController({
      guestStore: managedAuth ? config.guestStore : undefined,
      baseUrl: config.baseUrl || '', origin: window.location.origin,
    });
    unsubscribeAuth = guestAuth.subscribe(showGuest);
    showGuest(guestAuth.getState());
    void guestAuth.start();
  }
}

function closeApp() {
  closed = true;
  unsubscribeAuth?.(); unsubscribeAuth = undefined;
  guestAuth?.dispose();
  destroyMounted();
}

document.getElementById('preview-controls').hidden = !preview;
document.getElementById('preview-notice').hidden = !preview;
document.getElementById('preview-link').hidden = preview;
selector.value = scene;
selector.addEventListener('change', () => {
  if (!preview) return;
  scene = selector.value;
  if (scene === 'languages') mountPicker();
  // 명시적 화면 검사 장면은 설치 증거가 아니다. 실제 앱에서는 이 경로를 사용하지 않는다.
  else mountSession(selectedPack || PREVIEW_PACKS[0]);
});
languageButton.addEventListener('click', () => { if (canLearn()) { scene = 'languages'; selector.value = scene; mountPicker(); } });
window.addEventListener?.('pagehide', closeApp);
window.addEventListener?.('pageshow', (event) => { if (event.persisted && closed) startApp(); });
startApp();

// 호스트가 제공하는 인증/전송을 연결할 때 사용할 명시적인 진입점이다.
window.LLEMobile = Object.freeze({ LearningSessionController, HttpLearningFlowTransport, mountMobileSession,
  LanguagePackCache, LanguagePackService, LanguagePackController, mountLanguagePacks,
  GuestSessionController, mountMobileGuest });
