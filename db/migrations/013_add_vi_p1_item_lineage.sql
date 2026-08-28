-- 013_add_vi_p1_item_lineage.sql
--
-- VI P1 Measurement Readiness -- RUNTIME FOUNDATION A.
--
-- Adds assignment-time exposure-history cutoff and resolved item-lineage
-- authority to evidence_assignment_snapshots, and creates the bounded
-- evidence_assignment_item_exposures table that records each assignment's
-- first learner-facing item exposure only.
--
-- Additive-only: this does not alter production tables, production enums,
-- production indexes, production triggers, or production rows. It does not
-- create a generic learner-event table, a generic observation table, or a
-- full event-sourcing surface -- evidence_assignment_item_exposures stores
-- at most one authoritative row per assignment (the assignment's first
-- learner-facing item exposure), and item/family/scenario identity and the
-- target-node set are not duplicated onto it; they resolve from the
-- assignment's existing immutable snapshot and snapshot-node rows.

-- 1. evidence_assignment_snapshots: exposure-history cutoff (required,
--    nonnegative after this migration completes).
ALTER TABLE evidence_assignment_snapshots
  ADD COLUMN IF NOT EXISTS exposure_history_cutoff_ordinal BIGINT;

-- Forward-migration compatibility path only: historical synthetic snapshots
-- created before this migration have no committed Assignment item exposure
-- history, so their cutoff is fixed at 0 here. This backfill is not a
-- runtime default -- new assignment creation always writes an explicit
-- server-resolved value (src/instrumentation/evidenceRepository.js).
UPDATE evidence_assignment_snapshots
   SET exposure_history_cutoff_ordinal = 0
 WHERE exposure_history_cutoff_ordinal IS NULL;

ALTER TABLE evidence_assignment_snapshots
  ALTER COLUMN exposure_history_cutoff_ordinal SET NOT NULL;

-- 2. evidence_assignment_snapshots: resolved item lineage (nullable).
ALTER TABLE evidence_assignment_snapshots
  ADD COLUMN IF NOT EXISTS resolved_item_lineage TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'evidence_assignment_snapshots_exposure_cutoff_nonnegative'
       AND conrelid = 'evidence_assignment_snapshots'::regclass
  ) THEN
    ALTER TABLE evidence_assignment_snapshots
      ADD CONSTRAINT evidence_assignment_snapshots_exposure_cutoff_nonnegative
      CHECK (exposure_history_cutoff_ordinal >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'evidence_assignment_snapshots_item_lineage_check'
       AND conrelid = 'evidence_assignment_snapshots'::regclass
  ) THEN
    ALTER TABLE evidence_assignment_snapshots
      ADD CONSTRAINT evidence_assignment_snapshots_item_lineage_check
      CHECK (
        resolved_item_lineage IS NULL
        OR resolved_item_lineage IN (
          'EXACT_REPEAT',
          'SURFACE_VARIANT',
          'SAME_ITEM_FAMILY',
          'DIFFERENT_ITEM_FAMILY'
        )
      );
  END IF;
END $$;

-- 3. Global, positive, unique, monotonically increasing (gaps allowed)
-- exposure-ordinal allocator. This is one allocator across the entire
-- Evidence exposure authority -- not a per-enrollment or per-assignment
-- counter.
CREATE SEQUENCE IF NOT EXISTS evidence_assignment_item_exposure_ordinal_seq
  AS BIGINT
  START WITH 1
  INCREMENT BY 1;

-- 4. Assignment-scoped first learner-facing item exposure only.
CREATE TABLE IF NOT EXISTS evidence_assignment_item_exposures (
  exposure_id       UUID NOT NULL DEFAULT gen_random_uuid(),
  assignment_id     UUID NOT NULL,
  exposure_ordinal  BIGINT NOT NULL
    DEFAULT nextval('evidence_assignment_item_exposure_ordinal_seq'),
  exposed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_assignment_item_exposures_pk PRIMARY KEY (exposure_id),
  CONSTRAINT evidence_assignment_item_exposures_assignment_fk
    FOREIGN KEY (assignment_id)
    REFERENCES evidence_assignments(assignment_id),
  CONSTRAINT evidence_assignment_item_exposures_assignment_unique
    UNIQUE (assignment_id),
  CONSTRAINT evidence_assignment_item_exposures_ordinal_unique
    UNIQUE (exposure_ordinal),
  CONSTRAINT evidence_assignment_item_exposures_ordinal_positive
    CHECK (exposure_ordinal > 0)
);

ALTER SEQUENCE evidence_assignment_item_exposure_ordinal_seq
  OWNED BY evidence_assignment_item_exposures.exposure_ordinal;
