'use strict';

// VI P1 Measurement Readiness -- RUNTIME FOUNDATION A.
//
// Exercises the assignment-time exposure-history cutoff, the immutable
// resolved item-lineage authority, and the recordAssignmentItemExposure
// first-exposure writer against an actual PostgreSQL instance
// (VI_EMPIRICAL_EVIDENCE_CONTRACT.md §12.1.1, EVIDENCE_FOUNDATION_P0_SCHEMA.md
// §5.9/§5.9.1/§9.1/§9.1.1, API_CONTRACT.md §13.10.4/§13.10.4.1).
//
// RAW METRIC QUERY / REBUILD is out of scope for this milestone and is not
// exercised here.

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const evidence = require('../src/instrumentation');

const repository = evidence.evidenceRepository;

const EXPERIMENT_ID = 'EXP_LINEAGE_RUNTIME';
const CONDITION_ID = 'COND_LINEAGE_RUNTIME';
const SCENARIO_ID = 'SCENARIO_LINEAGE_RUNTIME';
const LEXICAL_MANIFEST_ID = 'LEXICAL_LINEAGE_RUNTIME';
const RUBRIC_ID = 'RUBRIC_LINEAGE_RUNTIME';
const FORMULA_ID = 'FORMULA_LINEAGE_RUNTIME';
const SCHEDULER_PROTOCOL_ID = 'SCHEDULER_LINEAGE_RUNTIME';
const INSTRUMENTATION_PROTOCOL_ID = 'INSTRUMENTATION_LINEAGE_RUNTIME';

// Item/family fixture used across lineage-resolution tests.
const ITEM_X = 'ITEM_LINEAGE_X'; // family FAMILY_MAIN
const ITEM_Y = 'ITEM_LINEAGE_Y'; // family FAMILY_MAIN, different item id from X
const ITEM_W = 'ITEM_LINEAGE_W'; // family FAMILY_MAIN, "current" item distinct from X/Y
const ITEM_Z = 'ITEM_LINEAGE_Z'; // family FAMILY_OTHER
const FAMILY_MAIN = 'FAMILY_LINEAGE_MAIN';
const FAMILY_OTHER = 'FAMILY_LINEAGE_OTHER';

const NODE_A = 'NODE_LINEAGE_A';
const NODE_B = 'NODE_LINEAGE_B';
const NODE_C = 'NODE_LINEAGE_C';
const NODE_D = 'NODE_LINEAGE_D';

let fixtureCounter = 0;

async function resetAndMigrate() {
  await pool.query('DROP SCHEMA public CASCADE');
  await pool.query('CREATE SCHEMA public');
  await runMigrations();
}

async function insertGrammarNodes() {
  await pool.query(
    `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
     VALUES
       ($1, 'VI', '[]'::jsonb, 'Lineage A', 1),
       ($2, 'VI', '[]'::jsonb, 'Lineage B', 1),
       ($3, 'VI', '[]'::jsonb, 'Lineage C', 1),
       ($4, 'VI', '[]'::jsonb, 'Lineage D', 1)`,
    [NODE_A, NODE_B, NODE_C, NODE_D]
  );
}

async function registerReference(referenceKind, referenceId, version) {
  return repository.registerReferenceVersion(pool, {
    referenceKind,
    referenceId,
    version,
    definition: { kind: referenceKind, stableId: referenceId, version },
  });
}

// ITEM lineage-authority fixtures (API_CONTRACT.md §13.10.11.3,
// EVIDENCE_FOUNDATION_P0_SCHEMA.md §5.5). `lineageAuthority` is an optional
// sub-object of the existing ITEM `definition` JSONB -- no new reference kind,
// no new physical object, no migration.
function lineageAuthority({ canonicalStimulusId = null, surfaceVariantReferences = [] } = {}) {
  return {
    definitionType: 'EVIDENCE_ITEM_LINEAGE',
    definitionVersion: 1,
    canonicalStimulusId,
    surfaceVariantReferences,
  };
}

// Registers an ITEM whose definition carries the EXACT supplied
// `lineageAuthority` value -- including an explicit `null`, which the
// canonical contract rejects at consume time.
async function registerItemWithLineage(itemId, authority, version = 1) {
  return repository.registerReferenceVersion(pool, {
    referenceKind: 'ITEM',
    referenceId: itemId,
    version,
    definition: {
      kind: 'ITEM',
      stableId: itemId,
      version,
      lineageAuthority: authority,
    },
  });
}

async function insertGrammarNode(nodeId, label) {
  await pool.query(
    `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
     VALUES ($1, 'VI', '[]'::jsonb, $2, 1)`,
    [nodeId, label]
  );
}

async function registerAuthorityFixture() {
  await repository.registerExperimentVersion(pool, {
    experimentId: EXPERIMENT_ID,
    version: 1,
    definition: { protocol: 'VI_P1_LINEAGE' },
  });
  await repository.registerConditionVersion(pool, {
    conditionId: CONDITION_ID,
    version: 1,
    conditionClass: 'ENGINEERING_BASELINE',
    definition: { mode: 'FIXED' },
  });

  await registerReference('ITEM', ITEM_X, 1);
  await registerReference('ITEM', ITEM_Y, 1);
  await registerReference('ITEM', ITEM_W, 1);
  await registerReference('ITEM', ITEM_Z, 1);
  await registerReference('SCENARIO', SCENARIO_ID, 1);
  await registerReference('ITEM_FAMILY', FAMILY_MAIN, 1);
  await registerReference('ITEM_FAMILY', FAMILY_OTHER, 1);
  await registerReference('LEXICAL_MANIFEST', LEXICAL_MANIFEST_ID, 1);
  await registerReference('RUBRIC', RUBRIC_ID, 1);
  await registerReference('FORMULA', FORMULA_ID, 1);
  await registerReference('SCHEDULER_PROTOCOL', SCHEDULER_PROTOCOL_ID, 1);
  await registerReference('INSTRUMENTATION_PROTOCOL', INSTRUMENTATION_PROTOCOL_ID, 1);
}

async function newEnrollment() {
  const participant = await repository.createParticipant(pool, {});
  return repository.createEnrollment(pool, {
    participantId: participant.participant_id,
    experimentId: EXPERIMENT_ID,
    experimentVersion: 1,
    conditionId: CONDITION_ID,
    conditionVersion: 1,
  });
}

function referencesFor({ itemId, itemFamilyId }) {
  return {
    itemId,
    itemVersion: 1,
    scenarioId: SCENARIO_ID,
    scenarioVersion: 1,
    itemFamilyId,
    itemFamilyVersion: 1,
    lexicalManifestId: LEXICAL_MANIFEST_ID,
    lexicalManifestVersion: 1,
    rubricId: RUBRIC_ID,
    rubricVersion: 1,
    formulaId: FORMULA_ID,
    formulaVersion: 1,
    schedulerProtocolId: SCHEDULER_PROTOCOL_ID,
    schedulerProtocolVersion: 1,
    instrumentationProtocolId: INSTRUMENTATION_PROTOCOL_ID,
    instrumentationProtocolVersion: 1,
  };
}

async function createAssignmentFixture(enrollmentId, options = {}) {
  fixtureCounter += 1;
  return repository.createAssignment(pool, {
    enrollmentId,
    assignmentType: options.assignmentType ?? 'ASSESSMENT',
    targetTimepoint: 'IMMEDIATE',
    anchorStrategy: 'NODE_ASSIGNMENT_COMPLETION',
    targetNodeIds: options.targetNodeIds ?? [NODE_A],
    references: referencesFor({
      itemId: options.itemId ?? ITEM_X,
      itemFamilyId: options.itemFamilyId ?? FAMILY_MAIN,
    }),
    plannedStimulusModalities: ['TEXT'],
    plannedResponseModalities: ['TEXT_ENTRY'],
  });
}

