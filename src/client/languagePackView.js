const { formatPackSize, WIFI_RECOMMEND_BYTES } = require('./languagePackService');

function mountLanguagePacks({ root, controller, onSelected, preview = false }) {
  const document = root.ownerDocument;
  let destroyed = false;
  let openerId;
  let shownId;
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(label, action, callback) {
    const node = element('button', 'button', label);
    node.type = 'button'; node.dataset.action = action;
    node.addEventListener('click', callback);
    return node;
  }
  const background = element('div', 'pack-background');
  const dialog = element('dialog', 'pack-dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'pack-dialog-title');
  dialog.setAttribute('aria-describedby', 'pack-dialog-question pack-dialog-size pack-dialog-wifi');
  const title = element('h2', '', '언어팩 다운로드'); title.id = 'pack-dialog-title';
  const question = element('p', 'pack-question'); question.id = 'pack-dialog-question';
  const size = element('p', 'pack-size'); size.id = 'pack-dialog-size';
  const wifi = element('p', 'pack-wifi', '파일이 커요. 데이터 사용량을 줄이려면 Wi-Fi에서 받는 것을 권장해요.'); wifi.id = 'pack-dialog-wifi';
  const sample = element('p', 'notice', '예시 용량이에요. 가상 다운로드만 보여주며 실제 언어팩은 받지 않아요.'); sample.hidden = !preview;
  const progressArea = element('div', 'pack-progress'); progressArea.setAttribute('role', 'status');
  const progress = element('progress'); progress.setAttribute('aria-label', '언어팩 다운로드 진행률');
  const progressText = element('p'); progressArea.append(progress, progressText);
  const error = element('p', 'pack-error'); error.setAttribute('role', 'alert');
  const confirm = button('다운로드', 'pack-confirm', async () => {
    const pack = await controller.confirm();
    if (!destroyed && pack && typeof onSelected === 'function') onSelected(pack);
  });
  const cancel = button('취소', 'pack-cancel', () => controller.cancel()); cancel.classList.add('button-secondary');
  dialog.append(title, question, size, wifi, sample, progressArea, error, confirm, cancel);
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); controller.cancel(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); controller.cancel(); }
    if (event.key !== 'Tab') return;
    const targets = [confirm, cancel].filter((node) => !node.disabled);
    const current = targets.indexOf(document.activeElement);
    if (event.shiftKey ? current <= 0 : current === targets.length - 1 || current < 0) {
      event.preventDefault(); targets[event.shiftKey ? targets.length - 1 : 0].focus();
    }
  });
  root.replaceChildren(background, dialog);
  root.dataset.screen = 'LANGUAGE_PACKS';

  function render(state) {
    if (destroyed) return;
    root.setAttribute('aria-busy', String(state.loading || state.busy));
    const hero = element('section', 'hero');
    hero.append(element('span', 'eyebrow', '내가 고르는 언어'), element('h1', '', '배우고 싶은 언어만\n가볍게 시작해요'),
      element('p', 'hero-description', '필요한 언어팩만 받아서 사용할 수 있어요. 선택하기 전에는 내려받지 않아요.'));
    const list = element('ul', 'pack-list');
    for (const pack of state.packs) {
      const item = element('li', 'pack-item');
      const installed = state.installedIds.includes(pack.id);
      const choice = button('', 'pack-choose', () => { openerId = pack.id; controller.choose(pack.id); });
      choice.className = 'pack-choice'; choice.dataset.packId = pack.id;
      choice.disabled = state.loading || state.busy || !pack.available;
      choice.append(element('span', 'pack-code', pack.language), element('strong', 'pack-name', `${pack.name} (${pack.country})`),
        element('span', 'pack-meta', `${preview ? '예시 용량' : '예상 다운로드'} · ${formatPackSize(pack.downloadBytes)}`),
        element('span', 'pack-status', installed ? (pack.id === state.selectedId ? '선택됨 · 사용하기' : '설치됨 · 사용하기') : pack.available ? '다운로드' : '준비 중'));
      item.append(choice); list.append(item);
    }
    background.replaceChildren(hero);
    if (state.loading) background.append(element('p', 'notice', '저장된 언어팩을 확인하고 있어요.'));
    if (state.packs.length) background.append(list);
    else background.append(element('section', 'learning-card', '언어팩 목록을 준비하고 있어요. 배포 파일이 준비되면 여기에서 선택할 수 있어요.'));
    if (!state.confirmation && state.error) {
      const notice = element('p', 'pack-error', state.error); notice.setAttribute('role', 'alert');
      background.append(notice, button('다시 확인', 'pack-reload', () => void controller.load()));
    }
    if (preview) background.append(element('p', 'preview-footnote', '미리보기용 목록 · 예시 용량 · 가상 다운로드 · 실제 학습 기록은 저장하지 않아요.'));
    const pack = state.confirmation;
    if (!pack) {
      background.removeAttribute('inert'); background.removeAttribute('aria-hidden');
      if (shownId) {
        if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
        shownId = null;
        const opener = [...list.querySelectorAll('[data-pack-id]')].find((node) => node.dataset.packId === openerId);
        opener?.focus();
      }
      return;
    }
    const installed = state.installedIds.includes(pack.id);
    title.textContent = installed ? '학습 언어 선택' : '언어팩 다운로드';
    question.textContent = installed ? `${pack.name} (${pack.country}) 언어팩으로 학습할까요?` : `${pack.name} (${pack.country}) 언어팩을 받으시겠어요?`;
    size.textContent = installed ? '이미 설치되어 있어요. 다시 내려받지 않아요.' : `${preview ? '예시 예상 용량' : '예상 다운로드 용량'}: ${formatPackSize(pack.downloadBytes)}`;
    wifi.hidden = installed || pack.downloadBytes < WIFI_RECOMMEND_BYTES;
    error.hidden = !state.error; error.textContent = state.error || '';
    confirm.disabled = state.busy;
    confirm.textContent = state.busy ? '준비 중…' : installed ? '이 언어로 학습하기' : state.error ? '다시 다운로드' : '다운로드';
    cancel.textContent = state.busy ? '다운로드 취소' : '취소';
    progressArea.hidden = !state.progress;
    if (state.progress) {
      const { receivedBytes, totalBytes, phase } = state.progress;
      progress.setAttribute('max', String(totalBytes)); progress.setAttribute('value', String(receivedBytes));
      progressText.textContent = phase === 'verifying' ? '파일을 확인하고 있어요.' : phase === 'storing' ? '기기에 저장하고 있어요.' : `${Math.floor(receivedBytes / totalBytes * 100)}% · ${formatPackSize(receivedBytes)} / ${formatPackSize(totalBytes)}`;
    }
    background.setAttribute('inert', ''); background.setAttribute('aria-hidden', 'true');
    if (shownId !== pack.id) {
      if (!shownId) { if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); }
      shownId = pack.id; cancel.focus();
    }
  }
  const unsubscribe = controller.subscribe(render);
  render(controller.getState());
  return { destroy() {
    destroyed = true; unsubscribe(); controller.destroy();
    if (typeof dialog.close === 'function' && dialog.hasAttribute('open')) dialog.close();
    root.replaceChildren();
  } };
}

module.exports = { mountLanguagePacks };
