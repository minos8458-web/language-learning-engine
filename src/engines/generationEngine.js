// src/engines/generationEngine.js
//
// AC-017/AC-018 four-step generation ladder. The Engine is composed only with
// injected AI Generation and Content dependencies; it has no SQL or Graph/Progress access.

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = 'INVALID_ID';
  }
}

class ContractViolationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContractViolationError';
    this.code = 'CONTRACT_VIOLATION';
  }
}

class MissingRequiredFieldError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MissingRequiredFieldError';
    this.code = 'MISSING_REQUIRED_FIELD';
  }
}

class OutOfRangeValueError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OutOfRangeValueError';
    this.code = 'OUT_OF_RANGE_VALUE';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CONTRACT_ERROR_CODES = new Set([
  'INVALID_ID',
  'MISSING_REQUIRED_FIELD',
  'UNAUTHORIZED_CALLER',
  'OUT_OF_RANGE_VALUE',
  'CONTRACT_VIOLATION',
]);

function validateRequiredUserId(userId) {
  if (userId === undefined) throw new MissingRequiredFieldError('user_id는 필수입니다');
  if (userId === null || typeof userId !== 'string') {
    throw new ContractViolationError('user_id는 string이어야 합니다');
  }
  if (!UUID_PATTERN.test(userId)) throw new NotFoundError(`유효하지 않은 user_id: ${userId}`);
}

function validateRequiredLanguage(language) {
  if (language === undefined) throw new MissingRequiredFieldError('language는 필수입니다');
  if (language === null || typeof language !== 'string') {
    throw new ContractViolationError('language는 string이어야 합니다');
  }
  if (!/^[A-Z]{2}$/.test(language)) {
    throw new OutOfRangeValueError('language는 ISO 639-1 대문자 2글자여야 합니다');
  }
}

function validateOptionalIdentifier(value, fieldName) {
  if (value === undefined) return;
  if (value === null || typeof value !== 'string' || value.trim().length === 0) {
    throw new ContractViolationError(`${fieldName}는 비어 있지 않은 string이어야 합니다`);
  }
}

function aiSuccessPayload(content, ladderStep) {
  return {
    content,
    content_id: content.content_id,
    source: 'AI_GENERATED',
    ladder_step: ladderStep,
  };
}

function noContentPayload() {
  return { content: null, content_id: null, source: null, ladder_step: 4 };
}

async function readPreMadeWithRetry(contentEngine, pool, targetNodeId) {
  for (let attempt = 0; attempt <= 1; attempt += 1) {
    try {
      return await contentEngine.getContent(pool, targetNodeId, 'EXAMPLE');
    } catch (error) {
      if (error && CONTRACT_ERROR_CODES.has(error.code)) throw error;
      if (attempt === 1) {
        const readError = new Error('PRE_MADE Content read failed');
        readError.name = 'ContentReadError';
        throw readError;
      }
    }
  }
  return [];
}

function createGenerationEngine({ aiGenerationEngine, contentEngine } = {}) {
  if (
    aiGenerationEngine === null ||
    typeof aiGenerationEngine !== 'object' ||
    typeof aiGenerationEngine.selectGenerationCandidates !== 'function' ||
    typeof aiGenerationEngine.generateCombination !== 'function' ||
    typeof aiGenerationEngine.generateSingleNode !== 'function'
  ) {
    throw new TypeError(
      'aiGenerationEngine must provide selectGenerationCandidates, generateCombination, and generateSingleNode'
    );
  }
  if (
    contentEngine === null ||
    typeof contentEngine !== 'object' ||
    typeof contentEngine.getRecentGeneratedContent !== 'function' ||
    typeof contentEngine.saveGeneratedContent !== 'function' ||
    typeof contentEngine.getContent !== 'function'
  ) {
    throw new TypeError(
      'contentEngine must provide getRecentGeneratedContent, saveGeneratedContent, and getContent'
    );
  }

  async function generateProblem(pool, userId, language, targetConceptId, targetNodeId) {
    validateRequiredUserId(userId);
    validateRequiredLanguage(language);
    validateOptionalIdentifier(targetConceptId, 'target_concept_id');
    validateOptionalIdentifier(targetNodeId, 'target_node_id');

    const combinationPlan = await aiGenerationEngine.selectGenerationCandidates(
      pool,
      userId,
      language,
      'COMBINATION',
      targetConceptId
    );
    if (combinationPlan.grammar_node_ids !== null) {
      const recentGeneratedContent = await contentEngine.getRecentGeneratedContent(
        pool,
        combinationPlan.grammar_node_ids,
        language
      );
      const combination = await aiGenerationEngine.generateCombination(
        pool,
        language,
        combinationPlan.grammar_node_ids,
        recentGeneratedContent
      );
      if (combination.candidate !== null) {
        const saved = await contentEngine.saveGeneratedContent(
          pool,
          combination.candidate.grammar_node_ids,
          'QUIZ',
          combination.candidate.media_assets,
          combination.candidate.type_specific_metadata
        );
        return aiSuccessPayload(saved, 1);
      }
    }

    const singlePlan = await aiGenerationEngine.selectGenerationCandidates(
      pool,
      userId,
      language,
      'SINGLE_NODE',
      targetConceptId
    );
    if (singlePlan.grammar_node_ids !== null) {
      const recentGeneratedContent = await contentEngine.getRecentGeneratedContent(
        pool,
        singlePlan.grammar_node_ids,
        language
      );
      const single = await aiGenerationEngine.generateSingleNode(
        pool,
        language,
        singlePlan.grammar_node_ids,
        recentGeneratedContent
      );
      if (single.candidate !== null) {
        const saved = await contentEngine.saveGeneratedContent(
          pool,
          single.candidate.grammar_node_ids,
          'QUIZ',
          single.candidate.media_assets,
          single.candidate.type_specific_metadata
        );
        return aiSuccessPayload(saved, 2);
      }
    }

    if (targetNodeId === undefined) return noContentPayload();

    const preMade = await readPreMadeWithRetry(contentEngine, pool, targetNodeId);
    if (!Array.isArray(preMade)) {
      throw new ContractViolationError('getContent 조건 기반 결과는 배열이어야 합니다');
    }
    if (preMade.length === 0) return noContentPayload();
    if (preMade.length > 1) {
      console.error('PRE_MADE Content cardinality invariant violated');
      const invariantError = new Error('PRE_MADE Content invariant violation');
      invariantError.name = 'ContentInvariantError';
      throw invariantError;
    }

    return {
      content: preMade[0],
      content_id: preMade[0].content_id,
      source: 'PRE_MADE',
      ladder_step: 3,
    };
  }

  return { generateProblem };
}

module.exports = {
  createGenerationEngine,
  NotFoundError,
  ContractViolationError,
  MissingRequiredFieldError,
  OutOfRangeValueError,
};
