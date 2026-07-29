'use strict';

const { randomUUID } = require('node:crypto');
const {
  ContractViolationError,
  NotFoundError,
  OutOfRangeValueError,
  assertAllowedKeys,
  rejectDirectPiiKeys,
  rejectServerIssuedFieldOverrides,
  requireField,
  validateAnchorStrategy,
  validateAssignmentType,
  validateConditionClass,
  validateDefinition,
  validateInputObject,
  validateOptionalString,
  validatePartialReference,
  validatePositiveVersion,
  validateReferenceKind,
  validateResponseModalities,
  validateStableId,
  validateStimulusModalities,
  validateTargetNodeIds,
  validateTargetTimepoint,
  validateUuid,
} = require('./evidenceValidation');
const {
  buildAttemptOpenDigestInput,
  buildSnapshotDigestInput,
  digestSemanticPayload,
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

module.exports = {
  createAssignment,
  createEnrollment,
  createParticipant,
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
  withTransaction,
};
