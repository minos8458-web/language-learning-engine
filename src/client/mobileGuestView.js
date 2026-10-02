const { GUEST_STATUS } = require('./guestSessionController');

const COPY = Object.freeze({
  CHECKING: ['게스트로 시작해요', '저장된 학습 연결을 확인하고 있어요.'],
  CREATING: ['게스트로 시작해요', '게스트 연결을 준비하고 있어요.'],
  SAVING: ['학습 연결을 저장해요', '저장이 끝나면 언어팩을 선택할 수 있어요.'],
  READY: ['준비됐어요', '사용할 언어팩을 확인하고 있어요.'],
  HOST_UNAVAILABLE: ['학습 연결 준비 중', '게스트 시작과 안전한 저장 연결을 준비하고 있어요.'],
  STORAGE_ERROR: ['저장을 확인해 주세요', '학습 연결을 저장하거나 확인하지 못했어요. 다시 확인해 주세요.'],
  CREATION_UNCERTAIN: ['기존 연결을 확인해 주세요', '기존 게스트 연결을 확인하지 못했어요. 저장을 다시 확인해 주세요.'],
  EXPIRED: ['게스트 연결이 만료됐어요', '이 시연판은 만료 후 복구를 지원하지 않아요. 설치한 언어팩과 기존 학습 기록은 지우지 않아요.'],
  AUTH_REJECTED: ['게스트 연결을 확인해 주세요', '현재 게스트로 학습을 연결하지 못했어요. 기존 기록을 보존하며 연결 확인이 필요해요.'],
  DISPOSED: ['연결이 종료됐어요', '앱을 다시 실행하면 저장된 연결을 확인해요.'],
});
const BUSY = new Set(['CHECKING', 'CREATING', 'SAVING']);

function mountMobileGuest({ root, controller }) {
  if (!root || typeof root.replaceChildren !== 'function' || typeof controller?.subscribe !== 'function') {
    throw new TypeError('게스트 화면과 제어기가 필요합니다.');
  }
  const document = root.ownerDocument;
  let destroyed = false;
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function render(state) {
    if (destroyed) return;
    const [title, description] = COPY[state.status] || COPY.HOST_UNAVAILABLE;
    const busy = BUSY.has(state.status);
    const hero = element('section', 'hero');
    hero.append(element('span', 'eyebrow', '내 학습을 이어가기'), element('h1', '', title),
      element('p', 'hero-description', description));
    const card = element('section', 'learning-card guest-card');
    if (busy) {
      const spinner = element('div', 'spinner');
      spinner.setAttribute('aria-hidden', 'true');
      card.append(spinner, element('p', 'guest-progress', '연결과 저장을 확인하고 있어요.'));
    } else if (state.canRetry) {
      const retry = element('button', 'button', '저장 다시 확인');
      retry.type = 'button';
      retry.dataset.action = 'guest-retry';
      retry.addEventListener('click', () => { if (!destroyed) void controller.retryStorage(); });
      card.append(retry);
    } else {
      card.append(element('p', 'notice', state.status === GUEST_STATUS.READY ? '언어팩을 준비하고 있어요.' : description));
    }
    root.dataset.screen = 'GUEST_AUTH';
    root.dataset.guestStatus = state.status;
    root.setAttribute('aria-busy', String(busy));
    root.replaceChildren(hero, card);
  }
  const unsubscribe = controller.subscribe(render);
  render(controller.getState());
  return { destroy() {
    destroyed = true;
    unsubscribe();
    root.replaceChildren();
    delete root.dataset.guestStatus;
  } };
}

module.exports = { mountMobileGuest };
