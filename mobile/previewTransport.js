// 명시적으로 선택하는 화면 미리보기다. 학습 엔진·DB·실제 AI를 호출하지 않는다.
const PREVIEW_LABELS = Object.freeze({
  NODE_MOBILE_PREVIEW_A: '지난 일 말하기',
  NODE_MOBILE_PREVIEW_B: '하고 있는 일 말하기',
  NODE_MOBILE_PREVIEW_C: '생각과 느낌 연결하기',
});

function createPreviewTransport(scene = 'home') {
  const nodeIds = Object.keys(PREVIEW_LABELS);
  return {
    async startSession(_userId, _language, acknowledged) {
      if (scene === 'error') throw new Error('미리보기에서 선택한 연결 실패');
      if (scene === 'conversation') return { next_action: acknowledged ? 'IDLE' : 'CONVERSATION' };
      if (scene === 'idle') return { next_action: 'IDLE' };
      if (scene === 'review') {
        return {
          next_action: 'REVIEW',
          review_batch: nodeIds.slice(0, 2).map((nodeId) => ({
            node_id: nodeId, state: 'PRACTICING', next_review_at: null,
            overdue_by: 0, priority: 0, reason: 'MOBILE_SCREEN_PREVIEW',
          })),
        };
      }
      if (scene === 'interleaving') {
        return { next_action: 'INTERLEAVING', node_sequence: [nodeIds[0], nodeIds[1], nodeIds[2], nodeIds[0], nodeIds[1], nodeIds[2]] };
      }
      return { next_action: 'NEW_GRAMMAR', node_id: nodeIds[0] };
    },
    async startExplicitStudy(_userId, nodeId) {
      return { node_id: nodeId, preview: true };
    },
  };
}

module.exports = { createPreviewTransport, PREVIEW_LABELS };
