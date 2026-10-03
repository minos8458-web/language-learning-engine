const { REQUEST_STATUS, SESSION_STATUS, SCREEN_KIND } = require('./learningSessionController');

const SCREEN_COPY = Object.freeze({
  REVIEW: ['복습', '배운 문법을 다시 꺼내볼까요?', '서버가 정한 순서대로 복습할 항목이에요.'],
  NEW_GRAMMAR: ['새 문법', '표현의 재료를 하나 더', '학습을 시작하면 이 문법을 연습할 준비가 돼요.'],
  INTERLEAVING: ['교차 연습', '익숙한 문법을 함께 써봐요', '서버가 정한 연습 순서예요. 같은 문법이 다시 나올 수 있어요.'],
  CONVERSATION_BOUNDARY: ['대화 연습', '대화 연습을 준비하고 있어요', '대화 기능이 준비되면 여기에서 연습할 수 있어요. 지금 가능한 다음 학습을 확인해 보세요.'],
  IDLE: ['학습 완료', '오늘의 학습을 마쳤어요', '지금 필요한 학습을 모두 확인했어요. 다음에도 함께 이어가요.'],
});

function mobileScreenModel(state) {
  if (state.sessionStatus === SESSION_STATUS.ENDED) {
    return { kind: 'ENDED', tag: '세션 종료', title: '다음에 다시 이어가요', description: '새 세션에서 최신 학습을 확인할 수 있어요.', nodeIds: [] };
  }
  if (state.requestStatus === REQUEST_STATUS.LOADING) {
    return { kind: 'LOADING', tag: '준비 중', title: '다음 학습을 준비하고 있어요', description: '잠시만 기다려 주세요.', nodeIds: [] };
  }
  if (state.requestStatus === REQUEST_STATUS.ERROR) {
    return { kind: 'ERROR', tag: '연결 확인', title: '학습을 불러오지 못했어요', description: '연결을 확인한 뒤 다시 시도해 주세요. 학습 완료로 처리하지 않았어요.', nodeIds: [] };
  }
  if (state.requestStatus === REQUEST_STATUS.IDLE) {
    return { kind: 'HOME', tag: '오늘의 언어 학습', title: '배운 표현이\n내 말이 되도록', description: '기억을 꺼내고, 문법을 연결하고, 새로운 문장으로 이어가요.', nodeIds: [] };
  }
  const screen = state.currentScreen;
  if (!screen || !Object.hasOwn(SCREEN_COPY, screen.kind)) {
    throw new TypeError('올바른 학습 화면 상태가 필요합니다');
  }
  const [tag, title, description] = SCREEN_COPY[screen.kind];
  let nodeIds = [];
  if (screen.kind === SCREEN_KIND.REVIEW) nodeIds = screen.reviewBatch.map((item) => item.node_id);
  if (screen.kind === SCREEN_KIND.NEW_GRAMMAR) nodeIds = [screen.nodeId];
  if (screen.kind === SCREEN_KIND.INTERLEAVING) nodeIds = [...screen.nodeSequence];
  return { kind: screen.kind, tag, title, description, nodeIds };
}

