'use strict';

const { randomUUID } = require('node:crypto');
const {
  ATTRIBUTION_RELATION_VOCABULARY,
  CLASSIFICATION_VOCABULARY,
  CORRECTION_INITIATORS,
  CORRECTION_OUTCOMES,
  ContractViolationError,
  FEEDBACK_PHASES,
  LINGUISTIC_CATEGORY_VOCABULARY,
  MissingRequiredFieldError,
  NotFoundError,
  OutOfRangeValueError,
  RESPONSE_KINDS,
  RESPONSE_MODALITIES,
  STIMULUS_MODALITIES,
  assertAllowedKeys,
  assertExactKeys,
  hasOwn,
  isPlainObject,
  rejectDirectPiiKeys,
  rejectServerIssuedFieldOverrides,
  requireField,
  validateAnchorStrategy,
  validateAssignmentType,
  validateConditionClass,
  validateDefinition,
  validateInputObject,
  validateInstrumentationProtocolDefinition,
  validateNonnegativeSafeInteger,
  validateOptionalString,
  validatePartialReference,
  validatePositiveVersion,
  validateReferenceKind,
  validateResponseModalities,
  validateRubricDefinition,
  validateStableId,
  validateStimulusModalities,
  validateTargetNodeIds,
  validateTargetTimepoint,
  validateUuid,
} = require('./evidenceValidation');
const {
  buildAttemptOpenDigestInput,
  buildFinalizationDigestInput,
  buildSnapshotDigestInput,
  digestFinalizationPayload,
  digestSemanticPayload,
  normalizeFinalizationValue,
} = require('./evidenceNormalization');

const VERSION_SERVER_FIELDS = [
  'definitionDigest',
  'digestAlgorithm',
  'normalizationVersion',
  'publishedAt',
  'createdAt',
];
const PARTICIPANT_SERVER_FIELDS = ['participantId', 'createdAt'];
const ENROLLMENT_SERVER_FIELDS = ['enrollmentId', 'status', 'completedAt', 'withdrawnAt', 'createdAt'];
const ASSIGNMENT_SERVER_FIELDS = [
  'assignmentId',
  'experimentId',
  'experimentVersion',
  'conditionId',
  'conditionVersion',
  'snapshotDigest',
  'digestAlgorithm',
  'normalizationVersion',
  'anchorAt',
  'dueAt',
  'completedAt',
  'completionAttemptId',
  'terminalOutcome',
  'rescheduledFrom',
  'supersededBy',
  'createdAt',
];
const ATTEMPT_SERVER_FIELDS = [
  'attemptId',
  'retryOrdinal',
  'openPayloadDigest',
  'digestAlgorithm',
  'normalizationVersion',
  'replayResult',
  'startedAt',
  'createdAt',
];

function compareRowsByOrdinal(left, right) {
  return Number(left.ordinal) - Number(right.ordinal);
}

async function withTransaction(pool, work) {
  if (!pool || typeof pool.connect !== 'function') {
    throw new ContractViolationError('pool.connect is required');
  }
  if (typeof work !== 'function') {
    throw new ContractViolationError('transaction work must be a function');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original failure. The caller needs the operation error.
    }
    throw error;
  } finally {
    client.release();
  }
}

function mapDatabaseError(error, context) {
  if (error && typeof error.code === 'string' && [
    'INVALID_ID',
    'MISSING_REQUIRED_FIELD',
    'UNAUTHORIZED_CALLER',
    'OUT_OF_RANGE_VALUE',
    'CONTRACT_VIOLATION',
  ].includes(error.code)) {
    return error;
  }

  if (error?.code === '23503') {
    return new NotFoundError(`${context}: referenced row does not exist`);
  }
  if (error?.code === '23514' || error?.code === '23502' || error?.code === '22P02') {
    return new ContractViolationError(`${context}: database contract rejected the request`);
  }
  if (error?.code === '22001') {
    return new OutOfRangeValueError(`${context}: value exceeds the configured bound`);
  }
  return error;
}

function versionReplayMatches(row, digest, extras = {}) {
  if (
    row.definition_digest !== digest.digest
    || row.digest_algorithm !== digest.digestAlgorithm
    || row.normalization_version !== digest.normalizationVersion
  ) {
    return false;
  }
  return Object.entries(extras).every(([column, value]) => row[column] === value);
}

async function registerExperimentVersion(pool, input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, VERSION_SERVER_FIELDS);
  assertAllowedKeys(input, ['experimentId', 'version', 'definition', 'provenanceRef']);

  const experimentId = validateStableId(requireField(input, 'experimentId'), 'experimentId');
  const version = validatePositiveVersion(requireField(input, 'version'), 'version');
  const definition = validateDefinition(requireField(input, 'definition'));
  const provenanceRef = validateOptionalString(input.provenanceRef, 'provenanceRef');
  const digest = digestSemanticPayload(definition);

  try {
    return await withTransaction(pool, async (client) => {
      await client.query(
        `INSERT INTO evidence_experiments (experiment_id)
         VALUES ($1)
         ON CONFLICT (experiment_id) DO NOTHING`,
        [experimentId]
      );

      const { rows: inserted } = await client.query(
        `INSERT INTO evidence_experiment_versions (
           experiment_id, version, definition, definition_digest,
           digest_algorithm, normalization_version, provenance_ref
         )
         VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
         ON CONFLICT (experiment_id, version) DO NOTHING
         RETURNING *`,
        [
          experimentId,
          version,
          JSON.stringify(digest.normalizedValue),
          digest.digest,
          digest.digestAlgorithm,
          digest.normalizationVersion,
          provenanceRef,
        ]
      );

      if (inserted.length === 1) return { replayed: false, row: inserted[0] };

      const { rows } = await client.query(
        `SELECT * FROM evidence_experiment_versions
          WHERE experiment_id = $1 AND version = $2`,
        [experimentId, version]
      );
      const row = rows[0];
      if (
        row
        && versionReplayMatches(row, digest)
        && row.provenance_ref === provenanceRef
      ) {
        return { replayed: true, row };
      }
      throw new ContractViolationError(
        `experiment ${experimentId} version ${version} already has a different immutable definition`
      );
    });
  } catch (error) {
    throw mapDatabaseError(error, 'registerExperimentVersion');
  }
}

async function registerConditionVersion(pool, input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, VERSION_SERVER_FIELDS);
  assertAllowedKeys(input, [
    'conditionId',
    'version',
    'conditionClass',
    'definition',
    'provenanceRef',
  ]);

  const conditionId = validateStableId(requireField(input, 'conditionId'), 'conditionId');
  const version = validatePositiveVersion(requireField(input, 'version'), 'version');
  const conditionClass = validateConditionClass(requireField(input, 'conditionClass'));
  const definition = validateDefinition(requireField(input, 'definition'));
  const provenanceRef = validateOptionalString(input.provenanceRef, 'provenanceRef');
  const digest = digestSemanticPayload(definition);

  try {
    return await withTransaction(pool, async (client) => {
      await client.query(
        `INSERT INTO evidence_conditions (condition_id)
         VALUES ($1)
         ON CONFLICT (condition_id) DO NOTHING`,
        [conditionId]
      );

      const { rows: inserted } = await client.query(
        `INSERT INTO evidence_condition_versions (
           condition_id, version, condition_class, definition, definition_digest,
           digest_algorithm, normalization_version, provenance_ref
         )
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
         ON CONFLICT (condition_id, version) DO NOTHING
         RETURNING *`,
        [
          conditionId,
          version,
          conditionClass,
          JSON.stringify(digest.normalizedValue),
          digest.digest,
          digest.digestAlgorithm,
          digest.normalizationVersion,
          provenanceRef,
        ]
      );

      if (inserted.length === 1) return { replayed: false, row: inserted[0] };

      const { rows } = await client.query(
        `SELECT * FROM evidence_condition_versions
          WHERE condition_id = $1 AND version = $2`,
        [conditionId, version]
      );
      const row = rows[0];
      if (
        row
        && versionReplayMatches(row, digest, { condition_class: conditionClass })
        && row.provenance_ref === provenanceRef
      ) {
        return { replayed: true, row };
      }
      throw new ContractViolationError(
        `condition ${conditionId} version ${version} already has different immutable content`
      );
    });
  } catch (error) {
    throw mapDatabaseError(error, 'registerConditionVersion');
  }
}

