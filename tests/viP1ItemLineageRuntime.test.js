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
    assert.ok(Number.isInteger(result.exposureOrdinal) && result.exposureOrdinal > 0);
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
    assert.ok(second.exposure.exposureOrdinal > first.exposure.exposureOrdinal);
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
    assert.equal(Number(snapshot.exposure_history_cutoff_ordinal), 0);
    assert.equal(snapshot.resolved_item_lineage, null);
  });

  test('T06 assignment cutoff is the max prior same-enrollment exposure ordinal', async () => {
    const enrollment = await newEnrollment();
    const first = await exposeNewAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });
    const second = await exposeNewAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_B] });
    assert.ok(second.exposure.exposureOrdinal > first.exposure.exposureOrdinal);

    const third = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_C],
    });
    const snapshot = await readSnapshot(third.assignment.assignment_id);
    assert.equal(Number(snapshot.exposure_history_cutoff_ordinal), second.exposure.exposureOrdinal);
  });

  test('T07 no prior exposure gives cutoff 0', async () => {
    const enrollment = await newEnrollment();
    const created = await createAssignmentFixture(enrollment.enrollment_id);
    const snapshot = await readSnapshot(created.assignment.assignment_id);
    assert.equal(Number(snapshot.exposure_history_cutoff_ordinal), 0);
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
    assert.ok(Number(snapshot.exposure_history_cutoff_ordinal) > 0);
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
    assert.equal(Number(snapshot.exposure_history_cutoff_ordinal), 0);
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
    assert.equal(Number(snapshot.exposure_history_cutoff_ordinal), 0);
    assert.equal(snapshot.resolved_item_lineage, null);
  });

  test('T18 a later exposure does not modify an earlier assignment\'s stored cutoff', async () => {
    const enrollment = await newEnrollment();
    const assignment1 = await createAssignmentFixture(enrollment.enrollment_id, {
      assignmentType: 'ASSESSMENT',
      targetNodeIds: [NODE_A],
    });
    const snapshotBefore = await readSnapshot(assignment1.assignment.assignment_id);
    assert.equal(Number(snapshotBefore.exposure_history_cutoff_ordinal), 0);

    await exposeNewAssignment(enrollment.enrollment_id, { targetNodeIds: [NODE_A] });

    const snapshotAfter = await readSnapshot(assignment1.assignment.assignment_id);
    assert.equal(Number(snapshotAfter.exposure_history_cutoff_ordinal), 0);
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
    assert.equal(Number(snapshotNoPrior.exposure_history_cutoff_ordinal), 0);
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
    assert.ok(Number(snapshotWithPrior.exposure_history_cutoff_ordinal) > 0);
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
    const cutoff = Number(snapshot.exposure_history_cutoff_ordinal);

    // The owning-enrollment lock fully serializes the two operations, so
    // exactly one of two consistent outcomes must hold -- never a torn or
    // partially-applied state.
    if (cutoff === 0) {
      assert.equal(snapshot.resolved_item_lineage, null);
    } else {
      assert.equal(cutoff, exposureResult.exposureOrdinal);
      assert.equal(snapshot.resolved_item_lineage, 'EXACT_REPEAT');
    }
  });
});
