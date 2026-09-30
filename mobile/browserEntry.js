const { LearningSessionController } = require('../src/client/learningSessionController');
const { HttpLearningFlowTransport } = require('../src/client/httpLearningFlowTransport');
const { mountMobileSession } = require('../src/client/mobileSessionView');
const { createPreviewTransport, PREVIEW_LABELS } = require('./previewTransport');

const config = window.LLE_APP_CONFIG || {};
const query = new URLSearchParams(window.location.search);
const preview = query.get('preview') === '1';
const choices = ['home', 'review', 'new', 'interleaving', 'conversation', 'idle', 'error'];
let scene = choices.includes(query.get('scene')) ? query.get('scene') : 'home';
let mounted;

function mount() {
  if (mounted) mounted.destroy();
  const transport = preview
    ? createPreviewTransport(scene)
    : new HttpLearningFlowTransport({
      getAccessToken: typeof config.getAccessToken === 'function' ? config.getAccessToken : () => null,
      baseUrl: config.baseUrl || '',
    });
  mounted = mountMobileSession({
    root: document.getElementById('learning-root'),
    createController: () => new LearningSessionController({ transport, userId: config.userId, language: config.language || 'VI' }),
    labelForNode: preview ? (id) => PREVIEW_LABELS[id] : config.labelForNode,
    connected: preview || typeof config.getAccessToken === 'function',
    preview,
  });
  if (preview && scene !== 'home') void mounted.refresh();
}

document.getElementById('preview-controls').hidden = !preview;
document.getElementById('preview-notice').hidden = !preview;
document.getElementById('preview-link').hidden = preview;
document.getElementById('connection-label').textContent = preview ? '화면 미리보기' : '베트남어';
const selector = document.getElementById('preview-scene');
selector.value = scene;
selector.addEventListener('change', () => {
  scene = selector.value;
  mount();
});
mount();

// 호스트가 제공하는 인증/전송을 연결할 때 사용할 명시적인 진입점이다.
window.LLEMobile = Object.freeze({ LearningSessionController, HttpLearningFlowTransport, mountMobileSession });