async function registerReferenceVersion(pool, input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, VERSION_SERVER_FIELDS);
  assertAllowedKeys(input, [
    'referenceKind',
    'referenceId',
    'version',
    'definition',
    'provenanceRef',
    'licenseStatus',
  ]);

  const referenceKind = validateReferenceKind(requireField(input, 'referenceKind'));
  const referenceId = validateStableId(requireField(input, 'referenceId'), 'referenceId');
  const version = validatePositiveVersion(requireField(input, 'version'), 'version');
  const definition = validateDefinition(requireField(input, 'definition'));
  const provenanceRef = validateOptionalString(input.provenanceRef, 'provenanceRef');
  const licenseStatus = validateOptionalString(input.licenseStatus, 'licenseStatus');
  const digest = digestSemanticPayload(definition);

  try {
    return await withTransaction(pool, async (client) => {
      const { rows: inserted } = await client.query(
        `INSERT INTO evidence_reference_versions (
           reference_kind, reference_id, version, definition, definition_digest,
           digest_algorithm, normalization_version, provenance_ref, license_status
         )
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9)
         ON CONFLICT (reference_kind, reference_id, version) DO NOTHING
         RETURNING *`,
        [
          referenceKind,
          referenceId,
          version,
          JSON.stringify(digest.normalizedValue),
          digest.digest,
          digest.digestAlgorithm,
          digest.normalizationVersion,
          provenanceRef,
          licenseStatus,
        ]
      );

      if (inserted.length === 1) return { replayed: false, row: inserted[0] };

      const { rows } = await client.query(
        `SELECT * FROM evidence_reference_versions
          WHERE reference_kind = $1 AND reference_id = $2 AND version = $3`,
        [referenceKind, referenceId, version]
      );
      const row = rows[0];
      if (
        row
        && versionReplayMatches(row, digest)
        && row.provenance_ref === provenanceRef
        && row.license_status === licenseStatus
      ) {
        return { replayed: true, row };
      }
      throw new ContractViolationError(
        `${referenceKind} ${referenceId} version ${version} already has different immutable content`
      );
    });
  } catch (error) {
    throw mapDatabaseError(error, 'registerReferenceVersion');
  }
}

async function createParticipant(pool, input = {}) {
  validateInputObject(input);
  rejectDirectPiiKeys(input);
  rejectServerIssuedFieldOverrides(input, PARTICIPANT_SERVER_FIELDS);
  assertAllowedKeys(input, []);

  try {
    const { rows } = await pool.query(
      `INSERT INTO evidence_participants DEFAULT VALUES
       RETURNING *`
    );
    return rows[0];
  } catch (error) {
    throw mapDatabaseError(error, 'createParticipant');
  }
}