function mountMobileSession({ root, createController, labelForNode, connected = true, preview = false }) {
  if (!root || typeof root.replaceChildren !== 'function' || typeof createController !== 'function') {
    throw new TypeError('root와 createController가 필요합니다');
  }
  const document = root.ownerDocument;
  let controller = createController();
  let busy = false;
  let destroyed = false;
  let admittedNodeId = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(label, action, { secondary = false, disabled = false } = {}) {
    const node = element('button', secondary ? 'button button-secondary' : 'button', label);
    node.type = 'button';
    node.disabled = disabled || busy;
    node.dataset.action = action;
    node.addEventListener('click', () => void perform(action));
    return node;
  }

  function render() {
    if (destroyed) return;
    const state = controller.getState();
    const model = mobileScreenModel(state);
    const content = document.createDocumentFragment();
    const hero = element('section', 'hero');
    hero.append(element('span', 'eyebrow', model.tag), element('h1', '', model.title), element('p', 'hero-description', model.description));
    content.append(hero);

    if (model.kind === 'HOME') {
      const card = element('section', 'learning-card home-card');
      card.append(element('div', 'card-mark', '말'), element('h2', '', '오늘의 작은 연습'), element('p', '', connected ? '지금 필요한 학습부터 차근차근 시작해요.' : '학습 연결을 준비하고 있어요. 준비가 끝나면 여기에서 시작할 수 있어요.'));
      card.append(button(connected ? '학습 시작' : '학습 연결 준비 중', 'start', { disabled: !connected }));
      content.append(card);
      const principles = element('div', 'principles');
      for (const [title, text] of [['다시 꺼내기', '배운 내용을 내 힘으로'], ['함께 쓰기', '문법을 연결해서'], ['새롭게 말하기', '다른 상황에서도']]) {
        const item = element('div', 'principle');
        item.append(element('strong', '', title), element('span', '', text));
        principles.append(item);
      }
      content.append(principles);
    } else if (model.kind === 'LOADING') {
      const card = element('section', 'learning-card loading-card');
      const spinner = element('div', 'spinner');
      spinner.setAttribute('aria-hidden', 'true');
      card.append(spinner, element('p', '', '학습 상태를 확인하고 있어요.'));
      content.append(card);
    } else {
      const card = element('section', 'learning-card');
      if (model.nodeIds.length) {
        const header = element('div', 'card-header');
        header.append(element('h2', '', model.kind === SCREEN_KIND.NEW_GRAMMAR ? '이번에 알아볼 문법' : '이번 학습 순서'), element('span', 'count-pill', `${model.nodeIds.length}개`));
        card.append(header);
        const list = element('ol', 'node-list');
        model.nodeIds.forEach((nodeId, index) => {
          const item = element('li', 'node-item');
          item.dataset.nodeId = nodeId;
          const label = typeof labelForNode === 'function' ? labelForNode(nodeId) : null;
          item.append(element('span', 'node-number', String(index + 1).padStart(2, '0')), element('span', 'node-label', typeof label === 'string' && label.trim() ? label : `학습 항목 ${index + 1}`));
          list.append(item);
        });
        card.append(list);
      }
      if (model.kind === SCREEN_KIND.NEW_GRAMMAR) {
        const admitted = admittedNodeId === state.currentScreen.nodeId;
        if (admitted) card.append(element('p', 'notice', '문법 학습을 시작했어요. 문제 화면을 준비하고 있어요.'));
        card.append(button(admitted ? '학습 시작됨' : '문법 학습 시작', 'admit', { disabled: admitted }));
      } else if (model.kind === SCREEN_KIND.CONVERSATION_BOUNDARY) {
        card.append(element('div', 'card-mark', '말'), button('다음 학습 확인', 'acknowledge'));
      } else if (model.kind === SCREEN_KIND.IDLE) {
        card.append(element('div', 'card-mark complete-mark', '✓'), element('h2', '', '오늘도 한 걸음'), element('p', '', '다음 세션에서 필요한 학습을 다시 확인해요.'));
      } else if (model.kind === 'ERROR') {
        card.append(element('div', 'card-mark', '!'), button('다시 시도', 'start'));
      } else if (model.kind === SCREEN_KIND.REVIEW || model.kind === SCREEN_KIND.INTERLEAVING) {
        card.append(element('p', 'notice', '문제와 답안 제출 화면을 준비하고 있어요.'), button('연습 연결 준비 중', 'unavailable', { disabled: true }));
      }
      if (![SCREEN_KIND.CONVERSATION_BOUNDARY, 'ERROR', 'ENDED'].includes(model.kind)) {
        card.append(button('학습 상태 새로고침', 'start', { secondary: true }));
      }
      content.append(card);
      content.append(button('새 세션 시작', 'restart', { secondary: true }));
    }
    if (preview) content.append(element('p', 'preview-footnote', '화면 미리보기 · 실제 학습 기록은 저장하지 않아요.'));
    root.dataset.screen = model.kind;
    root.setAttribute('aria-busy', String(busy));
    root.replaceChildren(content);
  }

  async function perform(action) {
    if (destroyed || busy || !connected) return;
    if (!['start', 'admit', 'acknowledge', 'restart'].includes(action)) return;
    busy = true;
    let operation;
    try {
      if (action === 'restart') {
        controller.endSession();
        controller = createController();
        admittedNodeId = null;
        operation = controller.start();
      } else if (action === 'admit') {
        const proposedNodeId = controller.getState().currentScreen.nodeId;
        operation = controller.startProposedExplicitStudy().then((result) => {
          // capacity 충돌의 최신 화면 반환은 입학 성공으로 표시하지 않는다.
          if (!result || !Object.hasOwn(result, 'requestStatus')) admittedNodeId = proposedNodeId;
        });
      } else if (action === 'acknowledge') {
        operation = controller.acknowledgeConversationBoundary();
      } else {
        admittedNodeId = null;
        operation = controller.start();
      }
      render();
      await operation;
    } finally {
      busy = false;
      render();
    }
  }

  render();
  return {
    getState: () => controller.getState(),
    refresh: () => perform('start'),
    destroy() {
      destroyed = true;
      controller.endSession();
      root.replaceChildren();
    },
  };
}

module.exports = { mobileScreenModel, mountMobileSession };