async function exposeNewAssignment(enrollmentId, options = {}) {
  const created = await createAssignmentFixture(enrollmentId, {
    assignmentType: options.assignmentType ?? 'LEARNING',
    targetNodeIds: options.targetNodeIds,
    itemId: options.itemId,
    itemFamilyId: options.itemFamilyId,
  });
  const exposure = await repository.recordAssignmentItemExposure(pool, {
    assignmentId: created.assignment.assignment_id,
  });
  return { created, exposure };
}

// One same-enrollment prior exposure followed by the ASSESSMENT that consumes
// it, so `R(A)` is nonempty and `L(A)` is exactly {current ITEM, prior ITEM}.
async function assessAfterPriorExposure({
  nodeId,
  priorItemId,
  priorFamilyId,
  currentItemId,
  currentFamilyId,
  priorNodeIds,
}) {
  const enrollment = await newEnrollment();
  await exposeNewAssignment(enrollment.enrollment_id, {
    targetNodeIds: priorNodeIds ?? [nodeId],
    itemId: priorItemId,
    itemFamilyId: priorFamilyId,
  });
  return createAssignmentFixture(enrollment.enrollment_id, {
    assignmentType: 'ASSESSMENT',
    targetNodeIds: [nodeId],
    itemId: currentItemId,
    itemFamilyId: currentFamilyId,
  });
}

async function lineageAfterPriorExposure(options) {
  const assessment = await assessAfterPriorExposure(options);
  return (await readSnapshot(assessment.assignment.assignment_id)).resolved_item_lineage;
}

async function countRows(tableName) {
  const { rows } = await pool.query(`SELECT count(*) AS n FROM ${tableName}`);
  return Number(rows[0].n);
}

async function readSnapshot(assignmentId) {
  const { rows } = await pool.query(
    `SELECT exposure_history_cutoff_ordinal, resolved_item_lineage, snapshot_digest
       FROM evidence_assignment_snapshots
      WHERE assignment_id = $1`,
    [assignmentId]
  );
  return rows[0];
}

async function readExposuresFor(assignmentId) {
  const { rows } = await pool.query(
    `SELECT exposure_id, exposure_ordinal, exposed_at
       FROM evidence_assignment_item_exposures
      WHERE assignment_id = $1`,
    [assignmentId]
  );
  return rows;
}

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