async function createEnrollment(pool, input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, ENROLLMENT_SERVER_FIELDS);
  assertAllowedKeys(input, [
    'participantId',
    'experimentId',
    'experimentVersion',
    'conditionId',
    'conditionVersion',
  ]);

  const participantId = validateUuid(requireField(input, 'participantId'), 'participantId');
  const experimentId = validateStableId(requireField(input, 'experimentId'), 'experimentId');
  const experimentVersion = validatePositiveVersion(
    requireField(input, 'experimentVersion'),
    'experimentVersion'
  );
  const conditionId = validateStableId(requireField(input, 'conditionId'), 'conditionId');
  const conditionVersion = validatePositiveVersion(
    requireField(input, 'conditionVersion'),
    'conditionVersion'
  );

  try {
    return await withTransaction(pool, async (client) => {
      const { rows: participantRows } = await client.query(
        'SELECT participant_id FROM evidence_participants WHERE participant_id = $1',
        [participantId]
      );
      if (participantRows.length === 0) {
        throw new NotFoundError(`Unknown participantId: ${participantId}`);
      }

      const { rows: experimentRows } = await client.query(
        `SELECT 1 FROM evidence_experiment_versions
          WHERE experiment_id = $1 AND version = $2`,
        [experimentId, experimentVersion]
      );
      if (experimentRows.length === 0) {
        throw new NotFoundError(`Unknown experiment version: ${experimentId}@${experimentVersion}`);
      }

      const { rows: conditionRows } = await client.query(
        `SELECT 1 FROM evidence_condition_versions
          WHERE condition_id = $1 AND version = $2`,
        [conditionId, conditionVersion]
      );
      if (conditionRows.length === 0) {
        throw new NotFoundError(`Unknown condition version: ${conditionId}@${conditionVersion}`);
      }

      const { rows } = await client.query(
        `INSERT INTO evidence_enrollments (
           participant_id, experiment_id, experiment_version, condition_id, condition_version
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [participantId, experimentId, experimentVersion, conditionId, conditionVersion]
      );
      return rows[0];
    });
  } catch (error) {
    throw mapDatabaseError(error, 'createEnrollment');
  }
}

const SNAPSHOT_REFERENCE_FIELDS = Object.freeze([
  ['ITEM', 'itemId', 'itemVersion'],
  ['SCENARIO', 'scenarioId', 'scenarioVersion'],
  ['ITEM_FAMILY', 'itemFamilyId', 'itemFamilyVersion'],
  ['LEXICAL_MANIFEST', 'lexicalManifestId', 'lexicalManifestVersion'],
  ['RUBRIC', 'rubricId', 'rubricVersion'],
  ['FORMULA', 'formulaId', 'formulaVersion'],
  ['SCHEDULER_PROTOCOL', 'schedulerProtocolId', 'schedulerProtocolVersion'],
  ['INSTRUMENTATION_PROTOCOL', 'instrumentationProtocolId', 'instrumentationProtocolVersion'],
]);

function validateSnapshotReferences(value) {
  validateInputObject(value, 'references');
  assertAllowedKeys(
    value,
    SNAPSHOT_REFERENCE_FIELDS.flatMap(([, idField, versionField]) => [idField, versionField])
      .concat(['contentId', 'contentVersion']),
    'references'
  );

  const normalized = {};
  for (const [kind, idField, versionField] of SNAPSHOT_REFERENCE_FIELDS) {
    const reference = validatePartialReference(value, idField, versionField);
    normalized[idField] = reference.id;
    normalized[versionField] = reference.version;
    normalized[`${idField}Kind`] = kind;
  }

  const content = validatePartialReference(
    value,
    'contentId',
    'contentVersion',
    { optional: true }
  );
  normalized.contentId = content?.id ?? null;
  normalized.contentVersion = content?.version ?? null;
  return normalized;
}

async function assertReferenceExists(client, kind, id, version) {
  const { rows } = await client.query(
    `SELECT 1 FROM evidence_reference_versions
      WHERE reference_kind = $1 AND reference_id = $2 AND version = $3`,
    [kind, id, version]
  );
  if (rows.length === 0) {
    throw new NotFoundError(`Unknown ${kind} reference: ${id}@${version}`);
  }
}

async function createAssignment(pool, input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, ASSIGNMENT_SERVER_FIELDS);
  assertAllowedKeys(input, [
    'enrollmentId',
    'assignmentType',
    'targetTimepoint',
    'anchorStrategy',
    'anchorEventRef',
    'targetNodeIds',
    'references',
    'plannedStimulusModalities',
    'plannedResponseModalities',
  ]);

  const enrollmentId = validateUuid(requireField(input, 'enrollmentId'), 'enrollmentId');
  const assignmentType = validateAssignmentType(requireField(input, 'assignmentType'));
  const targetTimepoint = validateTargetTimepoint(requireField(input, 'targetTimepoint'));
  const anchorStrategy = validateAnchorStrategy(requireField(input, 'anchorStrategy'));
  const anchorEventRef = validateOptionalString(input.anchorEventRef, 'anchorEventRef');
  const targetNodeIds = validateTargetNodeIds(requireField(input, 'targetNodeIds'));
  const references = validateSnapshotReferences(requireField(input, 'references'));
  const plannedStimulusModalities = validateStimulusModalities(
    requireField(input, 'plannedStimulusModalities')
  );
  const plannedResponseModalities = validateResponseModalities(
    requireField(input, 'plannedResponseModalities')
  );

  try {
    return await withTransaction(pool, async (client) => {
      const { rows: enrollmentRows } = await client.query(
        `SELECT * FROM evidence_enrollments
          WHERE enrollment_id = $1`,
        [enrollmentId]
      );
      const enrollment = enrollmentRows[0];
      if (!enrollment) throw new NotFoundError(`Unknown enrollmentId: ${enrollmentId}`);
      if (enrollment.status !== 'ACTIVE') {
        throw new ContractViolationError('assignment requires an ACTIVE enrollment');
      }

      for (const [kind, idField, versionField] of SNAPSHOT_REFERENCE_FIELDS) {
        await assertReferenceExists(client, kind, references[idField], references[versionField]);
      }

      if (references.contentId !== null) {
        const { rows: contentRows } = await client.query(
          `SELECT to_jsonb(c) AS content_row
             FROM content c
            WHERE c.content_id = $1`,
          [references.contentId]
        );
        if (contentRows.length === 0) {
          throw new NotFoundError(`Unknown contentId: ${references.contentId}`);
        }
        const contentRow = contentRows[0].content_row;
        const currentVersion = contentRow.content_version ?? contentRow.version;
        if (currentVersion === undefined || currentVersion === null) {
          throw new ContractViolationError(
            'content reference cannot be snapshotted because Content exposes no version authority'
          );
        }
        if (Number(currentVersion) !== references.contentVersion) {
          throw new ContractViolationError(
            `content version mismatch for ${references.contentId}`
          );
        }
      }

      const assignmentId = randomUUID();
      const snapshotForDigest = {
        experimentId: enrollment.experiment_id,
        experimentVersion: Number(enrollment.experiment_version),
        conditionId: enrollment.condition_id,
        conditionVersion: Number(enrollment.condition_version),
        itemId: references.itemId,
        itemVersion: references.itemVersion,
        contentId: references.contentId,
        contentVersion: references.contentVersion,
        scenarioId: references.scenarioId,
        scenarioVersion: references.scenarioVersion,
        itemFamilyId: references.itemFamilyId,
        itemFamilyVersion: references.itemFamilyVersion,
        lexicalManifestId: references.lexicalManifestId,
        lexicalManifestVersion: references.lexicalManifestVersion,
        rubricId: references.rubricId,
        rubricVersion: references.rubricVersion,
        formulaId: references.formulaId,
        formulaVersion: references.formulaVersion,
        schedulerProtocolId: references.schedulerProtocolId,
        schedulerProtocolVersion: references.schedulerProtocolVersion,
        instrumentationProtocolId: references.instrumentationProtocolId,
        instrumentationProtocolVersion: references.instrumentationProtocolVersion,
        plannedStimulusModalities,
        plannedResponseModalities,
      };
      const digest = digestSemanticPayload(
        buildSnapshotDigestInput(snapshotForDigest, targetNodeIds)
      );

      const { rows: assignmentRows } = await client.query(
        `INSERT INTO evidence_assignments (
           assignment_id, enrollment_id, assignment_type, target_timepoint,
           anchor_strategy, anchor_event_ref
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          assignmentId,
          enrollmentId,
          assignmentType,
          targetTimepoint,
          anchorStrategy,
          anchorEventRef,
        ]
      );

      const { rows: snapshotRows } = await client.query(
        `INSERT INTO evidence_assignment_snapshots (
           assignment_id,
           experiment_id, experiment_version,
           condition_id, condition_version,
           item_id, item_version,
           content_id, content_version,
           scenario_id, scenario_version,
           item_family_id, item_family_version,
           lexical_manifest_id, lexical_manifest_version,
           rubric_id, rubric_version,
           formula_id, formula_version,
           scheduler_protocol_id, scheduler_protocol_version,
           instrumentation_protocol_id, instrumentation_protocol_version,
           planned_stimulus_modalities, planned_response_modalities,
           snapshot_digest, digest_algorithm, normalization_version
         )
         VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
           $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
           $24::jsonb, $25::jsonb, $26, $27, $28
         )
         RETURNING *`,
        [
          assignmentId,
          enrollment.experiment_id,
          Number(enrollment.experiment_version),
          enrollment.condition_id,
          Number(enrollment.condition_version),
          references.itemId,
          references.itemVersion,
          references.contentId,
          references.contentVersion,
          references.scenarioId,
          references.scenarioVersion,
          references.itemFamilyId,
          references.itemFamilyVersion,
          references.lexicalManifestId,
          references.lexicalManifestVersion,
          references.rubricId,
          references.rubricVersion,
          references.formulaId,
          references.formulaVersion,
          references.schedulerProtocolId,
          references.schedulerProtocolVersion,
          references.instrumentationProtocolId,
          references.instrumentationProtocolVersion,
          JSON.stringify(plannedStimulusModalities),
          JSON.stringify(plannedResponseModalities),
          digest.digest,
          digest.digestAlgorithm,
          digest.normalizationVersion,
        ]
      );

      const nodeRows = [];
      for (let ordinal = 0; ordinal < targetNodeIds.length; ordinal += 1) {
        const { rows } = await client.query(
          `INSERT INTO evidence_assignment_snapshot_nodes (assignment_id, node_id, ordinal)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [assignmentId, targetNodeIds[ordinal], ordinal]
        );
        nodeRows.push(rows[0]);
      }

      return {
        assignment: assignmentRows[0],
        snapshot: snapshotRows[0],
        targetNodes: nodeRows.sort(compareRowsByOrdinal),
      };
    });
  } catch (error) {
    throw mapDatabaseError(error, 'createAssignment');
  }
}

function validateAttemptInput(input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, ATTEMPT_SERVER_FIELDS);
  assertAllowedKeys(input, [
    'assignmentId',
    'sessionId',
    'idempotencyIdentity',
    'attemptSeriesId',
    'retryOfAttemptId',
    'instrumentationProtocolId',
    'instrumentationProtocolVersion',
    'openPayload',
  ]);

  const normalized = {
    assignmentId: validateUuid(requireField(input, 'assignmentId'), 'assignmentId'),
    sessionId: validateUuid(requireField(input, 'sessionId'), 'sessionId'),
    idempotencyIdentity: validateStableId(
      requireField(input, 'idempotencyIdentity'),
      'idempotencyIdentity'
    ),
    instrumentationProtocolId: validateStableId(
      requireField(input, 'instrumentationProtocolId'),
      'instrumentationProtocolId'
    ),
    instrumentationProtocolVersion: validatePositiveVersion(
      requireField(input, 'instrumentationProtocolVersion'),
      'instrumentationProtocolVersion'
    ),
    openPayload: validateDefinition(requireField(input, 'openPayload'), 'openPayload'),
  };

  const hasSeries = input.attemptSeriesId !== undefined;
  const hasParent = input.retryOfAttemptId !== undefined;
  if (hasSeries !== hasParent || input.attemptSeriesId === null || input.retryOfAttemptId === null) {
    throw new ContractViolationError(
      'attemptSeriesId and retryOfAttemptId must be supplied together for a pedagogical retry'
    );
  }
  normalized.attemptSeriesId = hasSeries
    ? validateUuid(input.attemptSeriesId, 'attemptSeriesId')
    : undefined;
  normalized.retryOfAttemptId = hasParent
    ? validateUuid(input.retryOfAttemptId, 'retryOfAttemptId')
    : undefined;
  return normalized;
}

function attemptReplayMatches(row, digest) {
  return row.open_payload_digest === digest.digest
    && row.digest_algorithm === digest.digestAlgorithm
    && row.normalization_version === digest.normalizationVersion;
}

function projectAttemptResult(row, replayed) {
  return {
    replayed,
    attemptId: row.attempt_id,
    assignmentId: row.assignment_id,
    sessionId: row.session_id,
    attemptSeriesId: row.attempt_series_id,
    retryOrdinal: Number(row.retry_ordinal),
    retryOfAttemptId: row.retry_of_attempt_id,
    startedAt: new Date(row.started_at).toISOString(),
  };
}

async function loadAttemptByKey(queryable, assignmentId, idempotencyIdentity) {
  const { rows } = await queryable.query(
    `SELECT * FROM evidence_attempts
      WHERE assignment_id = $1 AND idempotency_identity = $2`,
    [assignmentId, idempotencyIdentity]
  );
  return rows[0] || null;
}

function replayOrConflict(row, digest) {
  if (row && attemptReplayMatches(row, digest)) {
    return { ...row.replay_result, replayed: true };
  }
  throw new ContractViolationError(
    'idempotency identity was already used with a different normalized payload'
  );
}

async function openAttempt(pool, input) {
  const normalized = validateAttemptInput(input);

  const digest = digestSemanticPayload(buildAttemptOpenDigestInput(normalized));
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await loadAttemptByKey(
      client,
      normalized.assignmentId,
      normalized.idempotencyIdentity
    );
    if (existing) {
      const replay = replayOrConflict(existing, digest);
      await client.query('COMMIT');
      return replay;
    }

    const { rows: ownershipRows } = await client.query(
      `SELECT
         a.assignment_id,
         a.enrollment_id AS assignment_enrollment_id,
         a.terminal_outcome AS assignment_terminal_outcome,
         e.status AS enrollment_status,
         s.enrollment_id AS session_enrollment_id,
         s.terminal_outcome AS session_terminal_outcome,
         snap.instrumentation_protocol_id,
         snap.instrumentation_protocol_version
       FROM evidence_assignments a
       JOIN evidence_enrollments e ON e.enrollment_id = a.enrollment_id
       JOIN evidence_assignment_snapshots snap ON snap.assignment_id = a.assignment_id
       JOIN evidence_sessions s ON s.session_id = $2
      WHERE a.assignment_id = $1`,
      [normalized.assignmentId, normalized.sessionId]
    );
    const ownership = ownershipRows[0];
    if (!ownership) {
      throw new NotFoundError('Unknown assignmentId or sessionId');
    }
    if (ownership.assignment_enrollment_id !== ownership.session_enrollment_id) {
      throw new ContractViolationError('assignment and session must belong to the same enrollment');
    }
    if (
      ownership.enrollment_status !== 'ACTIVE'
      || ownership.assignment_terminal_outcome !== null
      || ownership.session_terminal_outcome !== null
    ) {
      throw new ContractViolationError('attempt open requires active enrollment, assignment, and session');
    }

    if (
      ownership.instrumentation_protocol_id !== normalized.instrumentationProtocolId
      || Number(ownership.instrumentation_protocol_version)
        !== normalized.instrumentationProtocolVersion
    ) {
      throw new ContractViolationError(
        'attempt instrumentation protocol must match the assignment snapshot'
      );
    }

    await assertReferenceExists(
      client,
      'INSTRUMENTATION_PROTOCOL',
      normalized.instrumentationProtocolId,
      normalized.instrumentationProtocolVersion
    );

    let attemptSeriesId;
    let retryOrdinal;
    if (normalized.attemptSeriesId === undefined) {
      attemptSeriesId = randomUUID();
      retryOrdinal = 0;
      await client.query(
        `INSERT INTO evidence_attempt_series (attempt_series_id, assignment_id)
         VALUES ($1, $2)`,
        [attemptSeriesId, normalized.assignmentId]
      );
    } else {
      attemptSeriesId = normalized.attemptSeriesId;
      const { rows: seriesRows } = await client.query(
        `SELECT assignment_id FROM evidence_attempt_series
          WHERE attempt_series_id = $1
          FOR UPDATE`,
        [attemptSeriesId]
      );
      if (seriesRows.length === 0) {
        throw new NotFoundError(`Unknown attemptSeriesId: ${attemptSeriesId}`);
      }
      if (seriesRows[0].assignment_id !== normalized.assignmentId) {
        throw new ContractViolationError('attempt series belongs to a different assignment');
      }

      const { rows: parentRows } = await client.query(
        `SELECT attempt_id, assignment_id, attempt_series_id
           FROM evidence_attempts
          WHERE attempt_id = $1`,
        [normalized.retryOfAttemptId]
      );
      const parent = parentRows[0];
      if (!parent) {
        throw new NotFoundError(`Unknown retryOfAttemptId: ${normalized.retryOfAttemptId}`);
      }
      if (
        parent.assignment_id !== normalized.assignmentId
        || parent.attempt_series_id !== attemptSeriesId
      ) {
        throw new ContractViolationError('retry parent must belong to the same assignment and series');
      }

      const { rows: ordinalRows } = await client.query(
        `SELECT COALESCE(MAX(retry_ordinal), -1) + 1 AS next_ordinal
           FROM evidence_attempts
          WHERE attempt_series_id = $1`,
        [attemptSeriesId]
      );
      retryOrdinal = Number(ordinalRows[0].next_ordinal);
    }

    const attemptId = randomUUID();
    const startedAt = new Date().toISOString();
    const replayResult = {
      replayed: false,
      attemptId,
      assignmentId: normalized.assignmentId,
      sessionId: normalized.sessionId,
      attemptSeriesId,
      retryOrdinal,
      retryOfAttemptId: normalized.retryOfAttemptId ?? null,
      startedAt,
    };

    const { rows } = await client.query(
      `INSERT INTO evidence_attempts (
         attempt_id, assignment_id, session_id, attempt_series_id,
         retry_ordinal, retry_of_attempt_id, idempotency_identity,
         open_payload_digest, digest_algorithm, normalization_version,
         replay_result, started_at
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12
       )
       RETURNING *`,
      [
        attemptId,
        normalized.assignmentId,
        normalized.sessionId,
        attemptSeriesId,
        retryOrdinal,
        normalized.retryOfAttemptId ?? null,
        normalized.idempotencyIdentity,
        digest.digest,
        digest.digestAlgorithm,
        digest.normalizationVersion,
        JSON.stringify(replayResult),
        startedAt,
      ]
    );

    await client.query('COMMIT');
    return projectAttemptResult(rows[0], false);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve original error.
    }

    if (
      error?.code === '23505'
      && error.constraint === 'evidence_attempts_assignment_idempotency_unique'
    ) {
      const existing = await loadAttemptByKey(
        pool,
        normalized.assignmentId,
        normalized.idempotencyIdentity
      );
      return replayOrConflict(existing, digest);
    }
    throw mapDatabaseError(error, 'openAttempt');
  } finally {
    client.release();
  }
}

const FINALIZATION_INPUT_KEYS = Object.freeze([
  'attemptId',
  'finalizationIdempotencyIdentity',
  'instrumentationProtocolId',
  'instrumentationProtocolVersion',
  'responseKind',
  'responseText',
  'responseJson',
  'responseRef',
  'inputEnabledOffsetMs',
  'firstValidActivityOffsetMs',
  'submittedOffsetMs',
  'reportedClientMonotonicDurationMs',
  'actualStimulusModalities',
  'actualResponseModalities',
  'evaluations',
  'correctionAggregates',
]);
const REQUIRED_FINALIZATION_INPUT_KEYS = Object.freeze([
  'attemptId',
  'finalizationIdempotencyIdentity',
  'instrumentationProtocolId',
  'instrumentationProtocolVersion',
  'responseKind',
  'actualStimulusModalities',
  'actualResponseModalities',
  'evaluations',
  'correctionAggregates',
]);
const TIMING_FIELD_NAMES = Object.freeze([
  'inputEnabledOffsetMs',
  'firstValidActivityOffsetMs',
  'submittedOffsetMs',
  'reportedClientMonotonicDurationMs',
]);

function validateFinalizationTopLevelShape(input) {
  validateInputObject(input);
  assertAllowedKeys(input, FINALIZATION_INPUT_KEYS);
  for (const key of Object.keys(input)) {
    if (input[key] === undefined) {
      throw new ContractViolationError(`${key} must not be undefined`);
    }
  }
  for (const key of REQUIRED_FINALIZATION_INPUT_KEYS) {
    if (!hasOwn(input, key)) {
      throw new MissingRequiredFieldError(`${key} is required`);
    }
  }
}

function normalizeFinalizationBaseInput(input) {
  const responseKind = input.responseKind;
  if (typeof responseKind !== 'string' || !RESPONSE_KINDS.includes(responseKind)) {
    throw new ContractViolationError('responseKind is invalid');
  }
  if (!Array.isArray(input.evaluations)) {
    throw new ContractViolationError('evaluations must be an array');
  }
  if (!Array.isArray(input.correctionAggregates)) {
    throw new ContractViolationError('correctionAggregates must be an array');
  }

  return {
    attemptId: validateUuid(input.attemptId, 'attemptId'),
    finalizationIdempotencyIdentity: validateStableId(
      input.finalizationIdempotencyIdentity,
      'finalizationIdempotencyIdentity'
    ),
    instrumentationProtocolId: validateStableId(
      input.instrumentationProtocolId,
      'instrumentationProtocolId'
    ),
    instrumentationProtocolVersion: validatePositiveVersion(
      input.instrumentationProtocolVersion,
      'instrumentationProtocolVersion'
    ),
    responseKind,
    actualStimulusModalities: input.actualStimulusModalities,
    actualResponseModalities: input.actualResponseModalities,
    evaluations: input.evaluations,
    correctionAggregates: input.correctionAggregates,
  };
}

function canonicalizeModalities(value, fieldName, allowedValues, protocolAllowed) {
  const normalized = fieldName === 'actualStimulusModalities'
    ? validateStimulusModalities(value, fieldName)
    : validateResponseModalities(value, fieldName);
  if (normalized.some((item, index) => value[index] !== item)) {
    throw new ContractViolationError(`${fieldName} values must use exact modality names`);
  }
  const protocolAllowedSet = new Set(protocolAllowed);
  if (normalized.some((item) => !protocolAllowedSet.has(item))) {
    throw new ContractViolationError(`${fieldName} contains a protocol-disallowed modality`);
  }
  return [...normalized].sort(
    (left, right) => allowedValues.indexOf(left) - allowedValues.indexOf(right)
  );
}

function enforceModalityCoverage(actual, planned, coverage, fieldName) {
  const plannedSet = new Set(planned);
  if (coverage === 'EXACT_PLANNED') {
    if (actual.length !== plannedSet.size || actual.some((item) => !plannedSet.has(item))) {
      throw new ContractViolationError(`${fieldName} must equal the planned modality set`);
    }
    return;
  }
  if (actual.some((item) => !plannedSet.has(item))) {
    throw new ContractViolationError(`${fieldName} must be a nonempty subset of planned modalities`);
  }
}

function normalizeResponse(input, responseKind, responseBounds) {
  const payloadFields = ['responseText', 'responseJson', 'responseRef'];
  const requiredField = {
    TEXT: 'responseText',
    JSON: 'responseJson',
    REFERENCE: 'responseRef',
  }[responseKind];

  for (const field of payloadFields) {
    if (field !== requiredField && hasOwn(input, field)) {
      throw new ContractViolationError(`${field} is prohibited for responseKind ${responseKind}`);
    }
  }
  if (requiredField && !hasOwn(input, requiredField)) {
    throw new MissingRequiredFieldError(`${requiredField} is required`);
  }

  const normalized = {
    responseText: null,
    responseJson: null,
    responseRef: null,
  };
  if (responseKind === 'TEXT') {
    if (
      typeof input.responseText !== 'string'
      || input.responseText.length === 0
      || input.responseText.trim().length === 0
    ) {
      throw new ContractViolationError('responseText must be a non-whitespace string');
    }
    if (Buffer.byteLength(input.responseText, 'utf8') > responseBounds.textMaxUtf8Bytes) {
      throw new OutOfRangeValueError('responseText exceeds the protocol byte bound');
    }
    normalized.responseText = input.responseText;
  } else if (responseKind === 'REFERENCE') {
    if (typeof input.responseRef !== 'string') {
      throw new ContractViolationError('responseRef must be a string');
    }
    const responseRef = input.responseRef.trim();
    if (responseRef.length === 0) {
      throw new ContractViolationError('responseRef must be nonempty after trimming');
    }
    if (Buffer.byteLength(responseRef, 'utf8') > responseBounds.referenceMaxUtf8Bytes) {
      throw new OutOfRangeValueError('responseRef exceeds the protocol byte bound');
    }
    normalized.responseRef = responseRef;
  } else if (responseKind === 'JSON') {
    if (!Array.isArray(input.responseJson) && !isPlainObject(input.responseJson)) {
      throw new ContractViolationError('responseJson must be a plain object or array');
    }
    normalized.responseJson = normalizeFinalizationValue(input.responseJson, '$.responseJson');
  }
  return normalized;
}

function normalizeTiming(input, timingPolicy) {
  const profile = timingPolicy.collectionProfile;
  const required = profile === 'FULL'
    ? new Set(TIMING_FIELD_NAMES)
    : profile === 'RESPONSE_ONLY'
      ? new Set(['inputEnabledOffsetMs', 'submittedOffsetMs'])
      : new Set();
  const prohibited = profile === 'NONE' ? new Set(TIMING_FIELD_NAMES) : new Set();
  const timing = {};

  for (const field of TIMING_FIELD_NAMES) {
    const present = hasOwn(input, field);
    if (required.has(field) && !present) {
      throw new MissingRequiredFieldError(`${field} is required for timing profile ${profile}`);
    }
    if (prohibited.has(field) && present) {
      throw new ContractViolationError(`${field} is prohibited for timing profile ${profile}`);
    }
    timing[field] = present
      ? validateNonnegativeSafeInteger(input[field], field)
      : null;
  }

  if (
    timing.inputEnabledOffsetMs !== null
    && timing.firstValidActivityOffsetMs !== null
    && timing.inputEnabledOffsetMs > timing.firstValidActivityOffsetMs
  ) {
    throw new OutOfRangeValueError('timing offsets are inverted');
  }
  if (
    timing.firstValidActivityOffsetMs !== null
    && timing.submittedOffsetMs !== null
    && timing.firstValidActivityOffsetMs > timing.submittedOffsetMs
  ) {
    throw new OutOfRangeValueError('timing offsets are inverted');
  }
  if (
    timing.inputEnabledOffsetMs !== null
    && timing.submittedOffsetMs !== null
    && timing.inputEnabledOffsetMs > timing.submittedOffsetMs
  ) {
    throw new OutOfRangeValueError('timing offsets are inverted');
  }

  let mismatch = false;
  if (timing.reportedClientMonotonicDurationMs !== null) {
    const expected = timing.submittedOffsetMs - timing.inputEnabledOffsetMs;
    const delta = Math.abs(timing.reportedClientMonotonicDurationMs - expected);
    mismatch = delta > timingPolicy.durationConsistencyToleranceMs;
    if (mismatch && timingPolicy.durationMismatchBehavior === 'REJECT') {
      throw new OutOfRangeValueError('reported client duration exceeds the protocol tolerance');
    }
  }

  let clockQuality;
  if (mismatch) {
    clockQuality = 'INVALID';
  } else if (profile === 'NONE') {
    clockQuality = 'UNKNOWN';
  } else if (profile === 'RESPONSE_ONLY' && (
    timing.firstValidActivityOffsetMs === null
    || timing.reportedClientMonotonicDurationMs === null
  )) {
    clockQuality = 'DEGRADED';
  } else {
    clockQuality = 'VALID';
  }
  return { ...timing, clockQuality };
}

function normalizeCorrectionAggregates(value, coverageMode) {
  if (!Array.isArray(value)) {
    throw new ContractViolationError('correctionAggregates must be an array');
  }
  if (coverageMode === 'NOT_COLLECTED') {
    if (value.length !== 0) {
      throw new ContractViolationError('correctionAggregates must be empty when not collected');
    }
    return [];
  }

  const expectedKeys = [];
  for (const initiator of CORRECTION_INITIATORS) {
    for (const feedbackPhase of FEEDBACK_PHASES) {
      for (const correctionOutcome of CORRECTION_OUTCOMES) {
        expectedKeys.push(`${initiator}\u0000${feedbackPhase}\u0000${correctionOutcome}`);
      }
    }
  }
  if (value.length !== expectedKeys.length) {
    throw new ContractViolationError('correctionAggregates must contain all 12 buckets');
  }

  const seen = new Set();
  const normalized = value.map((item, index) => {
    assertExactKeys(
      item,
      ['initiator', 'feedbackPhase', 'correctionOutcome', 'count'],
      `correctionAggregates[${index}]`
    );
    if (
      !CORRECTION_INITIATORS.includes(item.initiator)
      || !FEEDBACK_PHASES.includes(item.feedbackPhase)
      || !CORRECTION_OUTCOMES.includes(item.correctionOutcome)
    ) {
      throw new ContractViolationError('correction aggregate contains an invalid dimension');
    }
    const key = `${item.initiator}\u0000${item.feedbackPhase}\u0000${item.correctionOutcome}`;
    if (seen.has(key)) {
      throw new ContractViolationError('correctionAggregates contains a duplicate bucket');
    }
    seen.add(key);
    return {
      initiator: item.initiator,
      feedbackPhase: item.feedbackPhase,
      correctionOutcome: item.correctionOutcome,
      count: validateNonnegativeSafeInteger(
        item.count,
        `correctionAggregates[${index}].count`,
        { postgresInteger: true }
      ),
    };
  });
  if (expectedKeys.some((key) => !seen.has(key))) {
    throw new ContractViolationError('correctionAggregates coverage is incomplete');
  }
  return normalized.sort((left, right) => (
    CORRECTION_INITIATORS.indexOf(left.initiator)
      - CORRECTION_INITIATORS.indexOf(right.initiator)
    || FEEDBACK_PHASES.indexOf(left.feedbackPhase)
      - FEEDBACK_PHASES.indexOf(right.feedbackPhase)
    || CORRECTION_OUTCOMES.indexOf(left.correctionOutcome)
      - CORRECTION_OUTCOMES.indexOf(right.correctionOutcome)
  ));
}

async function normalizeEvaluations(client, value, snapshotNodes, rubric) {
  if (!Array.isArray(value)) {
    throw new ContractViolationError('evaluations must be an array');
  }
  const targetById = new Map(snapshotNodes.map((row) => [row.node_id, row]));
  const seen = new Set();
  const attributedNodeIds = new Set();
  const normalizedById = new Map();

  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    assertExactKeys(item, ['nodeId', 'rubricOutcome', 'isCorrect'], `evaluations[${index}]`);
    const nodeId = validateStableId(item.nodeId, `evaluations[${index}].nodeId`);
    if (!targetById.has(nodeId)) {
      throw new ContractViolationError(`evaluation node is not in the assignment snapshot: ${nodeId}`);
    }
    if (seen.has(nodeId)) {
      throw new ContractViolationError(`duplicate evaluation node: ${nodeId}`);
    }
    seen.add(nodeId);

    const outcome = item.rubricOutcome;
    assertExactKeys(outcome, [
      'classification',
      'linguisticCategory',
      'attributionRelation',
      'attributedNodeId',
      'rubricRuleId',
    ], `evaluations[${index}].rubricOutcome`);
    if (!CLASSIFICATION_VOCABULARY.includes(outcome.classification)) {
      throw new ContractViolationError('rubricOutcome classification is invalid');
    }
    const rubricRuleId = validateStableId(
      outcome.rubricRuleId,
      `evaluations[${index}].rubricOutcome.rubricRuleId`
    );
    if (!rubric.rubricRuleIds.includes(rubricRuleId)) {
      throw new ContractViolationError('rubricOutcome rubricRuleId is not rubric-authorized');
    }
    if (item.isCorrect !== null && typeof item.isCorrect !== 'boolean') {
      throw new ContractViolationError('isCorrect must be boolean or null');
    }

    const scorable = outcome.classification === 'NO_ERROR'
      || outcome.classification === 'LINGUISTIC_ERROR';
    let attributedNodeId = outcome.attributedNodeId;
    if (outcome.classification === 'NO_ERROR') {
      if (
        outcome.linguisticCategory !== null
        || outcome.attributionRelation !== null
        || attributedNodeId !== null
      ) {
        throw new ContractViolationError('NO_ERROR has non-applicable rubric fields');
      }
    } else if (outcome.classification === 'LINGUISTIC_ERROR') {
      if (
        !LINGUISTIC_CATEGORY_VOCABULARY.includes(outcome.linguisticCategory)
        || !ATTRIBUTION_RELATION_VOCABULARY.includes(outcome.attributionRelation)
      ) {
        throw new ContractViolationError('LINGUISTIC_ERROR rubric fields are invalid');
      }
      if (outcome.attributionRelation === 'TARGET') {
        if (attributedNodeId !== nodeId) {
          throw new ContractViolationError('TARGET attribution must identify the evaluation node');
        }
      } else if (
        outcome.attributionRelation === 'PREREQUISITE'
        || outcome.attributionRelation === 'CONTRAST'
      ) {
        attributedNodeId = validateStableId(
          attributedNodeId,
          `evaluations[${index}].rubricOutcome.attributedNodeId`
        );
        attributedNodeIds.add(attributedNodeId);
      } else if (attributedNodeId !== null) {
        throw new ContractViolationError('UNRESOLVED attribution requires null attributedNodeId');
      }
    } else if (
      outcome.linguisticCategory !== null
      || outcome.attributionRelation !== null
      || attributedNodeId !== null
    ) {
      throw new ContractViolationError('unscorable classifications have non-applicable fields');
    }

    if (rubric.scoreMode === 'BINARY') {
      const expectedCorrect = outcome.classification === 'NO_ERROR'
        ? true
        : outcome.classification === 'LINGUISTIC_ERROR'
          ? false
          : null;
      if (item.isCorrect !== expectedCorrect) {
        throw new ContractViolationError('isCorrect is inconsistent with the binary rubric');
      }
    } else if (item.isCorrect !== null) {
      throw new ContractViolationError('NON_BINARY rubrics require null isCorrect');
    }

    const normalizedOutcome = normalizeFinalizationValue({
      classification: outcome.classification,
      linguisticCategory: outcome.linguisticCategory,
      attributionRelation: outcome.attributionRelation,
      attributedNodeId,
      rubricRuleId,
    }, `evaluations[${index}].rubricOutcome`);
    normalizedById.set(nodeId, {
      nodeId,
      rubricOutcome: normalizedOutcome,
      isCorrect: item.isCorrect,
      scorable,
    });
  }

  if (seen.size !== snapshotNodes.length || snapshotNodes.some((row) => !seen.has(row.node_id))) {
    throw new ContractViolationError('evaluations must cover every snapshot target node exactly once');
  }

  if (attributedNodeIds.size > 0) {
    const requestedIds = [...attributedNodeIds];
    const { rows } = await client.query(
      'SELECT node_id FROM grammar_nodes WHERE node_id = ANY($1::text[])',
      [requestedIds]
    );
    const existingIds = new Set(rows.map((row) => row.node_id));
    const missing = requestedIds.find((nodeId) => !existingIds.has(nodeId));
    if (missing) {
      throw new NotFoundError(`Unknown attributedNodeId: ${missing}`);
    }
  }

  for (const evaluation of normalizedById.values()) {
    const relation = evaluation.rubricOutcome.attributionRelation;
    if (relation !== 'PREREQUISITE' && relation !== 'CONTRAST') continue;
    const authority = rubric.attributionAuthority.byTargetNode[evaluation.nodeId];
    const allowedIds = relation === 'PREREQUISITE'
      ? authority.prerequisiteNodeIds
      : authority.contrastNodeIds;
    if (!allowedIds.includes(evaluation.rubricOutcome.attributedNodeId)) {
      throw new ContractViolationError(`${relation} attribution is not rubric-authorized`);
    }
  }

  return snapshotNodes.map((row) => normalizedById.get(row.node_id));
}

function deriveAttemptOutcome(responseKind, evaluations) {
  const classifications = evaluations.map(
    (evaluation) => evaluation.rubricOutcome.classification
  );
  const modalityFailureCount = classifications.filter(
    (classification) => classification === 'MODALITY_INPUT_FAILURE'
  ).length;
  if (modalityFailureCount > 0) {
    if (modalityFailureCount !== evaluations.length) {
      throw new ContractViolationError('MODALITY_INPUT_FAILURE must be uniform');
    }
    if (responseKind !== 'NORMAL_EMPTY') {
      throw new ContractViolationError('MODALITY_INPUT_FAILURE requires NORMAL_EMPTY');
    }
    return 'TECHNICAL_INVALID';
  }
  if (responseKind === 'NORMAL_EMPTY') {
    if (classifications.some((classification) => classification !== 'NO_EVALUABLE_RESPONSE')) {
      throw new ContractViolationError('NORMAL_EMPTY requires NO_EVALUABLE_RESPONSE evaluations');
    }
    return 'UNSCORABLE';
  }
  return evaluations.some((evaluation) => evaluation.scorable)
    ? 'SCORABLE'
    : 'UNSCORABLE';
}

async function loadFinalizationByAttempt(queryable, attemptId) {
  const { rows } = await queryable.query(
    'SELECT * FROM evidence_attempt_finalizations WHERE attempt_id = $1',
    [attemptId]
  );
  return rows[0] || null;
}

function replayFinalizationOrConflict(row, identity, digest) {
  if (!row) {
    throw new ContractViolationError('finalization conflict could not be reloaded');
  }
  if (row.finalization_idempotency_identity !== identity) {
    throw new ContractViolationError('attempt already has a different finalization identity');
  }
  if (
    row.finalization_payload_digest !== digest.digest
    || row.digest_algorithm !== digest.digestAlgorithm
    || row.normalization_version !== digest.normalizationVersion
  ) {
    throw new ContractViolationError(
      'finalization identity was already used with a different normalized payload'
    );
  }
  return { ...row.replay_result, replayed: true };
}

function mapFinalizationDatabaseError(error) {
  if (error && typeof error.code === 'string' && [
    'INVALID_ID',
    'MISSING_REQUIRED_FIELD',
    'OUT_OF_RANGE_VALUE',
    'CONTRACT_VIOLATION',
  ].includes(error.code)) {
    return error;
  }
  if (error?.code === '23503') {
    return new NotFoundError('finalizeAttempt: referenced row does not exist');
  }
  if (
    error?.code === '23505'
    || error?.code === '23514'
    || error?.code === '23502'
    || error?.code === '22P02'
  ) {
    return new ContractViolationError('finalizeAttempt: database contract rejected the request');
  }
  if (error?.code === '22001' || error?.code === '22003') {
    return new OutOfRangeValueError('finalizeAttempt: value exceeds the repository bound');
  }
  return error;
}

async function finalizeAttempt(pool, input) {
  validateFinalizationTopLevelShape(input);
  const serverReceivedAt = new Date().toISOString();
  const normalizedBase = normalizeFinalizationBaseInput(input);
  if (!pool || typeof pool.connect !== 'function') {
    throw new ContractViolationError('pool.connect is required');
  }

  const client = await pool.connect();
  let digest;
  try {
    await client.query('BEGIN');

    const { rows: relationRows } = await client.query(
      `SELECT assignment_id, session_id
         FROM evidence_attempts
        WHERE attempt_id = $1`,
      [normalizedBase.attemptId]
    );
    const relation = relationRows[0];
    if (!relation) {
      throw new NotFoundError(`Unknown attemptId: ${normalizedBase.attemptId}`);
    }

    const { rows: assignmentRows } = await client.query(
      `SELECT
         a.assignment_id,
         a.enrollment_id,
         a.terminal_outcome AS assignment_terminal_outcome,
         a.superseded_by,
         e.status AS enrollment_status,
         snap.rubric_id,
         snap.rubric_version,
         snap.instrumentation_protocol_id,
         snap.instrumentation_protocol_version,
         snap.planned_stimulus_modalities,
         snap.planned_response_modalities
       FROM evidence_assignments a
       JOIN evidence_enrollments e ON e.enrollment_id = a.enrollment_id
       LEFT JOIN evidence_assignment_snapshots snap ON snap.assignment_id = a.assignment_id
      WHERE a.assignment_id = $1
      FOR UPDATE OF a`,
      [relation.assignment_id]
    );
    const assignment = assignmentRows[0];
    if (!assignment) {
      throw new NotFoundError(`Unknown assignmentId: ${relation.assignment_id}`);
    }

    const { rows: sessionRows } = await client.query(
      `SELECT session_id, enrollment_id, ended_at, terminal_outcome
         FROM evidence_sessions
        WHERE session_id = $1
        FOR UPDATE`,
      [relation.session_id]
    );
    const session = sessionRows[0];
    if (!session) {
      throw new NotFoundError(`Unknown sessionId: ${relation.session_id}`);
    }

    const { rows: attemptRows } = await client.query(
      `SELECT attempt_id, assignment_id, session_id
         FROM evidence_attempts
        WHERE attempt_id = $1
        FOR UPDATE`,
      [normalizedBase.attemptId]
    );
    const attempt = attemptRows[0];
    if (!attempt) {
      throw new NotFoundError(`Unknown attemptId: ${normalizedBase.attemptId}`);
    }
    if (
      attempt.assignment_id !== assignment.assignment_id
      || attempt.session_id !== session.session_id
    ) {
      throw new ContractViolationError('attempt assignment/session relationship is invalid');
    }
    if (assignment.enrollment_id !== session.enrollment_id) {
      throw new ContractViolationError('assignment and session must share enrollment ownership');
    }
    if (
      assignment.rubric_id === null
      || assignment.rubric_version === null
      || assignment.instrumentation_protocol_id === null
      || assignment.instrumentation_protocol_version === null
    ) {
      throw new ContractViolationError('assignment snapshot is missing');
    }

    const { rows: snapshotNodes } = await client.query(
      `SELECT node_id, ordinal
         FROM evidence_assignment_snapshot_nodes
        WHERE assignment_id = $1
        ORDER BY ordinal ASC`,
      [assignment.assignment_id]
    );
    if (
      snapshotNodes.length === 0
      || snapshotNodes.some((row, index) => Number(row.ordinal) !== index)
    ) {
      throw new ContractViolationError('assignment snapshot target-node set is incomplete');
    }

    if (
      assignment.instrumentation_protocol_id
        !== normalizedBase.instrumentationProtocolId
      || Number(assignment.instrumentation_protocol_version)
        !== normalizedBase.instrumentationProtocolVersion
    ) {
      throw new ContractViolationError(
        'finalization instrumentation protocol must match the assignment snapshot'
      );
    }

    const { rows: protocolRows } = await client.query(
      `SELECT definition
         FROM evidence_reference_versions
        WHERE reference_kind = 'INSTRUMENTATION_PROTOCOL'
          AND reference_id = $1
          AND version = $2`,
      [
        assignment.instrumentation_protocol_id,
        assignment.instrumentation_protocol_version,
      ]
    );
    if (protocolRows.length === 0) {
      throw new NotFoundError('Unknown assignment instrumentation protocol version');
    }
    const protocol = validateInstrumentationProtocolDefinition(protocolRows[0].definition);

    const { rows: rubricRows } = await client.query(
      `SELECT definition
         FROM evidence_reference_versions
        WHERE reference_kind = 'RUBRIC'
          AND reference_id = $1
          AND version = $2`,
      [assignment.rubric_id, assignment.rubric_version]
    );
    if (rubricRows.length === 0) {
      throw new NotFoundError('Unknown assignment rubric version');
    }
    const rubric = validateRubricDefinition(
      rubricRows[0].definition,
      snapshotNodes.map((row) => row.node_id)
    );

    const actualStimulusModalities = canonicalizeModalities(
      normalizedBase.actualStimulusModalities,
      'actualStimulusModalities',
      STIMULUS_MODALITIES,
      protocol.modalityPolicy.allowedStimulusModalities
    );
    const actualResponseModalities = canonicalizeModalities(
      normalizedBase.actualResponseModalities,
      'actualResponseModalities',
      RESPONSE_MODALITIES,
      protocol.modalityPolicy.allowedResponseModalities
    );
    enforceModalityCoverage(
      actualStimulusModalities,
      assignment.planned_stimulus_modalities,
      protocol.modalityPolicy.stimulusCoverage,
      'actualStimulusModalities'
    );
    enforceModalityCoverage(
      actualResponseModalities,
      assignment.planned_response_modalities,
      protocol.modalityPolicy.responseCoverage,
      'actualResponseModalities'
    );

    const response = normalizeResponse(input, normalizedBase.responseKind, protocol.responseBounds);
    if (response.responseJson !== null) {
      const { rows: sizeRows } = await client.query(
        'SELECT octet_length(($1::jsonb)::text) AS byte_count',
        [JSON.stringify(response.responseJson)]
      );
      if (Number(sizeRows[0].byte_count) > protocol.responseBounds.jsonMaxUtf8Bytes) {
        throw new OutOfRangeValueError('responseJson exceeds the protocol byte bound');
      }
    }
    const timing = normalizeTiming(input, protocol.timingPolicy);
    const evaluations = await normalizeEvaluations(
      client,
      normalizedBase.evaluations,
      snapshotNodes,
      rubric
    );
    const { rows: rubricSizeRows } = await client.query(
      `SELECT COALESCE(bool_and(octet_length(value::text) <= 16384), true) AS within_bound
         FROM jsonb_array_elements($1::jsonb)`,
      [JSON.stringify(evaluations.map((evaluation) => evaluation.rubricOutcome))]
    );
    if (!rubricSizeRows[0].within_bound) {
      throw new OutOfRangeValueError('rubricOutcome exceeds the repository byte bound');
    }
    const correctionAggregates = normalizeCorrectionAggregates(
      normalizedBase.correctionAggregates,
      protocol.correctionCoverageMode
    );
    const attemptOutcome = deriveAttemptOutcome(normalizedBase.responseKind, evaluations);

    const normalizedForDigest = {
      ...normalizedBase,
      ...response,
      ...timing,
      actualStimulusModalities,
      actualResponseModalities,
      evaluations: evaluations.map(({ nodeId, rubricOutcome, isCorrect }) => ({
        nodeId,
        rubricOutcome,
        isCorrect,
      })),
      correctionAggregates,
    };
    digest = digestFinalizationPayload(buildFinalizationDigestInput(normalizedForDigest));

    const existing = await loadFinalizationByAttempt(client, normalizedBase.attemptId);
    if (existing) {
      const replay = replayFinalizationOrConflict(
        existing,
        normalizedBase.finalizationIdempotencyIdentity,
        digest
      );
      await client.query('COMMIT');
      return replay;
    }

    if (
      assignment.enrollment_status !== 'ACTIVE'
      || assignment.assignment_terminal_outcome !== null
      || assignment.superseded_by !== null
      || session.ended_at !== null
      || session.terminal_outcome !== null
    ) {
      throw new ContractViolationError(
        'initial finalization requires active enrollment, assignment, and session'
      );
    }

    const receivedMs = new Date(serverReceivedAt).getTime();
    const finalizedAt = new Date(Math.max(Date.now(), receivedMs)).toISOString();
    const isScorableCompletion = attemptOutcome === 'SCORABLE';
    const replayResult = {
      replayed: false,
      attemptId: normalizedBase.attemptId,
      assignmentId: assignment.assignment_id,
      sessionId: session.session_id,
      finalizationIdempotencyIdentity:
        normalizedBase.finalizationIdempotencyIdentity,
      serverReceivedAt,
      finalizedAt,
      clockQuality: timing.clockQuality,
      responseKind: normalizedBase.responseKind,
      attemptOutcome,
      instrumentationProtocolId: assignment.instrumentation_protocol_id,
      instrumentationProtocolVersion: Number(
        assignment.instrumentation_protocol_version
      ),
      rubricId: assignment.rubric_id,
      rubricVersion: Number(assignment.rubric_version),
      evaluationCount: evaluations.length,
      correctionBucketCount: correctionAggregates.length,
      assignmentTerminalOutcome: isScorableCompletion ? 'COMPLETED' : null,
      assignmentCompletedAt: isScorableCompletion ? finalizedAt : null,
      assignmentCompletionAttemptId: isScorableCompletion
        ? normalizedBase.attemptId
        : null,
    };

    await client.query(
      `INSERT INTO evidence_attempt_finalizations (
         attempt_id,
         finalization_idempotency_identity,
         finalization_payload_digest,
         digest_algorithm,
         normalization_version,
         server_received_at,
         finalized_at,
         clock_quality,
         response_kind,
         attempt_outcome,
         instrumentation_protocol_id,
         instrumentation_protocol_version,
         actual_stimulus_modalities,
         actual_response_modalities,
         input_enabled_offset_ms,
         first_valid_activity_offset_ms,
         submitted_offset_ms,
         reported_client_monotonic_duration_ms,
         response_text,
         response_json,
         response_ref,
         replay_result
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
         $13::jsonb, $14::jsonb, $15, $16, $17, $18, $19, $20::jsonb, $21, $22::jsonb
       )`,
      [
        normalizedBase.attemptId,
        normalizedBase.finalizationIdempotencyIdentity,
        digest.digest,
        digest.digestAlgorithm,
        digest.normalizationVersion,
        serverReceivedAt,
        finalizedAt,
        timing.clockQuality,
        normalizedBase.responseKind,
        attemptOutcome,
        assignment.instrumentation_protocol_id,
        Number(assignment.instrumentation_protocol_version),
        JSON.stringify(actualStimulusModalities),
        JSON.stringify(actualResponseModalities),
        timing.inputEnabledOffsetMs,
        timing.firstValidActivityOffsetMs,
        timing.submittedOffsetMs,
        timing.reportedClientMonotonicDurationMs,
        response.responseText,
        response.responseJson === null ? null : JSON.stringify(response.responseJson),
        response.responseRef,
        JSON.stringify(replayResult),
      ]
    );

    for (const evaluation of evaluations) {
      await client.query(
        `INSERT INTO evidence_target_node_evaluations (
           evaluation_id,
           attempt_id,
           node_id,
           rubric_id,
           rubric_version,
           rubric_outcome,
           scorable,
           is_correct,
           evaluation_source
         )
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, 'RULE')`,
        [
          randomUUID(),
          normalizedBase.attemptId,
          evaluation.nodeId,
          assignment.rubric_id,
          Number(assignment.rubric_version),
          JSON.stringify(evaluation.rubricOutcome),
          evaluation.scorable,
          evaluation.isCorrect,
        ]
      );
    }

    for (const aggregate of correctionAggregates) {
      await client.query(
        `INSERT INTO evidence_correction_aggregates (
           attempt_id, initiator, feedback_phase, correction_outcome, count
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          normalizedBase.attemptId,
          aggregate.initiator,
          aggregate.feedbackPhase,
          aggregate.correctionOutcome,
          aggregate.count,
        ]
      );
    }

    if (isScorableCompletion) {
      const { rowCount } = await client.query(
        `UPDATE evidence_assignments
            SET terminal_outcome = 'COMPLETED',
                completion_attempt_id = $2,
                completed_at = $3
          WHERE assignment_id = $1
            AND terminal_outcome IS NULL`,
        [assignment.assignment_id, normalizedBase.attemptId, finalizedAt]
      );
      if (rowCount !== 1) {
        throw new ContractViolationError(
          'finalizeAttempt: assignment completion write did not affect exactly one row'
        );
      }
    }

    await client.query('COMMIT');
    return replayResult;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original failure.
    }

    if (
      error?.code === '23505'
      && error.constraint === 'evidence_attempt_finalizations_pk'
      && digest
    ) {
      const existing = await loadFinalizationByAttempt(pool, normalizedBase.attemptId);
      return replayFinalizationOrConflict(
        existing,
        normalizedBase.finalizationIdempotencyIdentity,
        digest
      );
    }
    throw mapFinalizationDatabaseError(error);
  } finally {
    client.release();
  }
}

