// src/engines/contentEngine.js
//
// AC-017/AC-018 Content boundary. This leaf Engine owns Content reads and the
// only AI-generated Content write path. It never calls another Engine.

const { randomUUID } = require('node:crypto');
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

const CONTENT_TYPE_ABBREVIATIONS = {
  EXPLANATION: 'EXPL',
  EXAMPLE: 'EXAMPLE',
  QUIZ: 'QUIZ',
  MINIMAL_PAIR: 'MINPAIR',
  DIALOGUE: 'DIALOGUE',
  LISTENING: 'LISTEN',
  SHADOWING: 'SHADOW',
  CONVERSATION_SEED: 'CONVSEED',
  TRANSFER_EXERCISE: 'TRANSFER',
  ERROR_PATTERN: 'ERRPATTERN',
};

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function hasExactKeys(value, expectedKeys) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort(compareStrings);
  const expected = [...expectedKeys].sort(compareStrings);
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function validateRequiredStringArray(value, fieldName, { allowEmpty = false } = {}) {
  if (value === undefined) {
    throw new MissingRequiredFieldError(`${fieldName}는 필수입니다`);
  }
  if (value === null || !Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new ContractViolationError(`${fieldName}는 비어 있지 않은 string[]이어야 합니다`);
  }
  for (const item of value) {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw new ContractViolationError(
        `${fieldName}의 모든 원소는 비어 있지 않은 문자열이어야 합니다`
      );
    }
  }
  return [...new Set(value)].sort(compareStrings);
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

function validateContentType(contentType) {
  if (contentType === undefined) throw new MissingRequiredFieldError('content_type은 필수입니다');
  if (contentType === null || typeof contentType !== 'string') {
    throw new ContractViolationError('content_type은 string이어야 합니다');
  }
  if (!Object.hasOwn(CONTENT_TYPE_ABBREVIATIONS, contentType)) {
    throw new ContractViolationError(`정의되지 않은 content_type: ${contentType}`);
  }
}

function validateMediaAssets(mediaAssets) {
  if (mediaAssets === undefined) throw new MissingRequiredFieldError('media_assets는 필수입니다');
  if (mediaAssets === null || !Array.isArray(mediaAssets) || mediaAssets.length !== 1) {
    throw new ContractViolationError('media_assets는 정확히 한 개의 item을 가져야 합니다');
  }
  const item = mediaAssets[0];
  if (!hasExactKeys(item, ['media_format', 'asset_ref', 'role'])) {
    throw new ContractViolationError('media_assets item은 exact 3-key object여야 합니다');
  }
  if (
    item.media_format !== 'TEXT' ||
    item.role !== 'PRIMARY' ||
    typeof item.asset_ref !== 'string' ||
    item.asset_ref.trim().length === 0
  ) {
    throw new ContractViolationError('media_assets item 값이 canonical TEXT/PRIMARY 계약과 다릅니다');
  }
}

function normalizeMetadata(contentType, typeSpecificMetadata) {
  if (contentType === 'QUIZ') {
    if (typeSpecificMetadata === undefined) {
      throw new MissingRequiredFieldError('QUIZ type_specific_metadata는 필수입니다');
    }
    if (
      !hasExactKeys(typeSpecificMetadata, ['answer_key']) ||
      typeof typeSpecificMetadata.answer_key !== 'string' ||
      typeSpecificMetadata.answer_key.trim().length === 0
    ) {
      throw new ContractViolationError('QUIZ metadata는 non-empty answer_key만 가져야 합니다');
    }
    return typeSpecificMetadata;
  }
  if (typeSpecificMetadata === undefined || typeSpecificMetadata === null) return null;
  if (typeof typeSpecificMetadata !== 'object' || Array.isArray(typeSpecificMetadata)) {
    throw new ContractViolationError('type_specific_metadata는 object 또는 null이어야 합니다');
  }
  return typeSpecificMetadata;
}

function projectContent(row) {
  return {
    content_id: row.content_id,
    grammar_node_ids: row.grammar_node_ids,
    content_type: row.content_type,
    media_assets: row.media_assets,
    difficulty: Number(row.difficulty),
    type_specific_metadata: row.type_specific_metadata,
  };
}

async function getContent(pool, identifier, contentType, metaLanguage, explanationLevel) {
  if (identifier === undefined) throw new MissingRequiredFieldError('node_id 또는 content_id는 필수입니다');
  if (identifier === null || typeof identifier !== 'string' || identifier.trim().length === 0) {
    throw new ContractViolationError('node_id 또는 content_id는 비어 있지 않은 string이어야 합니다');
  }

  if (contentType === undefined) {
    const { rows } = await pool.query(
      `SELECT content_id, grammar_node_ids, content_type, media_assets, difficulty,
              type_specific_metadata
         FROM content
        WHERE content_id = $1`,
      [identifier]
    );
    if (rows.length === 0) throw new NotFoundError(`존재하지 않는 content_id: ${identifier}`);
    return projectContent(rows[0]);
  }

  validateContentType(contentType);
  const { rows: nodeRows } = await pool.query(
    'SELECT 1 FROM grammar_nodes WHERE node_id = $1',
    [identifier]
  );
  if (nodeRows.length === 0) throw new NotFoundError(`존재하지 않는 node_id: ${identifier}`);

  const params = [JSON.stringify([identifier]), contentType];
  let filters = `grammar_node_ids @> $1::jsonb
                  AND content_type = $2
                  AND source = 'HUMAN_AUTHORED'
                  AND is_active = true`;
  if (metaLanguage !== undefined) {
    if (metaLanguage === null || typeof metaLanguage !== 'string' || metaLanguage.trim().length === 0) {
      throw new ContractViolationError('meta_language는 비어 있지 않은 string이어야 합니다');
    }
    params.push(metaLanguage);
    filters += ` AND meta_language = $${params.length}`;
  }
  if (explanationLevel !== undefined) {
    if (
      explanationLevel === null ||
      typeof explanationLevel !== 'string' ||
      explanationLevel.trim().length === 0
    ) {
      throw new ContractViolationError('explanation_level은 비어 있지 않은 string이어야 합니다');
    }
    params.push(explanationLevel);
    filters += ` AND explanation_level = $${params.length}`;
  }

  const { rows } = await pool.query(
    `SELECT content_id, grammar_node_ids, content_type, media_assets, difficulty,
            type_specific_metadata
       FROM content
      WHERE ${filters}
      ORDER BY content_id ASC`,
    params
  );
  return rows.map(projectContent);
}

