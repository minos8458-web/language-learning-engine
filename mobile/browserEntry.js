const { LearningSessionController } = require('../src/client/learningSessionController');
const { HttpLearningFlowTransport } = require('../src/client/httpLearningFlowTransport');
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

function mountSession(pack) {
  if (mounted) mounted.destroy();
  const transport = preview
    ? createPreviewTransport(scene)
    : new HttpLearningFlowTransport({
      getAccessToken: typeof config.getAccessToken === 'function' ? config.getAccessToken : () => null,
      baseUrl: config.baseUrl || '',
    });
  mounted = mountMobileSession({
    root,
    createController: () => new LearningSessionController({ transport, userId: config.userId, language: pack.language }),
    labelForNode: preview ? (id) => PREVIEW_LABELS[id] : (id) => typeof config.labelForNode === 'function' ? config.labelForNode(id, pack.language) : null,
    connected: preview || typeof config.getAccessToken === 'function',
    preview,
  });
  connectionLabel.textContent = preview ? `${pack.name} · 미리보기` : pack.name;
  languageButton.hidden = false;
  if (preview && !['home', 'languages'].includes(scene)) void mounted.refresh();
}

function mountPicker(resume = false) {
  if (mounted) mounted.destroy();
  languageButton.hidden = true;
  connectionLabel.textContent = '언어 선택';
  const controller = new LanguagePackController(packService);
  const view = mountLanguagePacks({ root, controller, preview, onSelected: (pack) => {
    selectedPack = pack;
    scene = 'home'; selector.value = scene;
    mountSession(pack);
  } });
  mounted = view;
  void controller.load().then(() => {
    if (mounted !== view || !resume) return;
    const state = controller.getState();
    const pack = state.packs.find((entry) => entry.id === state.selectedId && state.installedIds.includes(entry.id));
    if (pack) { selectedPack = pack; mountSession(pack); }
  });
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
languageButton.addEventListener('click', () => { scene = 'languages'; selector.value = scene; mountPicker(); });
if (preview && scene !== 'languages') mountSession(PREVIEW_PACKS[0]);
else mountPicker(!preview);

// 호스트가 제공하는 인증/전송을 연결할 때 사용할 명시적인 진입점이다.
window.LLEMobile = Object.freeze({ LearningSessionController, HttpLearningFlowTransport, mountMobileSession,
  LanguagePackCache, LanguagePackService, LanguagePackController, mountLanguagePacks });