async function getExperimentVersion(pool, experimentId, version) {
  const id = validateStableId(experimentId, 'experimentId');
  const normalizedVersion = validatePositiveVersion(version, 'version');
  const { rows } = await pool.query(
    `SELECT * FROM evidence_experiment_versions
      WHERE experiment_id = $1 AND version = $2`,
    [id, normalizedVersion]
  );
  return rows[0] || null;
}

async function getConditionVersion(pool, conditionId, version) {
  const id = validateStableId(conditionId, 'conditionId');
  const normalizedVersion = validatePositiveVersion(version, 'version');
  const { rows } = await pool.query(
    `SELECT * FROM evidence_condition_versions
      WHERE condition_id = $1 AND version = $2`,
    [id, normalizedVersion]
  );
  return rows[0] || null;
}

async function getReferenceVersion(pool, referenceKind, referenceId, version) {
  const kind = validateReferenceKind(referenceKind);
  const id = validateStableId(referenceId, 'referenceId');
  const normalizedVersion = validatePositiveVersion(version, 'version');
  const { rows } = await pool.query(
    `SELECT * FROM evidence_reference_versions
      WHERE reference_kind = $1 AND reference_id = $2 AND version = $3`,
    [kind, id, normalizedVersion]
  );
  return rows[0] || null;
}

