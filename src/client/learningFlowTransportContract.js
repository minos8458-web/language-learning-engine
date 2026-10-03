// Shared production contract between a learning-session client and its transport.
// The transport preserves canonical server error codes while identifying the one
// CONTRACT_VIOLATION origin for which CLIENT_BRIEF §2 requires a fresh decision.

class CapacityAdmissionConflictError extends Error {
  constructor(cause) {
    super(cause.message, { cause });
    this.name = 'CapacityAdmissionConflictError';
    this.code = cause.code;
  }
}

// API 10.1: validate at the client boundary; never repair or normalize a response.
function assertExplicitStudyResult(data, nodeId) {
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  const exact = (value, keys) => object(value) && Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key));
  const content = (item, type) => item === null || (
    exact(item, ['content_id', 'grammar_node_ids', 'content_type', 'media_assets', 'difficulty', 'type_specific_metadata']) &&
    text(item.content_id) && item.content_type === type &&
    Array.isArray(item.grammar_node_ids) && item.grammar_node_ids.length === 1 && item.grammar_node_ids[0] === nodeId &&
    Number.isFinite(item.difficulty) && item.difficulty >= 1 && item.difficulty <= 5 &&
    Array.isArray(item.media_assets) && item.media_assets.length > 0 &&
    Array.from(item.media_assets).every((asset) => object(asset) &&
      ['TEXT', 'AUDIO', 'IMAGE', 'VIDEO'].includes(asset.media_format) && text(asset.asset_ref) &&
      (asset.role === undefined || ['PRIMARY', 'SUPPLEMENTARY'].includes(asset.role))) &&
    (item.type_specific_metadata === null || object(item.type_specific_metadata)) &&
    (type !== 'QUIZ' || (object(item.type_specific_metadata) && text(item.type_specific_metadata.answer_key)))
  );
  if (!exact(data, ['explanation', 'state', 'initial_practice']) ||
      !['NOT_INTRODUCED', 'INTRODUCED', 'STUDYING', 'PRACTICING', 'MASTERED', 'AUTOMATIC'].includes(data.state) ||
      !content(data.explanation, 'EXPLANATION') || !content(data.initial_practice, 'QUIZ')) {
    throw new Error('학습 연결에서 올바른 응답을 받지 못했어요.');
  }
  return data;
}

function assertLearningFlowTransport(transport) {
  if (
    transport === null ||
    typeof transport !== 'object' ||
    typeof transport.startSession !== 'function' ||
    typeof transport.startExplicitStudy !== 'function'
  ) {
    throw new TypeError('transport must implement startSession and startExplicitStudy');
  }
}

module.exports = {
  assertExplicitStudyResult,
  CapacityAdmissionConflictError,
  assertLearningFlowTransport,
};
