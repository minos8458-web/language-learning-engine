class LanguagePackController {
  constructor(service) {
    this.service = service;
    this.listeners = new Set();
    this.state = { packs: service.catalog, installedIds: [], selectedId: null, loading: true, busy: false, confirmation: null, progress: null, error: null };
    this.operation = 0;
    this.destroyed = false;
  }

  getState() { return { ...this.state, installedIds: [...this.state.installedIds] }; }
  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  update(change) {
    if (this.destroyed) return;
    this.state = { ...this.state, ...change };
    for (const listener of this.listeners) listener(this.getState());
  }

  async load() {
    if (this.destroyed || this.state.busy) return;
    const operation = ++this.operation;
    this.update({ loading: true, error: null });
    try {
      const stored = await this.service.load();
      if (this.destroyed || operation !== this.operation) return;
      this.update({ ...stored, loading: false });
    } catch {
      if (operation === this.operation) this.update({ loading: false, error: '저장된 언어팩을 확인하지 못했어요. 다시 시도해 주세요.' });
    }
  }

  choose(id) {
    if (this.destroyed || this.state.loading || this.state.busy) return;
    const pack = this.state.packs.find((entry) => entry.id === id);
    if (!pack?.available) return;
    this.update({ confirmation: pack, error: null, progress: null });
  }

  cancel() {
    this.operation += 1;
    this.abortController?.abort();
    this.update({ busy: false, confirmation: null, progress: null, error: null });
  }

  async confirm() {
    if (this.destroyed || this.state.busy || !this.state.confirmation) return null;
    const pack = this.state.confirmation;
    const operation = ++this.operation;
    const abortController = new AbortController();
    this.abortController = abortController;
    this.update({ busy: true, error: null });
    try {
      if (this.state.installedIds.includes(pack.id)) await this.service.select(pack.id, { signal: abortController.signal });
      else await this.service.downloadAndSelect(pack.id, {
        signal: abortController.signal,
        onProgress: (progress) => { if (operation === this.operation) this.update({ progress }); },
      });
      const stored = await this.service.load();
      if (this.destroyed || operation !== this.operation || abortController.signal.aborted) return null;
      if (!stored.installedIds.includes(pack.id) || stored.selectedId !== pack.id) throw new Error('저장 확인 실패');
      this.update({ ...stored, busy: false, confirmation: null, progress: null });
      return pack;
    } catch {
      if (operation === this.operation) this.update({ busy: false, progress: null, error: '언어팩을 받거나 저장하지 못했어요. 연결과 저장 공간을 확인한 뒤 다시 시도해 주세요.' });
      return null;
    }
  }

  destroy() { this.cancel(); this.destroyed = true; this.listeners.clear(); }
}

module.exports = { LanguagePackController };