async function getParticipant(pool, participantId) {
  const id = validateUuid(participantId, 'participantId');
  const { rows } = await pool.query(
    'SELECT * FROM evidence_participants WHERE participant_id = $1',
    [id]
  );
  return rows[0] || null;
}

async function getEnrollment(pool, enrollmentId) {
  const id = validateUuid(enrollmentId, 'enrollmentId');
  const { rows } = await pool.query(
    'SELECT * FROM evidence_enrollments WHERE enrollment_id = $1',
    [id]
  );
  return rows[0] || null;
}

async function getAssignmentAggregate(pool, assignmentId) {
  const id = validateUuid(assignmentId, 'assignmentId');
  const [{ rows: assignments }, { rows: snapshots }, { rows: targetNodes }] = await Promise.all([
    pool.query('SELECT * FROM evidence_assignments WHERE assignment_id = $1', [id]),
    pool.query('SELECT * FROM evidence_assignment_snapshots WHERE assignment_id = $1', [id]),
    pool.query(
      `SELECT * FROM evidence_assignment_snapshot_nodes
        WHERE assignment_id = $1
        ORDER BY ordinal ASC`,
      [id]
    ),
  ]);
  if (assignments.length === 0) return null;
  return {
    assignment: assignments[0],
    snapshot: snapshots[0] || null,
    targetNodes,
  };
}

