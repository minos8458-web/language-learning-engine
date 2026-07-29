'use strict';

const { createHash } = require('node:crypto');
const {
  ContractViolationError,
  isPlainObject,
} = require('./evidenceValidation');

const NORMALIZATION_VERSION = 'evidence-semantic-v1';
const DIGEST_ALGORITHM = 'sha256';

const SERVER_ISSUED_FIELD_NAMES = new Set([
  'createdAt',
  'created_at',
  'publishedAt',
  'published_at',
  'startedAt',
  'started_at',
  'serverReceivedAt',
  'server_received_at',
  'finalizedAt',
  'finalized_at',
  'definitionDigest',
  'definition_digest',
  'snapshotDigest',
  'snapshot_digest',
  'openPayloadDigest',
  'open_payload_digest',
  'digestAlgorithm',
  'digest_algorithm',
  'normalizationVersion',
  'normalization_version',
  'retryOrdinal',
  'retry_ordinal',
  'replayResult',
  'replay_result',
]);

const OMIT = Symbol('OMIT');

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeSemanticValue(value, options = {}, path = '$') {
  const excludedFields = options.excludedFields || SERVER_ISSUED_FIELD_NAMES;

  if (value === undefined) return OMIT;
  if (value === null) return null;

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new ContractViolationError(`${path}에는 finite number만 허용됩니다`);
    }
    return Object.is(value, -0) ? 0 : value;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ContractViolationError(`${path}에는 유효한 Date만 허용됩니다`);
    }
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    const normalized = [];
    for (let index = 0; index < value.length; index += 1) {
      const child = normalizeSemanticValue(value[index], options, `${path}[${index}]`);
      if (child !== OMIT) normalized.push(child);
    }
    return normalized;
  }

  if (isPlainObject(value)) {
    const normalized = {};
    for (const key of Object.keys(value).sort(compareStrings)) {
      if (excludedFields.has(key)) continue;
      const child = normalizeSemanticValue(value[key], options, `${path}.${key}`);
      if (child !== OMIT) normalized[key] = child;
    }
    return normalized;
  }

  throw new ContractViolationError(
    `${path}에는 JSON-compatible scalar, array, plain object 또는 Date만 허용됩니다`
  );
}

function serializeNormalized(normalizedValue) {
  return JSON.stringify(normalizedValue);
}

function digestSerialized(serialized) {
  return createHash(DIGEST_ALGORITHM).update(serialized, 'utf8').digest('hex');
}

function digestSemanticPayload(value, options = {}) {
  const normalizedValue = normalizeSemanticValue(value, options);
  if (normalizedValue === OMIT) {
    throw new ContractViolationError('digest input 전체가 undefined일 수 없습니다');
  }
  const serialized = serializeNormalized(normalizedValue);
  return {
    normalizedValue,
    serialized,
    digest: digestSerialized(serialized),
    digestAlgorithm: DIGEST_ALGORITHM,
    normalizationVersion: NORMALIZATION_VERSION,
  };
}

function buildAttemptOpenDigestInput(input) {
  return {
    operationCategory: 'ATTEMPT_OPEN',
    assignmentId: input.assignmentId,
    sessionId: input.sessionId,
    retryIntent: input.attemptSeriesId === undefined ? 'INITIAL' : 'PEDAGOGICAL_RETRY',
    attemptSeriesId: input.attemptSeriesId,
    retryOfAttemptId: input.retryOfAttemptId,
    instrumentationProtocolId: input.instrumentationProtocolId,
    instrumentationProtocolVersion: input.instrumentationProtocolVersion,
    openPayload: input.openPayload,
  };
}

function buildSnapshotDigestInput(snapshot, targetNodeIds) {
  return {
    operationCategory: 'ASSIGNMENT_SNAPSHOT',
    snapshot,
    targetNodeIds,
  };
}

module.exports = {
  DIGEST_ALGORITHM,
  NORMALIZATION_VERSION,
  SERVER_ISSUED_FIELD_NAMES,
  buildAttemptOpenDigestInput,
  buildSnapshotDigestInput,
  digestSemanticPayload,
  normalizeSemanticValue,
  serializeNormalized,
};
