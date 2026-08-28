'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db/pool');
const { runMigrations, listMigrationFiles, MIGRATIONS_DIR } = require('../db/migrate');

// Frozen at the VI P1 item-lineage runtime milestone baseline (main
// cb5d5d612d350b3b0bcaef2b5ac8fbdb61eea693): 012_create_evidence_foundation.sql
// must not change while 013 is added.
const MIGRATION_012_EXPECTED_SHA256 =
  '1414c46cc3f3aee202da9931b76ede03914b5663aa1665929a9a27b024ea5f0b';

const ITEM_LINEAGE_VALUES = [
  'EXACT_REPEAT',
  'SURFACE_VARIANT',
  'SAME_ITEM_FAMILY',
  'DIFFERENT_ITEM_FAMILY',
];

const EVIDENCE_TABLES = [
  'evidence_experiments',
  'evidence_experiment_versions',
  'evidence_conditions',
  'evidence_condition_versions',
  'evidence_reference_versions',
  'evidence_participants',
  'evidence_enrollments',
  'evidence_assignments',
  'evidence_assignment_snapshots',
  'evidence_assignment_snapshot_nodes',
  'evidence_assignment_item_exposures',
  'evidence_sessions',
  'evidence_attempt_series',
  'evidence_attempts',
  'evidence_attempt_finalizations',
  'evidence_target_node_evaluations',
  'evidence_correction_aggregates',
];

const REQUIRED_CONSTRAINTS = [
  'evidence_experiment_versions_pk',
  'evidence_experiment_versions_experiment_fk',
  'evidence_experiment_versions_version_positive',
  'evidence_condition_versions_class_check',
  'evidence_reference_versions_kind_check',
  'evidence_enrollments_status_check',
  'evidence_enrollments_terminal_timestamp_check',
  'evidence_assignments_type_check',
  'evidence_assignments_timepoint_check',
  'evidence_assignments_anchor_check',
  'evidence_assignments_outcome_check',
  'evidence_assignments_completion_attempt_fk',
  'evidence_assignment_snapshots_pk',
  'evidence_assignment_snapshots_content_pair_check',
  'evidence_assignment_snapshots_versions_positive',
  'evidence_assignment_snapshots_exposure_cutoff_nonnegative',
  'evidence_assignment_snapshots_item_lineage_check',
  'evidence_assignment_snapshot_nodes_node_fk',
  'evidence_assignment_snapshot_nodes_ordinal_unique',
  'evidence_assignment_item_exposures_pk',
  'evidence_assignment_item_exposures_assignment_fk',
  'evidence_assignment_item_exposures_assignment_unique',
  'evidence_assignment_item_exposures_ordinal_unique',
  'evidence_assignment_item_exposures_ordinal_positive',
  'evidence_sessions_outcome_check',
  'evidence_attempt_series_ownership_unique',
  'evidence_attempts_assignment_idempotency_unique',
  'evidence_attempts_series_ordinal_unique',
  'evidence_attempts_retry_parent_consistency',
  'evidence_attempt_finalizations_pk',
  'evidence_attempt_finalizations_response_representation',
  'evidence_attempt_finalizations_timing_nonnegative',
  'evidence_target_node_evaluations_attempt_node_unique',
  'evidence_target_node_evaluations_finalization_fk',
  'evidence_correction_aggregates_pk',
  'evidence_correction_aggregates_count_nonnegative',
];

const REQUIRED_INDEXES = [
  'idx_evidence_experiment_versions_published',
  'idx_evidence_condition_versions_published',
  'idx_evidence_reference_versions_published',
  'idx_evidence_enrollments_participant_created',
  'idx_evidence_enrollments_cohort',
  'idx_evidence_assignments_enrollment_lifecycle',
  'idx_evidence_assignments_active_review_due',
  'idx_evidence_sessions_enrollment_started',
  'idx_evidence_attempts_assignment_started',
  'idx_evidence_attempts_session_started',
  'idx_evidence_attempt_finalizations_finalized',
  'idx_evidence_evaluations_node_attempt',
  'idx_evidence_corrections_dimensions',
];

let baselineCatalog;
let migrationResult;

async function resetPublicSchema() {
  await pool.query('DROP SCHEMA public CASCADE');
  await pool.query('CREATE SCHEMA public');
}