async function saveGeneratedContent(
  pool,
  grammarNodeIds,
  contentType,
  mediaAssets,
  typeSpecificMetadata
) {
  const normalizedNodeIds = validateRequiredStringArray(grammarNodeIds, 'grammar_node_ids');
  validateContentType(contentType);
  validateMediaAssets(mediaAssets);
  const normalizedMetadata = normalizeMetadata(contentType, typeSpecificMetadata);

  const { rows: nodes } = await pool.query(
    `SELECT node_id, language, difficulty
       FROM grammar_nodes
      WHERE node_id = ANY($1::text[])`,
    [normalizedNodeIds]
  );
  if (nodes.length !== normalizedNodeIds.length) {
    const found = new Set(nodes.map((row) => row.node_id));
    const missing = normalizedNodeIds.find((nodeId) => !found.has(nodeId));
    throw new NotFoundError(`존재하지 않는 node_id: ${missing}`);
  }
  const languages = new Set(nodes.map((row) => row.language));
  if (languages.size !== 1) {
    throw new ContractViolationError('grammar_node_ids는 모두 같은 language여야 합니다');
  }

  const language = nodes[0].language;
  const difficulty = Math.max(...nodes.map((row) => Number(row.difficulty)));
  const representativeNodeId = normalizedNodeIds[0];
  const canonicalPrefix = `GRAMMAR_${language}_`;
  const nodeSlug = representativeNodeId.startsWith(canonicalPrefix)
    ? representativeNodeId.slice(canonicalPrefix.length)
    : representativeNodeId;
  const contentId = `CONTENT_${language}_${nodeSlug}_${CONTENT_TYPE_ABBREVIATIONS[contentType]}_${randomUUID()}`;

  try {
    const { rows } = await pool.query(
      `INSERT INTO content
         (content_id, grammar_node_ids, content_type, media_assets, source,
          human_reviewed, is_canonical, difficulty, meta_language, version,
          author, is_active, type_specific_metadata)
       VALUES
         ($1, $2::jsonb, $3, $4::jsonb, 'AI_GENERATED', false, false, $5, $6,
          1, 'LLE_AI_GENERATION_ENGINE', true, $7::jsonb)
       RETURNING content_id, grammar_node_ids, content_type, media_assets, difficulty,
                 type_specific_metadata`,
      [
        contentId,
        JSON.stringify(normalizedNodeIds),
        contentType,
        JSON.stringify(mediaAssets),
        difficulty,
        AI_GENERATION.defaultMetaLanguage,
        normalizedMetadata === null ? null : JSON.stringify(normalizedMetadata),
      ]
    );
    return projectContent(rows[0]);
  } catch (error) {
    if (error && error.code === '23505') {
      throw new ContractViolationError('생성 Content ID 충돌');
    }
    const persistenceError = new Error('Generated Content persistence failed');
    persistenceError.name = 'ContentPersistenceError';
    throw persistenceError;
  }
}

async function getRecentGeneratedContent(pool, grammarNodeIds, language) {
  const normalizedNodeIds = validateRequiredStringArray(grammarNodeIds, 'grammar_node_ids');
  validateRequiredLanguage(language);

  const { rows: nodes } = await pool.query(
    'SELECT node_id, language FROM grammar_nodes WHERE node_id = ANY($1::text[])',
    [normalizedNodeIds]
  );
  if (nodes.length !== normalizedNodeIds.length) {
    const found = new Set(nodes.map((row) => row.node_id));
    const missing = normalizedNodeIds.find((nodeId) => !found.has(nodeId));
    throw new NotFoundError(`존재하지 않는 node_id: ${missing}`);
  }
  const actualLanguages = new Set(nodes.map((row) => row.language));
  if (actualLanguages.size !== 1 || !actualLanguages.has(language)) {
    throw new ContractViolationError('grammar_node_ids의 language가 요청 language와 다릅니다');
  }

  const { rows } = await pool.query(
    `SELECT content_id, media_assets, created_at
       FROM content
      WHERE grammar_node_ids @> $1::jsonb
        AND source = 'AI_GENERATED'
        AND is_active = true
      ORDER BY created_at DESC, content_id ASC
      LIMIT 5`,
    [JSON.stringify(normalizedNodeIds)]
  );

  return rows.map((row) => ({
    content_id: row.content_id,
    media_assets: row.media_assets,
    created_at: new Date(row.created_at).toISOString(),
  }));
}

module.exports = {
  getContent,
  saveGeneratedContent,
  getRecentGeneratedContent,
  NotFoundError,
  ContractViolationError,
  MissingRequiredFieldError,
  OutOfRangeValueError,
};
