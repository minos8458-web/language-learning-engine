// src/engines/aiGenerationEngine.js
//
// AC-017/AC-018 stages 1-4. Planning reads only approved Graph/Progress APIs;
// generation uses an explicitly injected provider adapter and never persists Content.

const graphEngine = require('./graphEngine');
const progressEngine = require('./progressEngine');
const { AI_GENERATION } = require('../config/engineConfig');

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
const RAW_SCHEMA_FEEDBACK = 'Provider raw response violates exact schema';

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareStringArrays(a, b) {
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const comparison = compareStrings(a[index], b[index]);
    if (comparison !== 0) return comparison;
  }
  return a.length - b.length;
}

function normalizeNodeIds(nodeIds) {
  return [...new Set(nodeIds)].sort(compareStrings);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function hasExactKeys(value, expectedKeys) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort(compareStrings);
  const expected = [...expectedKeys].sort(compareStrings);
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

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

function validateGenerationMode(generationMode) {
  if (generationMode === undefined) {
    throw new MissingRequiredFieldError('generation_mode는 필수입니다');
  }
  if (
    generationMode === null ||
    typeof generationMode !== 'string' ||
    !['COMBINATION', 'SINGLE_NODE'].includes(generationMode)
  ) {
    throw new ContractViolationError('generation_mode는 COMBINATION 또는 SINGLE_NODE여야 합니다');
  }
}

function validateGenerationNodeIds(grammarNodeIds, expectedLength) {
  if (grammarNodeIds === undefined) {
    throw new MissingRequiredFieldError('grammar_node_ids는 필수입니다');
  }
  if (grammarNodeIds === null || !Array.isArray(grammarNodeIds)) {
    throw new ContractViolationError('grammar_node_ids는 string[]이어야 합니다');
  }
  if (
    grammarNodeIds.length !== expectedLength ||
    grammarNodeIds.some((nodeId) => typeof nodeId !== 'string' || nodeId.trim().length === 0)
  ) {
    throw new ContractViolationError(`grammar_node_ids 길이는 정확히 ${expectedLength}이어야 합니다`);
  }
  if (new Set(grammarNodeIds).size !== grammarNodeIds.length) {
    throw new ContractViolationError('grammar_node_ids는 중복될 수 없습니다');
  }
  const sorted = [...grammarNodeIds].sort(compareStrings);
  if (!arraysEqual(sorted, grammarNodeIds)) {
    throw new ContractViolationError('grammar_node_ids는 사전순으로 정렬되어야 합니다');
  }
}

function validateRecentGeneratedContent(recentGeneratedContent) {
  if (recentGeneratedContent === undefined) {
    throw new MissingRequiredFieldError('recent_generated_content는 필수입니다');
  }
  if (
    recentGeneratedContent === null ||
    !Array.isArray(recentGeneratedContent) ||
    recentGeneratedContent.length > 5
  ) {
    throw new ContractViolationError('recent_generated_content는 길이 0~5의 배열이어야 합니다');
  }

  for (const item of recentGeneratedContent) {
    if (!hasExactKeys(item, ['content_id', 'media_assets', 'created_at'])) {
      throw new ContractViolationError('recent_generated_content item은 exact 3-key object여야 합니다');
    }
    if (
      typeof item.content_id !== 'string' ||
      item.content_id.trim().length === 0 ||
      typeof item.created_at !== 'string' ||
      Number.isNaN(Date.parse(item.created_at)) ||
      !Array.isArray(item.media_assets) ||
      item.media_assets.length === 0 ||
      item.media_assets[0] === null ||
      typeof item.media_assets[0] !== 'object' ||
      typeof item.media_assets[0].asset_ref !== 'string' ||
      item.media_assets[0].asset_ref.trim().length === 0
    ) {
      throw new ContractViolationError('recent_generated_content item 값이 canonical 계약과 다릅니다');
    }
  }
}

function rawResponseIsValid(raw) {
  return (
    hasExactKeys(raw, ['generated_text', 'answer_key', 'self_reported_node_ids']) &&
    typeof raw.generated_text === 'string' &&
    raw.generated_text.trim().length > 0 &&
    typeof raw.answer_key === 'string' &&
    raw.answer_key.trim().length > 0 &&
    Array.isArray(raw.self_reported_node_ids) &&
    raw.self_reported_node_ids.every((nodeId) => typeof nodeId === 'string')
  );
}

function validateValidatorResponse(response) {
  if (
    !hasExactKeys(response, ['is_valid', 'violations']) ||
    typeof response.is_valid !== 'boolean' ||
    !Array.isArray(response.violations) ||
    response.violations.some(
      (violation) => typeof violation !== 'string' || violation.trim().length === 0
    ) ||
    (response.is_valid && response.violations.length !== 0) ||
    (!response.is_valid && response.violations.length === 0)
  ) {
    throw new Error('Provider validator response violates exact schema');
  }
  return response;
}

function deterministicRuleViolations(generatedText, grammarNodes) {
  const normalizedText = generatedText.toLocaleLowerCase();
  return grammarNodes
    .filter(({ label }) => !normalizedText.includes(label.toLocaleLowerCase()))
    .map(({ label }) => `Generated text is missing required grammar label: ${label}`);
}

function buildCandidates(nodeIds, mode) {
  if (mode === 'SINGLE_NODE') return nodeIds.map((nodeId) => [nodeId]);
  const combinations = [];
  for (let left = 0; left < nodeIds.length; left += 1) {
    for (let right = left + 1; right < nodeIds.length; right += 1) {
      combinations.push([nodeIds[left], nodeIds[right]]);
    }
  }
  return combinations;
}

async function selectGenerationCandidates(
  pool,
  userId,
  language,
  generationMode,
  targetConceptId
) {
  validateRequiredUserId(userId);
  validateRequiredLanguage(language);
  validateGenerationMode(generationMode);
  validateOptionalIdentifier(targetConceptId, 'target_concept_id');

  if (targetConceptId !== undefined) {
    await graphEngine.getConceptCategories(pool, [targetConceptId]);
  }

  const eligibleNodeIds = normalizeNodeIds(
    await progressEngine.getEligibleNodes(pool, userId, language)
  );
  const nodeFacts = eligibleNodeIds.length === 0
    ? {}
    : await graphEngine.getNodeLanguageAndConcepts(pool, eligibleNodeIds);
  const recentAttempts = await progressEngine.getRecentAttemptedCombinations(
    pool,
    userId,
    language
  );

  const languageEligibleIds = eligibleNodeIds.filter(
    (nodeId) => nodeFacts[nodeId] && nodeFacts[nodeId].language === language
  );
  let candidates = buildCandidates(languageEligibleIds, generationMode);
  if (targetConceptId !== undefined) {
    candidates = candidates.filter((candidate) =>
      candidate.some((nodeId) => nodeFacts[nodeId].concept_ids.includes(targetConceptId))
    );
  }
  if (candidates.length === 0) return { grammar_node_ids: null };

  const normalizedHistory = recentAttempts.map((attempt) =>
    normalizeNodeIds(attempt.grammar_node_ids)
  );
  candidates.sort((left, right) => {
    const leftCount = normalizedHistory.filter((history) => arraysEqual(left, history)).length;
    const rightCount = normalizedHistory.filter((history) => arraysEqual(right, history)).length;
    return leftCount - rightCount || compareStringArrays(left, right);
  });

  return { grammar_node_ids: candidates[0] };
}

async function callWithTechnicalRetry(operation, request) {
  for (let attempt = 0; attempt <= AI_GENERATION.technicalRetryCount; attempt += 1) {
    try {
      return { ok: true, value: await operation(request) };
    } catch {
      if (attempt === AI_GENERATION.technicalRetryCount) return { ok: false, value: null };
    }
  }
  return { ok: false, value: null };
}

async function generateCandidate(
  providerAdapter,
  pool,
  language,
  grammarNodeIds,
  recentGeneratedContent,
  useValidator
) {
  validateRequiredLanguage(language);
  validateGenerationNodeIds(grammarNodeIds, useValidator ? 2 : 1);
  validateRecentGeneratedContent(recentGeneratedContent);

  const nodeFacts = await graphEngine.getNodeLanguageAndConcepts(pool, grammarNodeIds);
  const nodeLanguages = new Set(grammarNodeIds.map((nodeId) => nodeFacts[nodeId].language));
  if (nodeLanguages.size !== 1 || !nodeLanguages.has(language)) {
    throw new ContractViolationError('grammar_node_ids의 language가 요청 language와 다릅니다');
  }
  const labels = await graphEngine.getNodeLabels(pool, grammarNodeIds);
  const grammarNodes = grammarNodeIds.map((nodeId) => {
    const label = labels[nodeId];
    if (typeof label !== 'string' || label.trim().length === 0) {
      throw new ContractViolationError(`node label이 유효하지 않습니다: ${nodeId}`);
    }
    return { node_id: nodeId, label };
  });
  const recentGeneratedTexts = recentGeneratedContent.map(
    (item) => item.media_assets[0].asset_ref
  );

  let regenerationFeedback = [];
  for (
    let generationAttempt = 0;
    generationAttempt <= AI_GENERATION.maxRegenerationAttempts;
    generationAttempt += 1
  ) {
    const generationRequest = {
      language,
      grammar_nodes: grammarNodes,
      recent_generated_texts: recentGeneratedTexts,
      regeneration_feedback: regenerationFeedback,
    };
    const generationResult = await callWithTechnicalRetry(
      providerAdapter.generateStructuredContent.bind(providerAdapter),
      generationRequest
    );
    if (!generationResult.ok) return { candidate: null };

    const raw = generationResult.value;
    if (!rawResponseIsValid(raw)) {
      regenerationFeedback = [RAW_SCHEMA_FEEDBACK];
      continue;
    }

    const ruleViolations = deterministicRuleViolations(raw.generated_text, grammarNodes);
    if (ruleViolations.length > 0) {
      regenerationFeedback = ruleViolations;
      continue;
    }

    if (useValidator) {
      const validatorRequest = {
        language,
        grammar_nodes: grammarNodes,
        generated_text: raw.generated_text,
      };
      const validatorResult = await callWithTechnicalRetry(
        async (request) =>
          validateValidatorResponse(await providerAdapter.validateGeneratedContent(request)),
        validatorRequest
      );
      if (!validatorResult.ok) return { candidate: null };
      if (!validatorResult.value.is_valid) {
        regenerationFeedback = validatorResult.value.violations;
        continue;
      }
    }

    return {
      candidate: {
        grammar_node_ids: grammarNodeIds,
        media_assets: [
          { media_format: 'TEXT', asset_ref: raw.generated_text, role: 'PRIMARY' },
        ],
        type_specific_metadata: { answer_key: raw.answer_key },
      },
    };
  }

  return { candidate: null };
}

function createAiGenerationEngine({ providerAdapter } = {}) {
  if (
    providerAdapter === null ||
    typeof providerAdapter !== 'object' ||
    typeof providerAdapter.generateStructuredContent !== 'function' ||
    typeof providerAdapter.validateGeneratedContent !== 'function'
  ) {
    throw new TypeError(
      'providerAdapter must provide generateStructuredContent and validateGeneratedContent'
    );
  }

  return {
    selectGenerationCandidates,
    generateCombination(pool, language, grammarNodeIds, recentGeneratedContent) {
      return generateCandidate(
        providerAdapter,
        pool,
        language,
        grammarNodeIds,
        recentGeneratedContent,
        true
      );
    },
    generateSingleNode(pool, language, grammarNodeIds, recentGeneratedContent) {
      return generateCandidate(
        providerAdapter,
        pool,
        language,
        grammarNodeIds,
        recentGeneratedContent,
        false
      );
    },
  };
}

module.exports = {
  selectGenerationCandidates,
  createAiGenerationEngine,
  NotFoundError,
  ContractViolationError,
  MissingRequiredFieldError,
  OutOfRangeValueError,
};