async function applyBaselineMigrationsOnly() {
  await pool.query(`
    CREATE TABLE schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = listMigrationFiles().filter(
    (filename) => !filename.startsWith('012_') && !filename.startsWith('013_')
  );
  assert.equal(files.length, 11, 'baseline fixture must apply exactly migrations 001 through 011');

  for (const filename of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

async function readProductionCatalog() {
  const { rows: columns } = await pool.query(
    `SELECT table_name, ordinal_position, column_name, data_type, udt_name,
            is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('progress', 'attempt_records')
      ORDER BY table_name, ordinal_position`
  );
  const { rows: constraints } = await pool.query(
    `SELECT c.conname, rel.relname AS table_name, c.contype,
            pg_get_constraintdef(c.oid, true) AS definition
       FROM pg_constraint c
       JOIN pg_class rel ON rel.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = rel.relnamespace
      WHERE n.nspname = 'public'
        AND rel.relname IN ('progress', 'attempt_records')
      ORDER BY rel.relname, c.conname`
  );
  const { rows: indexes } = await pool.query(
    `SELECT tablename, indexname, indexdef
       FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('progress', 'attempt_records')
      ORDER BY tablename, indexname`
  );
  const { rows: triggers } = await pool.query(
    `SELECT rel.relname AS table_name, trg.tgname,
            pg_get_triggerdef(trg.oid, true) AS definition
       FROM pg_trigger trg
       JOIN pg_class rel ON rel.oid = trg.tgrelid
       JOIN pg_namespace n ON n.oid = rel.relnamespace
      WHERE n.nspname = 'public'
        AND rel.relname IN ('progress', 'attempt_records')
        AND NOT trg.tgisinternal
      ORDER BY rel.relname, trg.tgname`
  );
  const { rows: enums } = await pool.query(
    `SELECT typ.typname, enum.enumsortorder, enum.enumlabel
       FROM pg_type typ
       JOIN pg_enum enum ON enum.enumtypid = typ.oid
       JOIN pg_namespace n ON n.oid = typ.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY typ.typname, enum.enumsortorder`
  );
  return { columns, constraints, indexes, triggers, enums };
}

async function readNextReviewShape() {
  const { rows } = await pool.query(
    `SELECT data_type, udt_name, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'progress'
        AND column_name = 'next_review_at'`
  );
  assert.equal(rows.length, 1);
  return rows[0];
}

describe('Evidence Foundation P0 migration', { concurrency: false }, () => {
  before(async () => {
    await resetPublicSchema();
    await applyBaselineMigrationsOnly();
    baselineCatalog = await readProductionCatalog();
    baselineCatalog.nextReviewAt = await readNextReviewShape();
    migrationResult = await runMigrations();
  });

  after(async () => {
    await pool.end();
  });

  test('migration list contains the exact 001 through 013 sequence', () => {
    assert.deepEqual(listMigrationFiles(), [
      '001_create_users.sql',
      '002_create_concepts.sql',
      '003_create_grammar_nodes.sql',
      '004_create_grammar_relations.sql',
      '005_create_content.sql',
      '006_create_progress.sql',
      '007_create_attempt_records.sql',
      '008_create_vocabulary.sql',
      '009_create_cascade_jobs.sql',
      '010_create_indexes.sql',
      '011_add_aud002_spaced_review.sql',
      '012_create_evidence_foundation.sql',
      '013_add_vi_p1_item_lineage.sql',
    ]);
  });

  test('012 is byte-identical to the VI P1 item-lineage runtime baseline', () => {
    const sha256 = createHash('sha256')
      .update(fs.readFileSync(path.join(MIGRATIONS_DIR, '012_create_evidence_foundation.sql')))
      .digest('hex');
    assert.equal(sha256, MIGRATION_012_EXPECTED_SHA256, 'migration 012 must remain unchanged');
  });

  test('012 and 013 apply atomically after baseline migrations and ledger count is 13', async () => {
    assert.deepEqual(migrationResult.applied, [
      '012_create_evidence_foundation.sql',
      '013_add_vi_p1_item_lineage.sql',
    ]);
    assert.equal(migrationResult.skipped.length, 11);
    const { rows } = await pool.query('SELECT filename FROM schema_migrations ORDER BY filename');
    assert.equal(rows.length, 13);
    assert.equal(rows.at(-1).filename, '013_add_vi_p1_item_lineage.sql');
  });

  test('rerunning the migration runner skips 001 through 013 without error (idempotency contract)', async () => {
    const rerun = await runMigrations();
    assert.deepEqual(rerun.applied, []);
    assert.deepEqual(rerun.skipped, listMigrationFiles());
    const { rows } = await pool.query('SELECT filename FROM schema_migrations ORDER BY filename');
    assert.equal(rows.length, 13);
  });

  test('all 17 evidence tables exist', async () => {
    const { rows } = await pool.query(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name LIKE 'evidence\\_%' ESCAPE '\\'
        ORDER BY table_name`
    );
    assert.deepEqual(rows.map((row) => row.table_name), [...EVIDENCE_TABLES].sort());
  });

  test('Pattern D preserves scalar snapshot references without semantic DB structures', async () => {
    const { rows: snapshotColumns } = await pool.query(
      `SELECT column_name
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'evidence_assignment_snapshots'
        ORDER BY ordinal_position`
    );
    const columns = new Set(snapshotColumns.map((row) => row.column_name));
    for (const forbidden of [
      'item_kind',
      'scenario_kind',
      'item_family_kind',
      'lexical_manifest_kind',
      'rubric_kind',
      'formula_kind',
      'scheduler_protocol_kind',
      'instrumentation_protocol_kind',
    ]) {
      assert.equal(columns.has(forbidden), false, `unexpected discriminator column: ${forbidden}`);
    }

    const { rows: referenceFks } = await pool.query(
      `SELECT c.conname
         FROM pg_constraint c
         JOIN pg_class source ON source.oid = c.conrelid
         JOIN pg_class target ON target.oid = c.confrelid
         JOIN pg_namespace n ON n.oid = source.relnamespace
        WHERE n.nspname = 'public'
          AND source.relname = 'evidence_assignment_snapshots'
          AND target.relname = 'evidence_reference_versions'
          AND c.contype = 'f'`
    );
    assert.deepEqual(referenceFks, []);

    const { rows: attemptEnrollmentColumns } = await pool.query(
      `SELECT column_name
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'evidence_attempts'
          AND column_name = 'enrollment_id'`
    );
    assert.deepEqual(attemptEnrollmentColumns, []);

    const { rows: typedAuthorityTables } = await pool.query(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name LIKE 'evidence\\_%\\_versions' ESCAPE '\\'
          AND table_name NOT IN (
            'evidence_experiment_versions',
            'evidence_condition_versions',
            'evidence_reference_versions'
          )`
    );
    assert.deepEqual(typedAuthorityTables, []);

    const { rows: evidenceTriggers } = await pool.query(
      `SELECT rel.relname AS table_name, trg.tgname
         FROM pg_trigger trg
         JOIN pg_class rel ON rel.oid = trg.tgrelid
         JOIN pg_namespace n ON n.oid = rel.relnamespace
        WHERE n.nspname = 'public'
          AND rel.relname LIKE 'evidence\\_%' ESCAPE '\\'
          AND NOT trg.tgisinternal`
    );
    assert.deepEqual(evidenceTriggers, []);
  });

  test('required PK, FK, unique, and CHECK constraints exist', async () => {
    const { rows } = await pool.query(
      `SELECT c.conname
         FROM pg_constraint c
         JOIN pg_class rel ON rel.oid = c.conrelid
         JOIN pg_namespace n ON n.oid = rel.relnamespace
        WHERE n.nspname = 'public'
          AND rel.relname LIKE 'evidence\\_%' ESCAPE '\\'`
    );
    const names = new Set(rows.map((row) => row.conname));
    for (const constraint of REQUIRED_CONSTRAINTS) {
      assert.ok(names.has(constraint), `missing constraint: ${constraint}`);
    }
  });

  test('required evidence indexes exist without adding a production index', async () => {
    const { rows } = await pool.query(
      `SELECT tablename, indexname
         FROM pg_indexes
        WHERE schemaname = 'public'`
    );
    const evidenceIndexes = new Set(
      rows.filter((row) => row.tablename.startsWith('evidence_')).map((row) => row.indexname)
    );
    for (const index of REQUIRED_INDEXES) {
      assert.ok(evidenceIndexes.has(index), `missing index: ${index}`);
    }

    const currentCatalog = await readProductionCatalog();
    assert.deepEqual(currentCatalog.indexes, baselineCatalog.indexes);
  });

  test('invalid reference kind is rejected by its named CHECK constraint', async () => {
    await assert.rejects(
      () => pool.query(
        `INSERT INTO evidence_reference_versions (
           reference_kind, reference_id, version, definition, definition_digest,
           digest_algorithm, normalization_version
         ) VALUES ('NOT_A_KIND', 'REF_INVALID', 1, '{}'::jsonb, 'd', 'sha256', 'v1')`
      ),
      /evidence_reference_versions_kind_check/
    );
  });

  test('nonpositive version is rejected by a named CHECK constraint', async () => {
    await pool.query(
      `INSERT INTO evidence_experiments (experiment_id)
       VALUES ('EXP_MIGRATION_VERSION')`
    );
    await assert.rejects(
      () => pool.query(
        `INSERT INTO evidence_experiment_versions (
           experiment_id, version, definition, definition_digest,
           digest_algorithm, normalization_version
         ) VALUES ('EXP_MIGRATION_VERSION', 0, '{}'::jsonb, 'd', 'sha256', 'v1')`
      ),
      /evidence_experiment_versions_version_positive/
    );
  });

  test('invalid lifecycle value is rejected by a named CHECK constraint', async () => {
    await assert.rejects(
      () => pool.query(
        `INSERT INTO evidence_assignments (
           enrollment_id, assignment_type, target_timepoint, anchor_strategy
         ) VALUES (
           '00000000-0000-4000-8000-000000000001',
           'INVALID_ASSIGNMENT_TYPE',
           'IMMEDIATE',
           'NODE_ASSIGNMENT_COMPLETION'
         )`
      ),
      /evidence_assignments_type_check/
    );
  });

  test('orphan snapshot-node row is rejected', async () => {
    await assert.rejects(
      () => pool.query(
        `INSERT INTO evidence_assignment_snapshot_nodes (assignment_id, node_id, ordinal)
         VALUES (
           '00000000-0000-4000-8000-000000000002',
           'NODE_DOES_NOT_EXIST',
           0
         )`
      ),
      /foreign key/i
    );
  });

  test('no evidence FK targets progress or attempt_records', async () => {
    const { rows } = await pool.query(
      `SELECT source.relname AS source_table, target.relname AS target_table, c.conname
         FROM pg_constraint c
         JOIN pg_class source ON source.oid = c.conrelid
         JOIN pg_class target ON target.oid = c.confrelid
         JOIN pg_namespace n ON n.oid = source.relnamespace
        WHERE n.nspname = 'public'
          AND source.relname LIKE 'evidence\\_%' ESCAPE '\\'
          AND c.contype = 'f'
          AND target.relname IN ('progress', 'attempt_records')`
    );
    assert.deepEqual(rows, []);
  });

  test('no evidence trigger is attached to a production table', async () => {
    const { rows } = await pool.query(
      `SELECT rel.relname AS table_name, trg.tgname
         FROM pg_trigger trg
         JOIN pg_class rel ON rel.oid = trg.tgrelid
         JOIN pg_namespace n ON n.oid = rel.relnamespace
        WHERE n.nspname = 'public'
          AND rel.relname IN ('progress', 'attempt_records')
          AND NOT trg.tgisinternal
          AND pg_get_triggerdef(trg.oid, true) ILIKE '%evidence%'`
    );
    assert.deepEqual(rows, []);
  });

  test('production progress and attempt_records catalog is unchanged', async () => {
    const currentCatalog = await readProductionCatalog();
    assert.deepEqual(currentCatalog, {
      columns: baselineCatalog.columns,
      constraints: baselineCatalog.constraints,
      indexes: baselineCatalog.indexes,
      triggers: baselineCatalog.triggers,
      enums: baselineCatalog.enums,
    });
  });

  test('next_review_at type, nullability, and default are unchanged', async () => {
    assert.deepEqual(await readNextReviewShape(), baselineCatalog.nextReviewAt);
  });

  describe('013 VI P1 item-lineage runtime schema', { concurrency: false }, () => {
    let assignmentIdA;
    let assignmentIdB;
    let assignmentIdC;

    before(async () => {
      await pool.query(
        `INSERT INTO evidence_experiments (experiment_id)
         VALUES ('EXP_MIGRATION_LINEAGE')`
      );
      await pool.query(
        `INSERT INTO evidence_experiment_versions (
           experiment_id, version, definition, definition_digest,
           digest_algorithm, normalization_version
         ) VALUES ('EXP_MIGRATION_LINEAGE', 1, '{}'::jsonb, 'd', 'sha256', 'v1')`
      );
      await pool.query(
        `INSERT INTO evidence_conditions (condition_id)
         VALUES ('COND_MIGRATION_LINEAGE')`
      );
      await pool.query(
        `INSERT INTO evidence_condition_versions (
           condition_id, version, condition_class, definition, definition_digest,
           digest_algorithm, normalization_version
         ) VALUES (
           'COND_MIGRATION_LINEAGE', 1, 'ENGINEERING_BASELINE', '{}'::jsonb, 'd', 'sha256', 'v1'
         )`
      );
      const { rows: participantRows } = await pool.query(
        'INSERT INTO evidence_participants DEFAULT VALUES RETURNING participant_id'
      );
      const { rows: enrollmentRows } = await pool.query(
        `INSERT INTO evidence_enrollments (
           participant_id, experiment_id, experiment_version, condition_id, condition_version
         ) VALUES ($1, 'EXP_MIGRATION_LINEAGE', 1, 'COND_MIGRATION_LINEAGE', 1)
         RETURNING enrollment_id`,
        [participantRows[0].participant_id]
      );
      const enrollmentId = enrollmentRows[0].enrollment_id;

      async function insertAssignmentWithSnapshot() {
        const { rows: assignmentRows } = await pool.query(
          `INSERT INTO evidence_assignments (
             enrollment_id, assignment_type, target_timepoint, anchor_strategy
           ) VALUES ($1, 'ASSESSMENT', 'IMMEDIATE', 'NODE_ASSIGNMENT_COMPLETION')
           RETURNING assignment_id`,
          [enrollmentId]
        );
        const assignmentId = assignmentRows[0].assignment_id;
        await pool.query(
          `INSERT INTO evidence_assignment_snapshots (
             assignment_id,
             experiment_id, experiment_version, condition_id, condition_version,
             item_id, item_version, scenario_id, scenario_version,
             item_family_id, item_family_version,
             lexical_manifest_id, lexical_manifest_version,
             rubric_id, rubric_version, formula_id, formula_version,
             scheduler_protocol_id, scheduler_protocol_version,
             instrumentation_protocol_id, instrumentation_protocol_version,
             planned_stimulus_modalities, planned_response_modalities,
             snapshot_digest, digest_algorithm, normalization_version,
             exposure_history_cutoff_ordinal, resolved_item_lineage
           ) VALUES (
             $1,
             'EXP_MIGRATION_LINEAGE', 1, 'COND_MIGRATION_LINEAGE', 1,
             'ITEM_X', 1, 'SCENARIO_X', 1,
             'FAMILY_X', 1,
             'LEXICAL_X', 1,
             'RUBRIC_X', 1, 'FORMULA_X', 1,
             'SCHEDULER_X', 1,
             'INSTRUMENTATION_X', 1,
             '["TEXT"]'::jsonb, '["TEXT_ENTRY"]'::jsonb,
             'digest', 'sha256', 'v1',
             0, NULL
           )`,
          [assignmentId]
        );
        return assignmentId;
      }

      assignmentIdA = await insertAssignmentWithSnapshot();
      assignmentIdB = await insertAssignmentWithSnapshot();
      assignmentIdC = await insertAssignmentWithSnapshot();
    });

    test('exposure_history_cutoff_ordinal exists, is non-null, and rejects a negative value', async () => {
      const { rows } = await pool.query(
        `SELECT is_nullable, data_type
           FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'evidence_assignment_snapshots'
            AND column_name = 'exposure_history_cutoff_ordinal'`
      );
      assert.equal(rows.length, 1);
      assert.equal(rows[0].is_nullable, 'NO');
      assert.equal(rows[0].data_type, 'bigint');

      await assert.rejects(
        () => pool.query(
          `UPDATE evidence_assignment_snapshots
              SET exposure_history_cutoff_ordinal = -1
            WHERE assignment_id = $1`,
          [assignmentIdA]
        ),
        /evidence_assignment_snapshots_exposure_cutoff_nonnegative/
      );
    });

    test('resolved_item_lineage exists, is nullable, rejects a fifth value, and accepts the four allowed values', async () => {
      const { rows } = await pool.query(
        `SELECT is_nullable, data_type
           FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'evidence_assignment_snapshots'
            AND column_name = 'resolved_item_lineage'`
      );
      assert.equal(rows.length, 1);
      assert.equal(rows[0].is_nullable, 'YES');
      assert.equal(rows[0].data_type, 'text');

      await assert.rejects(
        () => pool.query(
          `UPDATE evidence_assignment_snapshots
              SET resolved_item_lineage = 'NOT_A_LINEAGE_VALUE'
            WHERE assignment_id = $1`,
          [assignmentIdA]
        ),
        /evidence_assignment_snapshots_item_lineage_check/
      );

      for (const value of ITEM_LINEAGE_VALUES) {
        await pool.query(
          `UPDATE evidence_assignment_snapshots
              SET resolved_item_lineage = $2
            WHERE assignment_id = $1`,
          [assignmentIdA, value]
        );
        const { rows: stored } = await pool.query(
          `SELECT resolved_item_lineage
             FROM evidence_assignment_snapshots
            WHERE assignment_id = $1`,
          [assignmentIdA]
        );
        assert.equal(stored[0].resolved_item_lineage, value);
      }

      await pool.query(
        `UPDATE evidence_assignment_snapshots
            SET resolved_item_lineage = NULL
          WHERE assignment_id = $1`,
        [assignmentIdA]
      );
    });

    test('evidence_assignment_item_exposures has exactly the required columns and no generic event columns', async () => {
      const { rows } = await pool.query(
        `SELECT column_name, is_nullable
           FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'evidence_assignment_item_exposures'
          ORDER BY ordinal_position`
      );
      assert.deepEqual(rows.map((row) => row.column_name).sort(), [
        'assignment_id',
        'created_at',
        'exposed_at',
        'exposure_id',
        'exposure_ordinal',
      ].sort());
      assert.ok(rows.every((row) => row.is_nullable === 'NO'), 'no nullable columns');

      for (const forbidden of [
        'event_type',
        'event_payload',
        'observation',
        'payload',
        'metadata',
        'enrollment_id',
        'item_id',
        'item_version',
        'item_family_id',
        'scenario_id',
        'target_node_ids',
      ]) {
        assert.equal(
          rows.some((row) => row.column_name === forbidden),
          false,
          `unexpected generic-event-like column: ${forbidden}`
        );
      }
    });

    test('evidence_assignment_item_exposures FK targets evidence_assignments only', async () => {
      const { rows } = await pool.query(
        `SELECT target.relname AS target_table
           FROM pg_constraint c
           JOIN pg_class source ON source.oid = c.conrelid
           JOIN pg_class target ON target.oid = c.confrelid
           JOIN pg_namespace n ON n.oid = source.relnamespace
          WHERE n.nspname = 'public'
            AND source.relname = 'evidence_assignment_item_exposures'
            AND c.contype = 'f'`
      );
      assert.deepEqual(rows.map((row) => row.target_table), ['evidence_assignments']);
    });

    test('one exposure row per assignment: a second row for the same assignment is rejected', async () => {
      await pool.query(
        `INSERT INTO evidence_assignment_item_exposures (assignment_id) VALUES ($1)`,
        [assignmentIdA]
      );
      await assert.rejects(
        () => pool.query(
          `INSERT INTO evidence_assignment_item_exposures (assignment_id) VALUES ($1)`,
          [assignmentIdA]
        ),
        /evidence_assignment_item_exposures_assignment_unique/
      );
    });

    test('exposure_ordinal is unique across the whole table, not per assignment', async () => {
      const { rows: seedRows } = await pool.query(
        `INSERT INTO evidence_assignment_item_exposures (assignment_id)
         VALUES ($1)
         RETURNING exposure_ordinal`,
        [assignmentIdC]
      );
      const usedOrdinal = seedRows[0].exposure_ordinal;
      await assert.rejects(
        () => pool.query(
          `INSERT INTO evidence_assignment_item_exposures (assignment_id, exposure_ordinal)
           VALUES ($1, $2)`,
          [assignmentIdB, usedOrdinal]
        ),
        /evidence_assignment_item_exposures_ordinal_unique/
      );
    });

    test('exposure_ordinal must be positive', async () => {
      await assert.rejects(
        () => pool.query(
          `INSERT INTO evidence_assignment_item_exposures (assignment_id, exposure_ordinal)
           VALUES ($1, 0)`,
          [assignmentIdB]
        ),
        /evidence_assignment_item_exposures_ordinal_positive/
      );
      await assert.rejects(
        () => pool.query(
          `INSERT INTO evidence_assignment_item_exposures (assignment_id, exposure_ordinal)
           VALUES ($1, -5)`,
          [assignmentIdB]
        ),
        /evidence_assignment_item_exposures_ordinal_positive/
      );
    });

    test('exposure_ordinal is server-issued by a global sequence when omitted', async () => {
      const { rows } = await pool.query(
        `INSERT INTO evidence_assignment_item_exposures (assignment_id)
         VALUES ($1)
         RETURNING exposure_ordinal`,
        [assignmentIdB]
      );
      assert.ok(Number(rows[0].exposure_ordinal) > 0);
    });
  });
});