describe('VI P1 item exposure lineage runtime', { concurrency: false }, () => {
  before(async () => {
    await resetAndMigrate();
    await insertGrammarNodes();
    await registerAuthorityFixture();
  });

  after(async () => {
    await pool.end();
  });

  test('T01 assignment creation alone creates no exposure row', async () => {
    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id);
    const rows = await readExposuresFor(created.assignment.assignment_id);
    assert.deepEqual(rows, []);
  });

  test('T02 first exposure creates exactly one row', async () => {
    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'LEARNING',
    });
    const result = await repository.recordAssignmentItemExposure(pool, {
      assignmentId: created.assignment.assignment_id,
    });
    assert.equal(result.replayed, false);
    assert.equal(result.assignmentId, created.assignment.assignment_id);
    assert.equal(result.enrollmentId, enrollment.enrollment_id);
    // D4: exposureOrdinal is the exact base-10 decimal string BIGINT
    // authority, never a JS Number. Positivity/format is checked on the
    // string itself; BigInt is used only as a lossless ">" comparator.
    assert.equal(typeof result.exposureOrdinal, 'string');
    assert.match(result.exposureOrdinal, /^[1-9][0-9]*$/);
    assert.ok(BigInt(result.exposureOrdinal) > 0n);
    const rows = await readExposuresFor(created.assignment.assignment_id);
    assert.equal(rows.length, 1);
  });

  test('T03 replay returns the same exposure ID/ordinal/timestamp and creates no second row', async () => {
    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'LEARNING',
    });
    const first = await repository.recordAssignmentItemExposure(pool, {
      assignmentId: created.assignment.assignment_id,
    });
    const second = await repository.recordAssignmentItemExposure(pool, {
      assignmentId: created.assignment.assignment_id,
    });
    assert.equal(second.replayed, true);
    assert.equal(second.exposureId, first.exposureId);
    assert.equal(second.exposureOrdinal, first.exposureOrdinal);
    assert.equal(second.exposedAt, first.exposedAt);
    const rows = await readExposuresFor(created.assignment.assignment_id);
    assert.equal(rows.length, 1);
  });

  test('T04 two different assignments obtain distinct increasing ordinals', async () => {
    const enrollment = await newEnrollment();
    const first = await exposeNewAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const second = await exposeNewAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_B] });
    // Lossless ordering: exposureOrdinal is an exact decimal-string BIGINT
    // authority; only BigInt conversion (never Number) may compare order.
    assert.ok(BigInt(second.exposure.exposureOrdinal) > BigInt(first.exposure.exposureOrdinal));
  });

  test('T05 cross-enrollment ordinal interleaving cannot affect lineage', async () => {
    const otherEnrollment = await newEnrollment();
    await exposeNewAssignment(otherEnrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });

    const enrollment = await newEnrollment();
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    // Exact-string zero (D1): "0" is the canonical zero representation, not
    // a JS Number comparison.
    assert.equal(snapshot.exposure_history_cutoff_ordinal, '0');
    assert.equal(snapshot.resolved_item_lineage, null);
  });

  test('T06 assignment cutoff is the max prior same-enrollment exposure ordinal', async () => {
    const enrollment = await newEnrollment();
    const first = await exposeNewAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const second = await exposeNewAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_B] });
    // Lossless ordering: exposureOrdinal is an exact decimal-string BIGINT
    // authority; only BigInt conversion (never Number) may compare order.
    assert.ok(BigInt(second.exposure.exposureOrdinal) > BigInt(first.exposure.exposureOrdinal));

    const third = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_C],
    });
    const snapshot = await readSnapshot(third.assignment.assignment_id);
    // Exact-string equality (D1): both sides are already exact decimal-string
    // BIGINT authority, so no lossy Number conversion is needed or allowed.
    assert.equal(snapshot.exposure_history_cutoff_ordinal, second.exposure.exposureOrdinal);
  });

  test('T07 no prior exposure gives cutoff 0', async () => {
    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id);
    const snapshot = await readSnapshot(created.assignment.assignment_id);
    // Exact-string zero (D1): "0" is the canonical zero representation, not
    // a JS Number comparison.
    assert.equal(snapshot.exposure_history_cutoff_ordinal, '0');
  });

  test('T08 non-ASSESSMENT lineage is always null', async () => {
    const enrollment = await newEnrollment();
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const learning = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'LEARNING',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const review = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'REVIEW',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    assert.equal((await readSnapshot(learning.assignment.assignment_id)).resolved_item_lineage, null);
    assert.equal((await readSnapshot(review.assignment.assignment_id)).resolved_item_lineage, null);
  });

  test('T09 ASSESSMENT with no target-relevant prior exposure resolves to null', async () => {
    const enrollment = await newEnrollment();
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_D],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    // Exact-string positivity (D1): given the canonical grammar, "not zero"
    // is equivalent to "positive" without needing Number/BigInt at all.
    assert.notEqual(snapshot.exposure_history_cutoff_ordinal, '0');
    assert.equal(snapshot.resolved_item_lineage, null);
  });

  test('T10 exact same item and version yields EXACT_REPEAT', async () => {
    const enrollment = await newEnrollment();
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshot.resolved_item_lineage, 'EXACT_REPEAT');
  });

  test('T11 EXACT_REPEAT priority beats SAME_ITEM_FAMILY', async () => {
    const enrollment = await newEnrollment();
    // Same-family-only prior exposure.
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_Y,
      itemFamilyId: FAMILY_MAIN,
    });
    // Exact-item prior exposure, also target-relevant.
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshot.resolved_item_lineage, 'EXACT_REPEAT');
  });

  test('T12 different item, same family yields SAME_ITEM_FAMILY', async () => {
    const enrollment = await newEnrollment();
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_Y,
      itemFamilyId: FAMILY_MAIN,
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_W,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshot.resolved_item_lineage, 'SAME_ITEM_FAMILY');
  });

  test('T13 different family with a target-relevant prior exposure yields DIFFERENT_ITEM_FAMILY', async () => {
    const enrollment = await newEnrollment();
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_Z,
      itemFamilyId: FAMILY_OTHER,
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_W,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshot.resolved_item_lineage, 'DIFFERENT_ITEM_FAMILY');
  });

  test('T14 no prior exposure at all does not become DIFFERENT_ITEM_FAMILY', async () => {
    const enrollment = await newEnrollment();
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_W,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    // Exact-string zero (D1): "0" is the canonical zero representation, not
    // a JS Number comparison.
    assert.equal(snapshot.exposure_history_cutoff_ordinal, '0');
    assert.equal(snapshot.resolved_item_lineage, null);
  });

  test('T15 target-node non-overlap is not target-relevant', async () => {
    const enrollment = await newEnrollment();
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_B, NODE_C],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_D],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshot.resolved_item_lineage, null);
  });

  test('T16 overlap on at least one of several nodes is target-relevant', async () => {
    const enrollment = await newEnrollment();
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_B, NODE_C],
      itemId: ITEM_Y,
      itemFamilyId: FAMILY_MAIN,
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A, NODE_C],
      itemId: ITEM_W,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshot.resolved_item_lineage, 'SAME_ITEM_FAMILY');
  });

  test('T17 other-enrollment exposure with matching item/family/target node cannot affect current enrollment lineage', async () => {
    const otherEnrollment = await newEnrollment();
    await exposeNewAssignment(otherEnrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });

    const enrollment = await newEnrollment();
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    // Exact-string zero (D1): "0" is the canonical zero representation, not
    // a JS Number comparison.
    assert.equal(snapshot.exposure_history_cutoff_ordinal, '0');
    assert.equal(snapshot.resolved_item_lineage, null);
  });

  test('T18 a later exposure does not modify an earlier assignment\'s stored cutoff', async () => {
    const enrollment = await newEnrollment();
    const assignment1 = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
    });
    const snapshotBefore = await readSnapshot(assignment1.assignment.assignment_id);
    assert.equal(snapshotBefore.exposure_history_cutoff_ordinal, '0');

    await exposeNewAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });

    const snapshotAfter = await readSnapshot(assignment1.assignment.assignment_id);
    assert.equal(snapshotAfter.exposure_history_cutoff_ordinal, '0');
  });

  test('T19 a later exposure does not modify an earlier assignment\'s stored lineage', async () => {
    const enrollment = await newEnrollment();
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshotBefore = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshotBefore.resolved_item_lineage, null);

    // A later exposure of a matching item on the same node.
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });

    const snapshotAfter = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshotAfter.resolved_item_lineage, null);
  });

  test('T20 caller cannot override exposure identity/ordinal/timestamp/reference authority', async () => {
    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'LEARNING',
    });
    const overrides = [
      { exposureId: '00000000-0000-4000-8000-000000000099' },
      { enrollmentId: '00000000-0000-4000-8000-000000000099' },
      { exposureOrdinal: 999999 },
      { exposedAt: '2020-01-01T00:00:00.000Z' },
      { itemId: 'HACKED_ITEM' },
      { itemVersion: 99 },
      { itemFamilyId: 'HACKED_FAMILY' },
      { scenarioId: 'HACKED_SCENARIO' },
      { targetNodeIds: [NODE_A] },
    ];
    for (const override of overrides) {
      await rejectsWithCode(
        () => repository.recordAssignmentItemExposure(pool, {
          assignmentId: created.assignment.assignment_id,
          ...override,
        }),
        'CONTRACT_VIOLATION'
      );
    }
    const rows = await readExposuresFor(created.assignment.assignment_id);
    assert.deepEqual(rows, []);
  });

  test('T21 exposure writer writes no Progress field', async () => {
    const { rows: userRows } = await pool.query(
      `INSERT INTO users (auth_provider, auth_identifier, timezone)
       VALUES ('GUEST', 'vi-lineage-runtime-fixture-t21', 'UTC')
       RETURNING user_id`
    );
    await pool.query(
      `INSERT INTO progress (user_id, node_id, next_review_at)
       VALUES ($1, $2, '2030-01-02T03:04:05.000Z'::timestamptz)`,
      [userRows[0].user_id, NODE_A]
    );
    const before = await pool.query(
      'SELECT row_to_json(p)::text AS row_text FROM progress p ORDER BY user_id, node_id'
    );

    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'LEARNING',
    });
    await repository.recordAssignmentItemExposure(pool, {
      assignmentId: created.assignment.assignment_id,
    });

    const after = await pool.query(
      'SELECT row_to_json(p)::text AS row_text FROM progress p ORDER BY user_id, node_id'
    );
    assert.deepEqual(after.rows, before.rows);
  });

  test('T22 exposure writer writes no production attempt_records row', async () => {
    const before = await countRows('attempt_records');
    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'LEARNING',
    });
    await repository.recordAssignmentItemExposure(pool, {
      assignmentId: created.assignment.assignment_id,
    });
    assert.equal(await countRows('attempt_records'), before);
  });

  test('T23 snapshot digest changes when lineage/cutoff semantic input differs under otherwise identical content', async () => {
    const enrollmentNoPrior = await newEnrollment();
    const assignmentNoPrior = await createAssignmentFixture(enrollmentNoPrior.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshotNoPrior = await readSnapshot(assignmentNoPrior.assignment.assignment_id);
    assert.equal(snapshotNoPrior.exposure_history_cutoff_ordinal, '0');
    assert.equal(snapshotNoPrior.resolved_item_lineage, null);

    const enrollmentWithPrior = await newEnrollment();
    await exposeNewAssignment(enrollmentWithPrior.enrollment_id, {
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const assignmentWithPrior = await createAssignmentFixture(enrollmentWithPrior.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });
    const snapshotWithPrior = await readSnapshot(assignmentWithPrior.assignment.assignment_id);
    assert.notEqual(snapshotWithPrior.exposure_history_cutoff_ordinal, '0');
    assert.equal(snapshotWithPrior.resolved_item_lineage, 'EXACT_REPEAT');

    assert.notEqual(snapshotWithPrior.snapshot_digest, snapshotNoPrior.snapshot_digest);
  });

  test('T24 concurrent/retry exposure recording produces exactly one authoritative row', async () => {
    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'LEARNING',
    });

    const [resultA, resultB] = await Promise.all([
      repository.recordAssignmentItemExposure(pool, {
        assignmentId: created.assignment.assignment_id,
      }),
      repository.recordAssignmentItemExposure(pool, {
        assignmentId: created.assignment.assignment_id,
      }),
    ]);

    assert.equal(resultA.exposureId, resultB.exposureId);
    assert.equal(resultA.exposureOrdinal, resultB.exposureOrdinal);
    assert.equal(
      [resultA.replayed, resultB.replayed].filter((replayed) => replayed === false).length,
      1,
      'exactly one call must be the authoritative writer'
    );

    const rows = await readExposuresFor(created.assignment.assignment_id);
    assert.equal(rows.length, 1);
  });

  test('T25 same-enrollment assignment creation vs first-exposure ordering is deterministic under real concurrency', async () => {
    const enrollment = await newEnrollment();
    const priorAssignment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'LEARNING',
      targetNodeIds: [NODE_A],
      itemId: ITEM_X,
      itemFamilyId: FAMILY_MAIN,
    });

    const [exposureResult, assessmentResult] = await Promise.all([
      repository.recordAssignmentItemExposure(pool, {
        assignmentId: priorAssignment.assignment.assignment_id,
      }),
      createAssignmentFixture(enrollment.enrollment_id, {
        assignmentType: 'ASSESSMENT',
        targetNodeIds: [NODE_A],
        itemId: ITEM_X,
        itemFamilyId: FAMILY_MAIN,
      }),
    ]);

    const snapshot = await readSnapshot(assessmentResult.assignment.assignment_id);
    // D1: exact decimal-string BIGINT authority throughout -- no Number().
    const cutoff = snapshot.exposure_history_cutoff_ordinal;

    // The owning-enrollment lock fully serializes the two operations, so
    // exactly one of two consistent outcomes must hold -- never a torn or
    // partially-applied state.
    if (cutoff === '0') {
      assert.equal(snapshot.resolved_item_lineage, null);
    } else {
      assert.equal(cutoff, exposureResult.exposureOrdinal);
      assert.equal(snapshot.resolved_item_lineage, 'EXACT_REPEAT');
    }
  });

  // F-R01 correction: T05/T17 both use a CURRENT enrollment with cutoff 0,
  // so a foreign target-overlapping exposure is excluded by the
  // `exposure.exposure_ordinal <= cutoff` predicate alone (every real
  // ordinal is positive) -- those fixtures cannot detect the removal of the
  // same-enrollment predicate on its own. T26 forces a POSITIVE current
  // cutoff via the current enrollment's own, non-target-relevant prior
  // exposure, so a foreign exposure whose ordinal is <= that positive
  // cutoff is the only thing standing between null and EXACT_REPEAT.
  test('T26 cross-enrollment lower-or-equal ordinal cannot defeat no-prior null with positive current cutoff', async () => {
    const NODE_T26_TARGET = 'NODE_LINEAGE_T26_TARGET';
    const NODE_T26_OTHER = 'NODE_LINEAGE_T26_OTHER';
    const ITEM_T26 = 'ITEM_LINEAGE_T26';
    const FAMILY_T26 = 'FAMILY_LINEAGE_T26';

    // Self-contained fixture rows -- new node/item/family IDs so nothing
    // here can collide with or depend on T05/T13/T17 or any other test.
    await pool.query(
      `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
       VALUES
         ($1, 'VI', '[]'::jsonb, 'Lineage T26 Target', 1),
         ($2, 'VI', '[]'::jsonb, 'Lineage T26 Other', 1)`,
      [NODE_T26_TARGET, NODE_T26_OTHER]
    );
    await registerReference('ITEM', ITEM_T26, 1);
    await registerReference('ITEM_FAMILY', FAMILY_T26, 1);

    // Preferred strong fixture: one participant, two separate ACTIVE
    // enrollments. This catches both a fully unscoped history read and a
    // participant-scoped-but-enrollment-unscoped one.
    const participant = await repository.createParticipant(pool, {});
    const foreignEnrollment = await repository.createEnrollment(pool, {
      participantId: participant.participant_id,
      experimentId: EXPERIMENT_ID,
      experimentVersion: 1,
      conditionId: CONDITION_ID,
      conditionVersion: 1,
    });
    const currentEnrollment = await repository.createEnrollment(pool, {
      participantId: participant.participant_id,
      experimentId: EXPERIMENT_ID,
      experimentVersion: 1,
      conditionId: CONDITION_ID,
      conditionVersion: 1,
    });

    // 1-3. FOREIGN enrollment: expose NODE_T26_TARGET with the exact same
    // item/family the current assessment will use below, so this exposure
    // would otherwise be capable of producing EXACT_REPEAT if enrollment
    // scoping were absent.
    const foreignExposure = await exposeNewAssignment(foreignEnrollment.enrollment_id, {
      targetNodeIds: [NODE_T26_TARGET],
      itemId: ITEM_T26,
      itemFamilyId: FAMILY_T26,
    });
    const foreignOrdinal = foreignExposure.exposure.exposureOrdinal;

    // 4-6. CURRENT enrollment: a same-enrollment prior exposure targeting a
    // DIFFERENT node (NODE_T26_OTHER). This establishes a POSITIVE cutoff
    // without being target-relevant to NODE_T26_TARGET.
    const currentPriorExposure = await exposeNewAssignment(currentEnrollment.enrollment_id, {
      targetNodeIds: [NODE_T26_OTHER],
      itemId: ITEM_T26,
      itemFamilyId: FAMILY_T26,
    });
    const currentNonRelevantOrdinal = currentPriorExposure.exposure.exposureOrdinal;

    // Deterministic ordering: the foreign exposure was created/recorded
    // strictly before the current enrollment's own non-relevant exposure.
    // Only relative ordering is asserted -- never a fixed literal ordinal.
    // Lossless comparison: exposureOrdinal is an exact decimal-string BIGINT
    // authority, so plain string "<" (lexicographic) would be wrong across
    // differing digit lengths -- BigInt conversion is used strictly inside
    // this assertion, never as production authority.
    assert.ok(BigInt(foreignOrdinal) < BigInt(currentNonRelevantOrdinal));

    // 7. ASSESSMENT in the CURRENT enrollment targeting NODE_T26_TARGET,
    // using the same item/family as the foreign exposure.
    const assessment = await createAssignmentFixture(currentEnrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_T26_TARGET],
      itemId: ITEM_T26,
      itemFamilyId: FAMILY_T26,
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    // D1: exact decimal-string BIGINT authority throughout -- no Number().
    const cutoff = snapshot.exposure_history_cutoff_ordinal;

    // 8. Cutoff is the max prior SAME-enrollment exposure ordinal, and it
    // is POSITIVE.
    assert.equal(cutoff, currentNonRelevantOrdinal);
    assert.notEqual(cutoff, '0');

    // 9. The foreign exposure's global ordinal is <= the current positive
    // cutoff -- it is not excluded by an ordinal/cutoff argument alone.
    // Lossless comparison: BigInt conversion strictly inside the assertion.
    assert.ok(BigInt(foreignOrdinal) <= BigInt(cutoff));

    // 10. Direct proof: the CURRENT enrollment has no cutoff-bounded,
    // target-relevant prior exposure for NODE_T26_TARGET. Its only
    // same-enrollment prior exposure targets NODE_T26_OTHER, which does not
    // overlap NODE_T26_TARGET.
    const { rows: relevantRows } = await pool.query(
      `SELECT exposure.exposure_id
         FROM evidence_assignment_item_exposures exposure
         JOIN evidence_assignments prior_assignment
           ON prior_assignment.assignment_id = exposure.assignment_id
         JOIN evidence_assignment_snapshot_nodes prior_node
           ON prior_node.assignment_id = exposure.assignment_id
        WHERE prior_assignment.enrollment_id = $1
          AND exposure.exposure_ordinal <= $2
          AND prior_node.node_id = $3`,
      [currentEnrollment.enrollment_id, cutoff, NODE_T26_TARGET]
    );
    assert.deepEqual(relevantRows, []);

    // 11-12. resolved_item_lineage remains null -- not any of the four
    // lineage vocabulary values -- even though another enrollment (of the
    // SAME participant) has a target-overlapping, ordinal<=cutoff,
    // lineage-capable exposure.
    assert.equal(snapshot.resolved_item_lineage, null);
    assert.notEqual(snapshot.resolved_item_lineage, 'EXACT_REPEAT');
    assert.notEqual(snapshot.resolved_item_lineage, 'SURFACE_VARIANT');
    assert.notEqual(snapshot.resolved_item_lineage, 'SAME_ITEM_FAMILY');
    assert.notEqual(snapshot.resolved_item_lineage, 'DIFFERENT_ITEM_FAMILY');
  });

  // T27 -- BIGINT writer source-authority correction (D1-D5) unsafe-range
  // regression. evidence_assignment_item_exposure_ordinal_seq is the single
  // shared, global sequence backing exposure_ordinal (013_add_vi_p1_item_
  // lineage.sql), so setval(...) drives it to the boundary adjacent to
  // Number.MAX_SAFE_INTEGER (9007199254740991) without inserting ~9
  // quadrillion real rows into the disposable database. 9007199254740992
  // (2**53) is still exactly representable as a JS double; its neighbor
  // 9007199254740993 (2**53 + 1) is NOT and collapses to 9007199254740992
  // under Number(...) -- the two are used here as the adjacent unsafe-range
  // pair.
  test('T27 exposureOrdinal and exposure_history_cutoff_ordinal survive the unsafe BIGINT range (> Number.MAX_SAFE_INTEGER) exactly, including the lineage comparison bind', async () => {
    const NODE_T27_A = 'NODE_LINEAGE_T27_A';
    const NODE_T27_B = 'NODE_LINEAGE_T27_B';
    const ITEM_T27 = 'ITEM_LINEAGE_T27';
    const FAMILY_T27 = 'FAMILY_LINEAGE_T27';

    await pool.query(
      `INSERT INTO grammar_nodes (node_id, language, concept_ids, label, difficulty)
       VALUES
         ($1, 'VI', '[]'::jsonb, 'Lineage T27 A', 1),
         ($2, 'VI', '[]'::jsonb, 'Lineage T27 B', 1)`,
      [NODE_T27_A, NODE_T27_B]
    );
    await registerReference('ITEM', ITEM_T27, 1);
    await registerReference('ITEM_FAMILY', FAMILY_T27, 1);

    const enrollment = await newEnrollment();

    await pool.query(
      "SELECT setval('evidence_assignment_item_exposure_ordinal_seq', 9007199254740991, true)"
    );

    // First exposure: ordinal 9007199254740992, targeting a node the
    // upcoming ASSESSMENT will NOT target, so it is same-enrollment (raises
    // the cutoff) but not target-relevant on its own.
    const first = await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_T27_B],
      itemId: ITEM_T27,
      itemFamilyId: FAMILY_T27,
    });
    assert.equal(typeof first.exposure.exposureOrdinal, 'string');
    assert.equal(first.exposure.exposureOrdinal, '9007199254740992');

    // Second exposure: ordinal 9007199254740993 -- exactly what becomes the
    // enrollment's cutoff -- targeting the node the ASSESSMENT below will
    // target, with the exact same item, so this is the sole target-relevant
    // prior exposure and sits exactly AT the cutoff boundary.
    const second = await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: [NODE_T27_A],
      itemId: ITEM_T27,
      itemFamilyId: FAMILY_T27,
    });
    assert.equal(typeof second.exposure.exposureOrdinal, 'string');
    assert.equal(second.exposure.exposureOrdinal, '9007199254740993');

    // 1: exact values do not collapse through JS Number rounding.
    assert.notEqual(first.exposure.exposureOrdinal, second.exposure.exposureOrdinal);
    assert.equal(Number(first.exposure.exposureOrdinal), Number(second.exposure.exposureOrdinal));
    assert.ok(BigInt(first.exposure.exposureOrdinal) < BigInt(second.exposure.exposureOrdinal));

    // 9: replay returns the identical exact unsafe-range string.
    const replay = await repository.recordAssignmentItemExposure(pool, {
      assignmentId: second.created.assignment.assignment_id,
    });
    assert.equal(replay.replayed, true);
    assert.equal(replay.exposureOrdinal, second.exposure.exposureOrdinal);

    // ASSESSMENT targeting NODE_T27_A/ITEM_T27/FAMILY_T27: its cutoff is the
    // max prior same-enrollment ordinal (9007199254740993, the second
    // exposure's own ordinal). If the cutoff comparison bind used a
    // Number-rounded value (9007199254740992), the exact "<=" check would
    // wrongly EXCLUDE the second exposure (its true ordinal, 9007199254740993,
    // would no longer be <= a rounded-down cutoff), collapsing this from
    // EXACT_REPEAT to null -- so this assertion fails under the historical
    // defect and passes only with exact-string authority preserved through
    // the comparison bind.
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_T27_A],
      itemId: ITEM_T27,
      itemFamilyId: FAMILY_T27,
    });

    // 5: caller-visible snapshot cutoff is an exact string.
    assert.equal(typeof assessment.snapshot.exposure_history_cutoff_ordinal, 'string');
    assert.equal(assessment.snapshot.exposure_history_cutoff_ordinal, '9007199254740993');
    // 3: the lineage comparison bind used the exact authority (see comment
    // above) -- EXACT_REPEAT, not null, proves the boundary-exact prior
    // exposure was not excluded by a rounded bind value.
    assert.equal(assessment.snapshot.resolved_item_lineage, 'EXACT_REPEAT');
    // 7: snapshot normalization version is the scoped assignment-snapshot
    // version.
    assert.equal(assessment.snapshot.normalization_version, 'evidence-assignment-snapshot-v2');

    // 2/4: independent read-back proves the persisted BIGINT is exact (not
    // merely the same in-process object returned from the INSERT).
    const persisted = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(persisted.exposure_history_cutoff_ordinal, '9007199254740993');
    assert.equal(persisted.resolved_item_lineage, 'EXACT_REPEAT');

    // 6: digest semantic value is exact -- an assessment built against a
    // DIFFERENT (Number-collapsed-equivalent but textually distinct) cutoff
    // must not share this digest. This reuses the T23-style differencing
    // proof at the unsafe boundary itself.
    const otherEnrollment = await newEnrollment();
    // No prior exposure in this enrollment: cutoff is exactly "0", and with
    // no target-relevant history the lineage is null -- deliberately
    // different snapshot semantic content from the unsafe-range assessment
    // above, confirming the digest is sensitive to the exact cutoff/lineage
    // pair rather than constant.
    const otherAssessment = await createAssignmentFixture(otherEnrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_T27_A],
      itemId: ITEM_T27,
      itemFamilyId: FAMILY_T27,
    });
    assert.equal(otherAssessment.snapshot.exposure_history_cutoff_ordinal, '0');
    assert.notEqual(otherAssessment.snapshot.snapshot_digest, assessment.snapshot.snapshot_digest);
  });

  // ------------------------------------------------------------------
  // T28-T44 -- ITEM lineage-authority writer correction.
  //
  // The writer's `exposure_history_cutoff_ordinal`/`resolved_item_lineage`
  // resolution must consume the SAME `L(A)` source authority, the same
  // `lineageAuthority` validity rules, the same direct `SV` relation and the
  // same canonical priority as the METRIC_RESULT Unseen Transfer reader
  // (API_CONTRACT.md §13.10.4/§13.10.11.3, EVIDENCE_FOUNDATION_P0_SCHEMA.md
  // §5.5). Each test below owns self-contained node/item/family fixture IDs so
  // nothing here can collide with or depend on T01-T27.
  // ------------------------------------------------------------------

  test('T28 distinct ITEM pairs sharing one non-null canonicalStimulusId resolve to EXACT_REPEAT', async () => {
    await insertGrammarNode('NODE_LINEAGE_T28', 'Lineage T28');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T28_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T28_OTHER', 1);
    // Deliberately DIFFERENT families: without canonical-stimulus equality
    // this pair would resolve to DIFFERENT_ITEM_FAMILY, so EXACT_REPEAT here
    // can only come from the shared non-null canonicalStimulusId.
    await registerItemWithLineage(
      'ITEM_LINEAGE_T28_PRIOR',
      lineageAuthority({ canonicalStimulusId: 'CANON-T28' })
    );
    await registerItemWithLineage(
      'ITEM_LINEAGE_T28_CURRENT',
      lineageAuthority({ canonicalStimulusId: 'CANON-T28' })
    );

    const lineage = await lineageAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T28',
      priorItemId: 'ITEM_LINEAGE_T28_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T28_OTHER',
      currentItemId: 'ITEM_LINEAGE_T28_CURRENT',
      currentFamilyId: 'FAMILY_LINEAGE_T28_MAIN',
    });
    assert.equal(lineage, 'EXACT_REPEAT');
  });

  test('T29 null canonicalStimulusId never establishes EXACT_REPEAT equality', async () => {
    await insertGrammarNode('NODE_LINEAGE_T29', 'Lineage T29');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T29_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T29_OTHER', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T29_NULL_PRIOR',
      lineageAuthority({ canonicalStimulusId: null })
    );
    await registerItemWithLineage(
      'ITEM_LINEAGE_T29_NULL_CURRENT',
      lineageAuthority({ canonicalStimulusId: null })
    );
    await registerItemWithLineage(
      'ITEM_LINEAGE_T29_NAMED_CURRENT',
      lineageAuthority({ canonicalStimulusId: 'CANON-T29' })
    );

    // null vs null: two nulls are not equal to each other.
    assert.equal(
      await lineageAfterPriorExposure({
        nodeId: 'NODE_LINEAGE_T29',
        priorItemId: 'ITEM_LINEAGE_T29_NULL_PRIOR',
        priorFamilyId: 'FAMILY_LINEAGE_T29_OTHER',
        currentItemId: 'ITEM_LINEAGE_T29_NULL_CURRENT',
        currentFamilyId: 'FAMILY_LINEAGE_T29_MAIN',
      }),
      'DIFFERENT_ITEM_FAMILY'
    );

    // null on one side only: still no equality.
    assert.equal(
      await lineageAfterPriorExposure({
        nodeId: 'NODE_LINEAGE_T29',
        priorItemId: 'ITEM_LINEAGE_T29_NULL_PRIOR',
        priorFamilyId: 'FAMILY_LINEAGE_T29_OTHER',
        currentItemId: 'ITEM_LINEAGE_T29_NAMED_CURRENT',
        currentFamilyId: 'FAMILY_LINEAGE_T29_MAIN',
      }),
      'DIFFERENT_ITEM_FAMILY'
    );
  });

  test('T30 canonicalStimulusId comparison is exact code-unit equality (no trim, no case fold)', async () => {
    await insertGrammarNode('NODE_LINEAGE_T30', 'Lineage T30');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T30_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T30_OTHER', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T30_LOWER',
      lineageAuthority({ canonicalStimulusId: 'canon-t30' })
    );
    await registerItemWithLineage(
      'ITEM_LINEAGE_T30_UPPER',
      lineageAuthority({ canonicalStimulusId: 'CANON-T30' })
    );
    await registerItemWithLineage(
      'ITEM_LINEAGE_T30_PADDED',
      lineageAuthority({ canonicalStimulusId: ' CANON-T30 ' })
    );

    // Case-folding would wrongly make these equal.
    assert.equal(
      await lineageAfterPriorExposure({
        nodeId: 'NODE_LINEAGE_T30',
        priorItemId: 'ITEM_LINEAGE_T30_LOWER',
        priorFamilyId: 'FAMILY_LINEAGE_T30_OTHER',
        currentItemId: 'ITEM_LINEAGE_T30_UPPER',
        currentFamilyId: 'FAMILY_LINEAGE_T30_MAIN',
      }),
      'DIFFERENT_ITEM_FAMILY'
    );

    // Trimming would wrongly make these equal.
    assert.equal(
      await lineageAfterPriorExposure({
        nodeId: 'NODE_LINEAGE_T30',
        priorItemId: 'ITEM_LINEAGE_T30_PADDED',
        priorFamilyId: 'FAMILY_LINEAGE_T30_OTHER',
        currentItemId: 'ITEM_LINEAGE_T30_UPPER',
        currentFamilyId: 'FAMILY_LINEAGE_T30_MAIN',
      }),
      'DIFFERENT_ITEM_FAMILY'
    );
  });

  test('T31 current -> prior direct surface reference yields SURFACE_VARIANT without reciprocal storage', async () => {
    await insertGrammarNode('NODE_LINEAGE_T31', 'Lineage T31');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T31_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T31_OTHER', 1);
    // The PRIOR item declares no lineageAuthority at all -- absence is valid
    // and the reverse edge is deliberately not stored.
    await registerReference('ITEM', 'ITEM_LINEAGE_T31_PRIOR', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T31_CURRENT',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T31_PRIOR', itemVersion: 1 }],
      })
    );

    const lineage = await lineageAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T31',
      priorItemId: 'ITEM_LINEAGE_T31_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T31_OTHER',
      currentItemId: 'ITEM_LINEAGE_T31_CURRENT',
      currentFamilyId: 'FAMILY_LINEAGE_T31_MAIN',
    });
    assert.equal(lineage, 'SURFACE_VARIANT');
  });

  test('T32 prior -> current direct surface reference yields SURFACE_VARIANT without reciprocal storage', async () => {
    await insertGrammarNode('NODE_LINEAGE_T32', 'Lineage T32');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T32_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T32_OTHER', 1);
    // Mirror image of T31: only the PRIOR item stores the edge, and the
    // CURRENT item declares no lineageAuthority at all.
    await registerReference('ITEM', 'ITEM_LINEAGE_T32_CURRENT', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T32_PRIOR',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T32_CURRENT', itemVersion: 1 }],
      })
    );

    const lineage = await lineageAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T32',
      priorItemId: 'ITEM_LINEAGE_T32_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T32_OTHER',
      currentItemId: 'ITEM_LINEAGE_T32_CURRENT',
      currentFamilyId: 'FAMILY_LINEAGE_T32_MAIN',
    });
    assert.equal(lineage, 'SURFACE_VARIANT');
  });

  test('T33 surface-variant relation is direct only -- no transitive closure', async () => {
    await insertGrammarNode('NODE_LINEAGE_T33', 'Lineage T33');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T33_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T33_OTHER', 1);
    // CURRENT -> MIDDLE -> PRIOR, with no direct CURRENT/PRIOR edge in either
    // direction. MIDDLE exists (so nothing dangles) but is never exposed, so
    // it is outside L(A).
    await registerReference('ITEM', 'ITEM_LINEAGE_T33_PRIOR', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T33_MIDDLE',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T33_PRIOR', itemVersion: 1 }],
      })
    );
    await registerItemWithLineage(
      'ITEM_LINEAGE_T33_CURRENT',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T33_MIDDLE', itemVersion: 1 }],
      })
    );

    const lineage = await lineageAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T33',
      priorItemId: 'ITEM_LINEAGE_T33_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T33_OTHER',
      currentItemId: 'ITEM_LINEAGE_T33_CURRENT',
      currentFamilyId: 'FAMILY_LINEAGE_T33_MAIN',
    });
    assert.equal(lineage, 'DIFFERENT_ITEM_FAMILY');
    assert.notEqual(lineage, 'SURFACE_VARIANT');
  });

  test('T34 canonical priority: EXACT_REPEAT beats SURFACE_VARIANT', async () => {
    await insertGrammarNode('NODE_LINEAGE_T34', 'Lineage T34');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T34_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T34_OTHER', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T34_VARIANT', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T34_CURRENT',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T34_VARIANT', itemVersion: 1 }],
      })
    );

    const enrollment = await newEnrollment();
    // A declared surface variant AND the exact same ITEM pair are both
    // target-relevant prior exposures; the stronger relation must win.
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: ['NODE_LINEAGE_T34'],
      itemId: 'ITEM_LINEAGE_T34_VARIANT',
      itemFamilyId: 'FAMILY_LINEAGE_T34_OTHER',
    });
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: ['NODE_LINEAGE_T34'],
      itemId: 'ITEM_LINEAGE_T34_CURRENT',
      itemFamilyId: 'FAMILY_LINEAGE_T34_MAIN',
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: ['NODE_LINEAGE_T34'],
      itemId: 'ITEM_LINEAGE_T34_CURRENT',
      itemFamilyId: 'FAMILY_LINEAGE_T34_MAIN',
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshot.resolved_item_lineage, 'EXACT_REPEAT');
  });

  test('T35 canonical priority: SURFACE_VARIANT beats SAME_ITEM_FAMILY', async () => {
    await insertGrammarNode('NODE_LINEAGE_T35', 'Lineage T35');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T35_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T35_OTHER', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T35_SAME_FAMILY', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T35_VARIANT', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T35_CURRENT',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T35_VARIANT', itemVersion: 1 }],
      })
    );

    const enrollment = await newEnrollment();
    // Same-family-but-unrelated prior exposure.
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: ['NODE_LINEAGE_T35'],
      itemId: 'ITEM_LINEAGE_T35_SAME_FAMILY',
      itemFamilyId: 'FAMILY_LINEAGE_T35_MAIN',
    });
    // Different-family prior exposure that IS a declared direct surface variant.
    await exposeNewAssignment(enrollment.enrollment_id, {
      targetNodeIds: ['NODE_LINEAGE_T35'],
      itemId: 'ITEM_LINEAGE_T35_VARIANT',
      itemFamilyId: 'FAMILY_LINEAGE_T35_OTHER',
    });
    const assessment = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: ['NODE_LINEAGE_T35'],
      itemId: 'ITEM_LINEAGE_T35_CURRENT',
      itemFamilyId: 'FAMILY_LINEAGE_T35_MAIN',
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    assert.equal(snapshot.resolved_item_lineage, 'SURFACE_VARIANT');
  });

  test('T36 SAME_ITEM_FAMILY remains when declared lineage authority establishes no stronger relation', async () => {
    await insertGrammarNode('NODE_LINEAGE_T36', 'Lineage T36');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T36_MAIN', 1);
    await registerItemWithLineage('ITEM_LINEAGE_T36_PRIOR', lineageAuthority());
    await registerItemWithLineage('ITEM_LINEAGE_T36_CURRENT', lineageAuthority());

    const lineage = await lineageAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T36',
      priorItemId: 'ITEM_LINEAGE_T36_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T36_MAIN',
      currentItemId: 'ITEM_LINEAGE_T36_CURRENT',
      currentFamilyId: 'FAMILY_LINEAGE_T36_MAIN',
    });
    assert.equal(lineage, 'SAME_ITEM_FAMILY');
  });

  test('T37 DIFFERENT_ITEM_FAMILY remains when target-relevant history exists but no stronger relation does', async () => {
    await insertGrammarNode('NODE_LINEAGE_T37', 'Lineage T37');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T37_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T37_OTHER', 1);
    await registerItemWithLineage('ITEM_LINEAGE_T37_PRIOR', lineageAuthority());
    await registerItemWithLineage('ITEM_LINEAGE_T37_CURRENT', lineageAuthority());

    const lineage = await lineageAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T37',
      priorItemId: 'ITEM_LINEAGE_T37_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T37_OTHER',
      currentItemId: 'ITEM_LINEAGE_T37_CURRENT',
      currentFamilyId: 'FAMILY_LINEAGE_T37_MAIN',
    });
    assert.equal(lineage, 'DIFFERENT_ITEM_FAMILY');
  });

  test('T38 null remains when no target-relevant history exists, however strong the declared relation is', async () => {
    await insertGrammarNode('NODE_LINEAGE_T38_TARGET', 'Lineage T38 Target');
    await insertGrammarNode('NODE_LINEAGE_T38_OTHER', 'Lineage T38 Other');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T38_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T38_OTHER', 1);
    // Both a shared canonicalStimulusId AND a direct surface-variant edge --
    // neither can create lineage when R(A) is empty.
    await registerItemWithLineage(
      'ITEM_LINEAGE_T38_PRIOR',
      lineageAuthority({ canonicalStimulusId: 'CANON-T38' })
    );
    await registerItemWithLineage(
      'ITEM_LINEAGE_T38_CURRENT',
      lineageAuthority({
        canonicalStimulusId: 'CANON-T38',
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T38_PRIOR', itemVersion: 1 }],
      })
    );

    const assessment = await assessAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T38_TARGET',
      priorNodeIds: ['NODE_LINEAGE_T38_OTHER'],
      priorItemId: 'ITEM_LINEAGE_T38_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T38_OTHER',
      currentItemId: 'ITEM_LINEAGE_T38_CURRENT',
      currentFamilyId: 'FAMILY_LINEAGE_T38_MAIN',
    });
    const snapshot = await readSnapshot(assessment.assignment.assignment_id);
    // The cutoff is positive -- history exists, it is simply not
    // target-relevant -- and lineage stays null rather than becoming
    // DIFFERENT_ITEM_FAMILY.
    assert.notEqual(snapshot.exposure_history_cutoff_ordinal, '0');
    assert.equal(snapshot.resolved_item_lineage, null);
  });

  test('T39 explicit lineageAuthority null is CONTRACT_VIOLATION on either consumed ITEM', async () => {
    await insertGrammarNode('NODE_LINEAGE_T39', 'Lineage T39');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T39_MAIN', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T39_VALID', 1);
    await registerItemWithLineage('ITEM_LINEAGE_T39_NULL_CURRENT', null);
    await registerItemWithLineage('ITEM_LINEAGE_T39_NULL_PRIOR', null);

    // The current assignment's own pinned ITEM.
    await rejectsWithCode(
      () => assessAfterPriorExposure({
        nodeId: 'NODE_LINEAGE_T39',
        priorItemId: 'ITEM_LINEAGE_T39_VALID',
        priorFamilyId: 'FAMILY_LINEAGE_T39_MAIN',
        currentItemId: 'ITEM_LINEAGE_T39_NULL_CURRENT',
        currentFamilyId: 'FAMILY_LINEAGE_T39_MAIN',
      }),
      'CONTRACT_VIOLATION'
    );

    // An R(A) owner's pinned ITEM -- L(A) covers both sides.
    await rejectsWithCode(
      () => assessAfterPriorExposure({
        nodeId: 'NODE_LINEAGE_T39',
        priorItemId: 'ITEM_LINEAGE_T39_NULL_PRIOR',
        priorFamilyId: 'FAMILY_LINEAGE_T39_MAIN',
        currentItemId: 'ITEM_LINEAGE_T39_VALID',
        currentFamilyId: 'FAMILY_LINEAGE_T39_MAIN',
      }),
      'CONTRACT_VIOLATION'
    );
  });

  test('T40 malformed lineageAuthority shape/type/version is CONTRACT_VIOLATION', async () => {
    await insertGrammarNode('NODE_LINEAGE_T40', 'Lineage T40');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T40_MAIN', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T40_PRIOR', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T40_TARGET', 1);

    const malformed = [
      ['unknown extra key', { ...lineageAuthority(), extraKey: 'nope' }],
      ['missing canonicalStimulusId key', {
        definitionType: 'EVIDENCE_ITEM_LINEAGE',
        definitionVersion: 1,
        surfaceVariantReferences: [],
      }],
      ['wrong definitionType', { ...lineageAuthority(), definitionType: 'EVIDENCE_ITEM_OTHER' }],
      ['wrong definitionVersion', { ...lineageAuthority(), definitionVersion: 2 }],
      ['string definitionVersion', { ...lineageAuthority(), definitionVersion: '1' }],
      ['empty canonicalStimulusId', { ...lineageAuthority(), canonicalStimulusId: '' }],
      ['non-string canonicalStimulusId', { ...lineageAuthority(), canonicalStimulusId: 123 }],
      ['non-array surfaceVariantReferences', {
        ...lineageAuthority(),
        surfaceVariantReferences: 'nope',
      }],
      ['array lineageAuthority', []],
      ['scalar lineageAuthority', 'EVIDENCE_ITEM_LINEAGE'],
      ['non-object surfaceVariantReferences entry', lineageAuthority({
        surfaceVariantReferences: ['ITEM_LINEAGE_T40_TARGET'],
      })],
      ['surfaceVariantReferences entry extra key', lineageAuthority({
        surfaceVariantReferences: [
          { itemId: 'ITEM_LINEAGE_T40_TARGET', itemVersion: 1, extraKey: 'nope' },
        ],
      })],
      ['surfaceVariantReferences entry missing itemVersion', lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T40_TARGET' }],
      })],
      ['surfaceVariantReferences entry empty itemId', lineageAuthority({
        surfaceVariantReferences: [{ itemId: '', itemVersion: 1 }],
      })],
      ['surfaceVariantReferences entry zero itemVersion', lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T40_TARGET', itemVersion: 0 }],
      })],
      ['surfaceVariantReferences entry non-integer itemVersion', lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T40_TARGET', itemVersion: 1.5 }],
      })],
      ['surfaceVariantReferences entry out-of-range itemVersion', lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T40_TARGET', itemVersion: 2147483648 }],
      })],
      ['surfaceVariantReferences entry string itemVersion', lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T40_TARGET', itemVersion: '1' }],
      })],
    ];

    for (let index = 0; index < malformed.length; index += 1) {
      const [label, authority] = malformed[index];
      const itemId = `ITEM_LINEAGE_T40_CASE_${index}`;
      await registerItemWithLineage(itemId, authority);
      await assert.rejects(
        () => assessAfterPriorExposure({
          nodeId: 'NODE_LINEAGE_T40',
          priorItemId: 'ITEM_LINEAGE_T40_PRIOR',
          priorFamilyId: 'FAMILY_LINEAGE_T40_MAIN',
          currentItemId: itemId,
          currentFamilyId: 'FAMILY_LINEAGE_T40_MAIN',
        }),
        (error) => {
          assert.equal(error.code, 'CONTRACT_VIOLATION', `${label} must be CONTRACT_VIOLATION`);
          return true;
        },
        label
      );
    }
  });

  test('T41 exact self-reference is CONTRACT_VIOLATION while another version of the same itemId is not', async () => {
    await insertGrammarNode('NODE_LINEAGE_T41', 'Lineage T41');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T41_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T41_OTHER', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T41_PRIOR', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T41_SELF',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T41_SELF', itemVersion: 1 }],
      })
    );

    await rejectsWithCode(
      () => assessAfterPriorExposure({
        nodeId: 'NODE_LINEAGE_T41',
        priorItemId: 'ITEM_LINEAGE_T41_PRIOR',
        priorFamilyId: 'FAMILY_LINEAGE_T41_OTHER',
        currentItemId: 'ITEM_LINEAGE_T41_SELF',
        currentFamilyId: 'FAMILY_LINEAGE_T41_MAIN',
      }),
      'CONTRACT_VIOLATION'
    );

    // Same itemId, DIFFERENT itemVersion: a legal direct reference, not a
    // self-reference. Version 2 exists, so nothing dangles.
    await registerReference('ITEM', 'ITEM_LINEAGE_T41_OTHER_VERSION', 2);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T41_OTHER_VERSION',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T41_OTHER_VERSION', itemVersion: 2 }],
      }),
      1
    );

    const lineage = await lineageAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T41',
      priorItemId: 'ITEM_LINEAGE_T41_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T41_OTHER',
      currentItemId: 'ITEM_LINEAGE_T41_OTHER_VERSION',
      currentFamilyId: 'FAMILY_LINEAGE_T41_MAIN',
    });
    assert.equal(lineage, 'DIFFERENT_ITEM_FAMILY');
  });

  test('T42 duplicate exact surfaceVariantReferences pair is CONTRACT_VIOLATION', async () => {
    await insertGrammarNode('NODE_LINEAGE_T42', 'Lineage T42');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T42_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T42_OTHER', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T42_PRIOR', 1);
    await registerItemWithLineage(
      'ITEM_LINEAGE_T42_CURRENT',
      lineageAuthority({
        surfaceVariantReferences: [
          { itemId: 'ITEM_LINEAGE_T42_PRIOR', itemVersion: 1 },
          { itemId: 'ITEM_LINEAGE_T42_PRIOR', itemVersion: 1 },
        ],
      })
    );

    await rejectsWithCode(
      () => assessAfterPriorExposure({
        nodeId: 'NODE_LINEAGE_T42',
        priorItemId: 'ITEM_LINEAGE_T42_PRIOR',
        priorFamilyId: 'FAMILY_LINEAGE_T42_OTHER',
        currentItemId: 'ITEM_LINEAGE_T42_CURRENT',
        currentFamilyId: 'FAMILY_LINEAGE_T42_MAIN',
      }),
      'CONTRACT_VIOLATION'
    );
  });

  test('T43 dangling surfaceVariantReferences ITEM pair is CONTRACT_VIOLATION', async () => {
    await insertGrammarNode('NODE_LINEAGE_T43', 'Lineage T43');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T43_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T43_OTHER', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T43_PRIOR', 1);
    // Unknown itemId.
    await registerItemWithLineage(
      'ITEM_LINEAGE_T43_UNKNOWN_ID',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T43_NEVER_REGISTERED', itemVersion: 1 }],
      })
    );
    // Known itemId, unpublished itemVersion.
    await registerItemWithLineage(
      'ITEM_LINEAGE_T43_UNKNOWN_VERSION',
      lineageAuthority({
        surfaceVariantReferences: [{ itemId: 'ITEM_LINEAGE_T43_PRIOR', itemVersion: 7 }],
      })
    );

    for (const currentItemId of ['ITEM_LINEAGE_T43_UNKNOWN_ID', 'ITEM_LINEAGE_T43_UNKNOWN_VERSION']) {
      await rejectsWithCode(
        () => assessAfterPriorExposure({
          nodeId: 'NODE_LINEAGE_T43',
          priorItemId: 'ITEM_LINEAGE_T43_PRIOR',
          priorFamilyId: 'FAMILY_LINEAGE_T43_OTHER',
          currentItemId,
          currentFamilyId: 'FAMILY_LINEAGE_T43_MAIN',
        }),
        'CONTRACT_VIOLATION'
      );
    }
  });

  test('T44 ITEM definitions outside L(A) are not validated by this lineage operation', async () => {
    await insertGrammarNode('NODE_LINEAGE_T44', 'Lineage T44');
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T44_MAIN', 1);
    await registerReference('ITEM_FAMILY', 'FAMILY_LINEAGE_T44_OTHER', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T44_PRIOR', 1);
    await registerReference('ITEM', 'ITEM_LINEAGE_T44_CURRENT', 1);
    // Registered, never exposed, never referenced by an L(A) member: this
    // operation must not widen validation to reach it.
    await registerItemWithLineage('ITEM_LINEAGE_T44_UNRELATED_BROKEN', null);

    const lineage = await lineageAfterPriorExposure({
      nodeId: 'NODE_LINEAGE_T44',
      priorItemId: 'ITEM_LINEAGE_T44_PRIOR',
      priorFamilyId: 'FAMILY_LINEAGE_T44_OTHER',
      currentItemId: 'ITEM_LINEAGE_T44_CURRENT',
      currentFamilyId: 'FAMILY_LINEAGE_T44_MAIN',
    });
    assert.equal(lineage, 'DIFFERENT_ITEM_FAMILY');
  });
});