async function getAttemptById(pool, attemptId) {
  const id = validateUuid(attemptId, 'attemptId');
  const { rows } = await pool.query(
    'SELECT * FROM evidence_attempts WHERE attempt_id = $1',
    [id]
  );
  return rows[0] || null;
}

async function getAttemptByIdempotency(pool, assignmentId, idempotencyIdentity) {
  const normalizedAssignmentId = validateUuid(assignmentId, 'assignmentId');
  const identity = validateStableId(idempotencyIdentity, 'idempotencyIdentity');
  return loadAttemptByKey(pool, normalizedAssignmentId, identity);
}

const SESSION_TERMINAL_OUTCOMES = Object.freeze([
  'COMPLETED',
  'ABANDONED',
  'TIMED_OUT',
  'TECHNICAL_FAILURE',
  'WITHDRAWN',
]);

function validateSessionTerminalOutcome(value) {
  const normalized = validateStableId(value, 'terminalOutcome');
  if (!SESSION_TERMINAL_OUTCOMES.includes(normalized)) {
    throw new ContractViolationError(`Unsupported terminalOutcome: ${normalized}`);
  }
  return normalized;
}

async function startSession(pool, input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, [
    'sessionId',
    'startedAt',
    'endedAt',
    'terminalOutcome',
    'technicalFailureRef',
    'restartedFrom',
    'createdAt',
  ]);
  assertAllowedKeys(input, ['enrollmentId']);

  const enrollmentId = validateUuid(requireField(input, 'enrollmentId'), 'enrollmentId');

  try {
    return await withTransaction(pool, async (client) => {
      const { rows: enrollmentRows } = await client.query(
        'SELECT status FROM evidence_enrollments WHERE enrollment_id = $1',
        [enrollmentId]
      );
      const enrollment = enrollmentRows[0];
      if (!enrollment) {
        throw new NotFoundError(`Unknown enrollmentId: ${enrollmentId}`);
      }
      if (enrollment.status !== 'ACTIVE') {
        throw new ContractViolationError('session start requires an ACTIVE enrollment');
      }

      const { rows } = await client.query(
        `INSERT INTO evidence_sessions (enrollment_id)
         VALUES ($1)
         RETURNING *`,
        [enrollmentId]
      );
      return rows[0];
    });
  } catch (error) {
    throw mapDatabaseError(error, 'startSession');
  }
}

