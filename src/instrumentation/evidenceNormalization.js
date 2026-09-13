'use strict';

const { createHash } = require('node:crypto');
const {
  ContractViolationError,
  isPlainObject,
} = require('./evidenceValidation');

const NORMALIZATION_VERSION = 'evidence-semantic-v1';
const FINALIZATION_NORMALIZATION_VERSION = 'evidence-finalization-v1';
// Scoped correction (API_CONTRACT.md revision 1.31,
// EVIDENCE_FOUNDATION_P0_SCHEMA.md revision 1.10, D1-D5): assignment-snapshot
// digesting only. The generic NORMALIZATION_VERSION above stays frozen and
// unrelated existing digest domains are unaffected.
const ASSIGNMENT_SNAPSHOT_NORMALIZATION_VERSION = 'evidence-assignment-snapshot-v2';
const DIGEST_ALGORITHM = 'sha256';

// BIGINT ordinal exact-authority grammar (D1): base-10 decimal string only.
// Zero is exactly "0"; positive values are digits only with no leading zero,
// no leading "+", no exponent, no decimal point, no whitespace, no negative
// sign. JavaScript Number is never authoritative for this domain.
const EXACT_BIGINT_ORDINAL_PATTERN = /^(?:0|[1-9][0-9]*)$/;

function assertExactBigIntOrdinalString(value, path) {
  if (typeof value !== 'string' || !EXACT_BIGINT_ORDINAL_PATTERN.test(value)) {
    throw new ContractViolationError(
      `${path} must be an exact base-10 decimal string BIGINT ordinal `
        + '(digits only, no sign, no leading zero, no exponent, no decimal point, no whitespace)'
    );
  }
  return value;
}

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

// Assignment-snapshot-only digesting (D2/D3/B in the approved correction).
// Structurally identical to digestSemanticPayload, except: (1) it stamps the
// scoped normalizationVersion ASSIGNMENT_SNAPSHOT_NORMALIZATION_VERSION
// instead of the generic NORMALIZATION_VERSION, and (2) it independently
// re-asserts the exact-string BIGINT ordinal grammar on
// snapshot.exposureHistoryCutoffOrdinal before digesting, so the digest can
// never be computed over a value that already lost BIGINT precision.
// digestSemanticPayload/NORMALIZATION_VERSION above are untouched by this
// addition and remain the generic evidence-semantic-v1 digest path.
function digestAssignmentSnapshotPayload(value) {
  assertExactBigIntOrdinalString(
    value?.snapshot?.exposureHistoryCutoffOrdinal,
    '$.snapshot.exposureHistoryCutoffOrdinal'
  );
  const normalizedValue = normalizeSemanticValue(value);
  if (normalizedValue === OMIT) {
    throw new ContractViolationError('digest input 전체가 undefined일 수 없습니다');
  }
  const serialized = serializeNormalized(normalizedValue);
  return {
    normalizedValue,
    serialized,
    digest: digestSerialized(serialized),
    digestAlgorithm: DIGEST_ALGORITHM,
    normalizationVersion: ASSIGNMENT_SNAPSHOT_NORMALIZATION_VERSION,
  };
}

function normalizeFinalizationValue(value, path = '$', ancestors = new WeakSet()) {
  if (value === undefined) {
    throw new ContractViolationError(`${path} must not be undefined`);
  }
  if (value === null) return null;

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new ContractViolationError(`${path} must be a finite number`);
    }
    return Object.is(value, -0) ? 0 : value;
  }

  if (value instanceof Date) {
    throw new ContractViolationError(`${path} must not be a Date`);
  }

  if (Array.isArray(value)) {
    if (ancestors.has(value)) {
      throw new ContractViolationError(`${path} must not contain a cycle`);
    }
    ancestors.add(value);
    const normalized = [];
    try {
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, index)) {
          throw new ContractViolationError(`${path}[${index}] must not be undefined`);
        }
        normalized.push(normalizeFinalizationValue(
          value[index],
          `${path}[${index}]`,
          ancestors
        ));
      }
    } finally {
      ancestors.delete(value);
    }
    return normalized;
  }

  if (isPlainObject(value)) {
    if (ancestors.has(value)) {
      throw new ContractViolationError(`${path} must not contain a cycle`);
    }
    ancestors.add(value);
    const normalized = Object.create(null);
    try {
      for (const key of Object.keys(value).sort(compareStrings)) {
        normalized[key] = normalizeFinalizationValue(
          value[key],
          `${path}.${key}`,
          ancestors
        );
      }
    } finally {
      ancestors.delete(value);
    }
    return normalized;
  }

  throw new ContractViolationError(
    `${path} must contain only JSON-compatible scalars, arrays, and plain objects`
  );
}

function digestFinalizationPayload(value) {
  const normalizedValue = normalizeFinalizationValue(value);
  const serialized = serializeNormalized(normalizedValue);
  return {
    normalizedValue,
    serialized,
    digest: digestSerialized(serialized),
    digestAlgorithm: DIGEST_ALGORITHM,
    normalizationVersion: FINALIZATION_NORMALIZATION_VERSION,
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

function buildFinalizationDigestInput(input) {
  return {
    operationCategory: 'ATTEMPT_FINALIZATION',
    attemptId: input.attemptId,
    instrumentationProtocolId: input.instrumentationProtocolId,
    instrumentationProtocolVersion: input.instrumentationProtocolVersion,
    responseKind: input.responseKind,
    responseText: input.responseText ?? null,
    responseJson: input.responseJson ?? null,
    responseRef: input.responseRef ?? null,
    inputEnabledOffsetMs: input.inputEnabledOffsetMs ?? null,
    firstValidActivityOffsetMs: input.firstValidActivityOffsetMs ?? null,
    submittedOffsetMs: input.submittedOffsetMs ?? null,
    reportedClientMonotonicDurationMs:
      input.reportedClientMonotonicDurationMs ?? null,
    actualStimulusModalities: input.actualStimulusModalities,
    actualResponseModalities: input.actualResponseModalities,
    evaluations: input.evaluations,
    correctionAggregates: input.correctionAggregates,
  };
}

module.exports = {
  ASSIGNMENT_SNAPSHOT_NORMALIZATION_VERSION,
  DIGEST_ALGORITHM,
  EXACT_BIGINT_ORDINAL_PATTERN,
  FINALIZATION_NORMALIZATION_VERSION,
  NORMALIZATION_VERSION,
  SERVER_ISSUED_FIELD_NAMES,
  assertExactBigIntOrdinalString,
  buildAttemptOpenDigestInput,
  buildFinalizationDigestInput,
  buildSnapshotDigestInput,
  digestAssignmentSnapshotPayload,
  digestFinalizationPayload,
  digestSemanticPayload,
  normalizeFinalizationValue,
  normalizeSemanticValue,
  serializeNormalized,
};
