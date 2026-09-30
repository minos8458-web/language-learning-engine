// 화면 검사 전용 합성 목록. 출시된 팩·실제 크기·실제 다운로드로 취급하지 않는다.
const { abortIfNeeded } = require('../src/client/languagePackService');
const PREVIEW_PACKS = Object.freeze([
  ['VI', '베트남어', '베트남', 24], ['EN', '영어', '미국', 80],
  ['JA', '일본어', '일본', 150], ['ZH', '중국어', '중국', 260],
].map(([language, name, country, megabytes]) => Object.freeze({ id: `preview-${language}`, language, name, country,
  version: 'preview', downloadBytes: megabytes * 1000 * 1000, available: true })));

function createPreviewLanguagePackService() {
  const installedIds = new Set();
  let selectedId = null;
  return {
    catalog: PREVIEW_PACKS,
    async load() { return { installedIds: [...installedIds], selectedId }; },
    async select(id, { signal } = {}) { abortIfNeeded(signal); if (!installedIds.has(id)) throw new Error('미설치'); selectedId = id; },
    async downloadAndSelect(id, { signal, onProgress }) {
      const pack = PREVIEW_PACKS.find((entry) => entry.id === id);
      if (!pack) throw new Error('합성 목록 오류');
      for (const step of [0, 25, 50, 75, 100]) {
        abortIfNeeded(signal);
        onProgress({ receivedBytes: pack.downloadBytes * step / 100, totalBytes: pack.downloadBytes, phase: 'downloading' });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      abortIfNeeded(signal);
      installedIds.add(id); selectedId = id;
    },
  };
}

module.exports = { PREVIEW_PACKS, createPreviewLanguagePackService };