async function terminalizeSession(pool, input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, [
    'startedAt',
    'endedAt',
    'restartedFrom',
    'createdAt',
  ]);
  assertAllowedKeys(input, ['sessionId', 'terminalOutcome', 'technicalFailureRef']);

  const sessionId = validateUuid(requireField(input, 'sessionId'), 'sessionId');
  const terminalOutcome = validateSessionTerminalOutcome(requireField(input, 'terminalOutcome'));
  const technicalFailureRef = validateOptionalString(
    input.technicalFailureRef,
    'technicalFailureRef'
  );

  try {
    return await withTransaction(pool, async (client) => {
      const { rows: sessionRows } = await client.query(
        `SELECT ended_at, terminal_outcome
           FROM evidence_sessions
          WHERE session_id = $1
          FOR UPDATE`,
        [sessionId]
      );
      const session = sessionRows[0];
      if (!session) {
        throw new NotFoundError(`Unknown sessionId: ${sessionId}`);
      }
      if (session.ended_at !== null || session.terminal_outcome !== null) {
        throw new ContractViolationError('session is already terminal');
      }

      const { rows } = await client.query(
        `UPDATE evidence_sessions
            SET ended_at = now(),
                terminal_outcome = $2,
                technical_failure_ref = $3
          WHERE session_id = $1
          RETURNING *`,
        [sessionId, terminalOutcome, technicalFailureRef]
      );
      return rows[0];
    });
  } catch (error) {
    throw mapDatabaseError(error, 'terminalizeSession');
  }
}

async function restartSession(pool, input) {
  validateInputObject(input);
  rejectServerIssuedFieldOverrides(input, [
    'sessionId',
    'enrollmentId',
    'startedAt',
    'endedAt',
    'terminalOutcome',
    'technicalFailureRef',
    'restartedFrom',
    'createdAt',
  ]);
  assertAllowedKeys(input, ['priorSessionId']);

  const priorSessionId = validateUuid(requireField(input, 'priorSessionId'), 'priorSessionId');

  try {
    return await withTransaction(pool, async (client) => {
      const { rows: priorRows } = await client.query(
        `SELECT enrollment_id, ended_at, terminal_outcome
           FROM evidence_sessions
          WHERE session_id = $1
          FOR UPDATE`,
        [priorSessionId]
      );
      const prior = priorRows[0];
      if (!prior) {
        throw new NotFoundError(`Unknown priorSessionId: ${priorSessionId}`);
      }
      if (prior.ended_at === null || prior.terminal_outcome === null) {
        throw new ContractViolationError('session restart requires a terminal prior session');
      }

      const { rows } = await client.query(
        `INSERT INTO evidence_sessions (enrollment_id, restarted_from)
         VALUES ($1, $2)
         RETURNING *`,
        [prior.enrollment_id, priorSessionId]
      );
      return rows[0];
    });
  } catch (error) {
    throw mapDatabaseError(error, 'restartSession');
  }
}

module.exports = {
  createAssignment,
  createEnrollment,
  createParticipant,
  finalizeAttempt,
  getAssignmentAggregate,
  getAttemptById,
  getAttemptByIdempotency,
  getConditionVersion,
  getEnrollment,
  getExperimentVersion,
  getParticipant,
  getReferenceVersion,
  openAttempt,
  registerConditionVersion,
  registerExperimentVersion,
  registerReferenceVersion,
  restartSession,
  startSession,
  terminalizeSession,
  withTransaction,
};
