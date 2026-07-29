-- 012_create_evidence_foundation.sql
--
-- Evidence Foundation P0 additive persistence surface.
-- Creates only new evidence_ objects. It does not alter production tables,
-- production enums, production indexes, production triggers, or production rows.

CREATE TABLE IF NOT EXISTS evidence_experiments (
  experiment_id  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_experiments_pk PRIMARY KEY (experiment_id),
  CONSTRAINT evidence_experiments_id_nonempty
    CHECK (btrim(experiment_id) <> '')
);

CREATE TABLE IF NOT EXISTS evidence_experiment_versions (
  experiment_id         TEXT NOT NULL,
  version               INTEGER NOT NULL,
  definition            JSONB NOT NULL,
  definition_digest     TEXT NOT NULL,
  digest_algorithm      TEXT NOT NULL,
  normalization_version TEXT NOT NULL,
  provenance_ref        TEXT NULL,
  published_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_experiment_versions_pk
    PRIMARY KEY (experiment_id, version),
  CONSTRAINT evidence_experiment_versions_experiment_fk
    FOREIGN KEY (experiment_id)
    REFERENCES evidence_experiments(experiment_id),
  CONSTRAINT evidence_experiment_versions_version_positive
    CHECK (version > 0),
  CONSTRAINT evidence_experiment_versions_definition_check
    CHECK (
      jsonb_typeof(definition) = 'object'
      AND octet_length(definition::text) <= 65536
    ),
  CONSTRAINT evidence_experiment_versions_digest_nonempty
    CHECK (
      btrim(definition_digest) <> ''
      AND btrim(digest_algorithm) <> ''
      AND btrim(normalization_version) <> ''
    ),
  CONSTRAINT evidence_experiment_versions_provenance_nonempty
    CHECK (provenance_ref IS NULL OR btrim(provenance_ref) <> '')
);

CREATE TABLE IF NOT EXISTS evidence_conditions (
  condition_id  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_conditions_pk PRIMARY KEY (condition_id),
  CONSTRAINT evidence_conditions_id_nonempty
    CHECK (btrim(condition_id) <> '')
);

CREATE TABLE IF NOT EXISTS evidence_condition_versions (
  condition_id          TEXT NOT NULL,
  version               INTEGER NOT NULL,
  condition_class       TEXT NOT NULL,
  definition            JSONB NOT NULL,
  definition_digest     TEXT NOT NULL,
  digest_algorithm      TEXT NOT NULL,
  normalization_version TEXT NOT NULL,
  provenance_ref        TEXT NULL,
  published_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_condition_versions_pk
    PRIMARY KEY (condition_id, version),
  CONSTRAINT evidence_condition_versions_condition_fk
    FOREIGN KEY (condition_id)
    REFERENCES evidence_conditions(condition_id),
  CONSTRAINT evidence_condition_versions_version_positive
    CHECK (version > 0),
  CONSTRAINT evidence_condition_versions_class_check
    CHECK (condition_class IN (
      'ENGINEERING_BASELINE',
      'PRIMARY_CONTROL',
      'EXPERIMENTAL'
    )),
  CONSTRAINT evidence_condition_versions_definition_check
    CHECK (
      jsonb_typeof(definition) = 'object'
      AND octet_length(definition::text) <= 65536
    ),
  CONSTRAINT evidence_condition_versions_digest_nonempty
    CHECK (
      btrim(definition_digest) <> ''
      AND btrim(digest_algorithm) <> ''
      AND btrim(normalization_version) <> ''
    ),
  CONSTRAINT evidence_condition_versions_provenance_nonempty
    CHECK (provenance_ref IS NULL OR btrim(provenance_ref) <> '')
);

CREATE TABLE IF NOT EXISTS evidence_reference_versions (
  reference_kind        TEXT NOT NULL,
  reference_id          TEXT NOT NULL,
  version               INTEGER NOT NULL,
  definition            JSONB NOT NULL,
  definition_digest     TEXT NOT NULL,
  digest_algorithm      TEXT NOT NULL,
  normalization_version TEXT NOT NULL,
  provenance_ref        TEXT NULL,
  license_status        TEXT NULL,
  published_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_reference_versions_pk
    PRIMARY KEY (reference_kind, reference_id, version),
  CONSTRAINT evidence_reference_versions_kind_check
    CHECK (reference_kind IN (
      'ITEM',
      'SCENARIO',
      'ITEM_FAMILY',
      'LEXICAL_MANIFEST',
      'RUBRIC',
      'FORMULA',
      'SCHEDULER_PROTOCOL',
      'INSTRUMENTATION_PROTOCOL'
    )),
  CONSTRAINT evidence_reference_versions_id_nonempty
    CHECK (btrim(reference_id) <> ''),
  CONSTRAINT evidence_reference_versions_version_positive
    CHECK (version > 0),
  CONSTRAINT evidence_reference_versions_definition_check
    CHECK (
      jsonb_typeof(definition) = 'object'
      AND octet_length(definition::text) <= 65536
    ),
  CONSTRAINT evidence_reference_versions_digest_nonempty
    CHECK (
      btrim(definition_digest) <> ''
      AND btrim(digest_algorithm) <> ''
      AND btrim(normalization_version) <> ''
    ),
  CONSTRAINT evidence_reference_versions_metadata_nonempty
    CHECK (
      (provenance_ref IS NULL OR btrim(provenance_ref) <> '')
      AND (license_status IS NULL OR btrim(license_status) <> '')
    )
);

CREATE TABLE IF NOT EXISTS evidence_participants (
  participant_id  UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_participants_pk PRIMARY KEY (participant_id)
);

CREATE TABLE IF NOT EXISTS evidence_enrollments (
  enrollment_id       UUID NOT NULL DEFAULT gen_random_uuid(),
  participant_id      UUID NOT NULL,
  experiment_id       TEXT NOT NULL,
  experiment_version  INTEGER NOT NULL,
  condition_id        TEXT NOT NULL,
  condition_version   INTEGER NOT NULL,
  status              TEXT NOT NULL DEFAULT 'ACTIVE',
  completed_at        TIMESTAMPTZ NULL,
  withdrawn_at        TIMESTAMPTZ NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_enrollments_pk PRIMARY KEY (enrollment_id),
  CONSTRAINT evidence_enrollments_participant_fk
    FOREIGN KEY (participant_id)
    REFERENCES evidence_participants(participant_id),
  CONSTRAINT evidence_enrollments_experiment_version_fk
    FOREIGN KEY (experiment_id, experiment_version)
    REFERENCES evidence_experiment_versions(experiment_id, version),
  CONSTRAINT evidence_enrollments_condition_version_fk
    FOREIGN KEY (condition_id, condition_version)
    REFERENCES evidence_condition_versions(condition_id, version),
  CONSTRAINT evidence_enrollments_versions_positive
    CHECK (experiment_version > 0 AND condition_version > 0),
  CONSTRAINT evidence_enrollments_status_check
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'WITHDRAWN')),
  CONSTRAINT evidence_enrollments_terminal_timestamp_check
    CHECK (
      (status = 'ACTIVE' AND completed_at IS NULL AND withdrawn_at IS NULL)
      OR (status = 'COMPLETED' AND completed_at IS NOT NULL AND withdrawn_at IS NULL)
      OR (status = 'WITHDRAWN' AND completed_at IS NULL AND withdrawn_at IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS evidence_assignments (
  assignment_id          UUID NOT NULL DEFAULT gen_random_uuid(),
  enrollment_id          UUID NOT NULL,
  assignment_type        TEXT NOT NULL,
  target_timepoint       TEXT NOT NULL,
  anchor_strategy        TEXT NOT NULL,
  anchor_event_ref       TEXT NULL,
  anchor_at              TIMESTAMPTZ NULL,
  due_at                 TIMESTAMPTZ NULL,
  completed_at           TIMESTAMPTZ NULL,
  completion_attempt_id  UUID NULL,
  terminal_outcome       TEXT NULL,
  rescheduled_from       UUID NULL,
  superseded_by          UUID NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_assignments_pk PRIMARY KEY (assignment_id),
  CONSTRAINT evidence_assignments_enrollment_fk
    FOREIGN KEY (enrollment_id)
    REFERENCES evidence_enrollments(enrollment_id),
  CONSTRAINT evidence_assignments_rescheduled_from_fk
    FOREIGN KEY (rescheduled_from)
    REFERENCES evidence_assignments(assignment_id),
  CONSTRAINT evidence_assignments_superseded_by_fk
    FOREIGN KEY (superseded_by)
    REFERENCES evidence_assignments(assignment_id),
  CONSTRAINT evidence_assignments_superseded_by_unique
    UNIQUE (superseded_by),
  CONSTRAINT evidence_assignments_type_check
    CHECK (assignment_type IN ('LEARNING', 'REVIEW', 'ASSESSMENT')),
  CONSTRAINT evidence_assignments_timepoint_check
    CHECK (target_timepoint IN (
      'IMMEDIATE',
      'DAY_7',
      'DAY_30',
      'NOT_APPLICABLE'
    )),
  CONSTRAINT evidence_assignments_anchor_check
    CHECK (anchor_strategy IN (
      'NODE_ASSIGNMENT_COMPLETION',
      'QUALIFYING_CRITERION_EVENT',
      'GROUPED_LEARNING_BLOCK_COMPLETION'
    )),
  CONSTRAINT evidence_assignments_outcome_check
    CHECK (
      terminal_outcome IS NULL
      OR terminal_outcome IN (
        'COMPLETED',
        'MISSING',
        'TECHNICAL_FAILURE',
        'WITHDRAWN',
        'UNSCORABLE',
        'NORMAL_EMPTY'
      )
    ),
  CONSTRAINT evidence_assignments_no_self_lineage
    CHECK (
      (rescheduled_from IS NULL OR rescheduled_from <> assignment_id)
      AND (superseded_by IS NULL OR superseded_by <> assignment_id)
    ),
  CONSTRAINT evidence_assignments_completion_consistency
    CHECK (
      (terminal_outcome IS NULL
        AND completed_at IS NULL
        AND completion_attempt_id IS NULL)
      OR (terminal_outcome = 'COMPLETED'
        AND completed_at IS NOT NULL
        AND completion_attempt_id IS NOT NULL)
      OR (terminal_outcome IS NOT NULL
        AND terminal_outcome <> 'COMPLETED'
        AND completed_at IS NULL
        AND completion_attempt_id IS NULL)
    ),
  CONSTRAINT evidence_assignments_anchor_ref_nonempty
    CHECK (anchor_event_ref IS NULL OR btrim(anchor_event_ref) <> '')
);

CREATE TABLE IF NOT EXISTS evidence_assignment_snapshots (
  assignment_id                    UUID NOT NULL,
  experiment_id                    TEXT NOT NULL,
  experiment_version               INTEGER NOT NULL,
  condition_id                     TEXT NOT NULL,
  condition_version                INTEGER NOT NULL,
  item_id                          TEXT NOT NULL,
  item_version                     INTEGER NOT NULL,
  content_id                       TEXT NULL,
  content_version                  INTEGER NULL,
  scenario_id                      TEXT NOT NULL,
  scenario_version                 INTEGER NOT NULL,
  item_family_id                   TEXT NOT NULL,
  item_family_version              INTEGER NOT NULL,
  lexical_manifest_id              TEXT NOT NULL,
  lexical_manifest_version         INTEGER NOT NULL,
  rubric_id                        TEXT NOT NULL,
  rubric_version                   INTEGER NOT NULL,
  formula_id                       TEXT NOT NULL,
  formula_version                  INTEGER NOT NULL,
  scheduler_protocol_id            TEXT NOT NULL,
  scheduler_protocol_version       INTEGER NOT NULL,
  instrumentation_protocol_id      TEXT NOT NULL,
  instrumentation_protocol_version INTEGER NOT NULL,
  planned_stimulus_modalities      JSONB NOT NULL,
  planned_response_modalities      JSONB NOT NULL,
  snapshot_digest                  TEXT NOT NULL,
  digest_algorithm                 TEXT NOT NULL,
  normalization_version            TEXT NOT NULL,
  created_at                       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_assignment_snapshots_pk PRIMARY KEY (assignment_id),
  CONSTRAINT evidence_assignment_snapshots_assignment_fk
    FOREIGN KEY (assignment_id)
    REFERENCES evidence_assignments(assignment_id),
  CONSTRAINT evidence_assignment_snapshots_experiment_fk
    FOREIGN KEY (experiment_id, experiment_version)
    REFERENCES evidence_experiment_versions(experiment_id, version),
  CONSTRAINT evidence_assignment_snapshots_condition_fk
    FOREIGN KEY (condition_id, condition_version)
    REFERENCES evidence_condition_versions(condition_id, version),
  CONSTRAINT evidence_assignment_snapshots_content_fk
    FOREIGN KEY (content_id)
    REFERENCES content(content_id),
  CONSTRAINT evidence_assignment_snapshots_content_pair_check
    CHECK (
      (content_id IS NULL AND content_version IS NULL)
      OR (content_id IS NOT NULL AND content_version IS NOT NULL)
    ),
  CONSTRAINT evidence_assignment_snapshots_versions_positive
    CHECK (
      experiment_version > 0
      AND condition_version > 0
      AND item_version > 0
      AND (content_version IS NULL OR content_version > 0)
      AND scenario_version > 0
      AND item_family_version > 0
      AND lexical_manifest_version > 0
      AND rubric_version > 0
      AND formula_version > 0
      AND scheduler_protocol_version > 0
      AND instrumentation_protocol_version > 0
    ),
  CONSTRAINT evidence_assignment_snapshots_ids_nonempty
    CHECK (
      btrim(item_id) <> ''
      AND btrim(scenario_id) <> ''
      AND btrim(item_family_id) <> ''
      AND btrim(lexical_manifest_id) <> ''
      AND btrim(rubric_id) <> ''
      AND btrim(formula_id) <> ''
      AND btrim(scheduler_protocol_id) <> ''
      AND btrim(instrumentation_protocol_id) <> ''
      AND (content_id IS NULL OR btrim(content_id) <> '')
    ),
  CONSTRAINT evidence_assignment_snapshots_stimulus_modalities_array
    CHECK (
      jsonb_typeof(planned_stimulus_modalities) = 'array'
      AND jsonb_array_length(planned_stimulus_modalities) BETWEEN 1 AND 4
      AND octet_length(planned_stimulus_modalities::text) <= 2048
      AND NOT jsonb_path_exists(
        planned_stimulus_modalities,
        '$[*] ? (@ != "TEXT" && @ != "AUDIO" && @ != "IMAGE" && @ != "VIDEO")'
      )
    ),
  CONSTRAINT evidence_assignment_snapshots_response_modalities_array
    CHECK (
      jsonb_typeof(planned_response_modalities) = 'array'
      AND jsonb_array_length(planned_response_modalities) BETWEEN 1 AND 4
      AND octet_length(planned_response_modalities::text) <= 2048
      AND NOT jsonb_path_exists(
        planned_response_modalities,
        '$[*] ? (@ != "TEXT_ENTRY" && @ != "SELECTION" && @ != "STRUCTURED_ACTION" && @ != "SPEECH")'
      )
    ),
  CONSTRAINT evidence_assignment_snapshots_digest_nonempty
    CHECK (
      btrim(snapshot_digest) <> ''
      AND btrim(digest_algorithm) <> ''
      AND btrim(normalization_version) <> ''
    )
);

CREATE TABLE IF NOT EXISTS evidence_assignment_snapshot_nodes (
  assignment_id  UUID NOT NULL,
  node_id        TEXT NOT NULL,
  ordinal        INTEGER NOT NULL,
  CONSTRAINT evidence_assignment_snapshot_nodes_pk
    PRIMARY KEY (assignment_id, node_id),
  CONSTRAINT evidence_assignment_snapshot_nodes_assignment_fk
    FOREIGN KEY (assignment_id)
    REFERENCES evidence_assignment_snapshots(assignment_id),
  CONSTRAINT evidence_assignment_snapshot_nodes_node_fk
    FOREIGN KEY (node_id)
    REFERENCES grammar_nodes(node_id),
  CONSTRAINT evidence_assignment_snapshot_nodes_ordinal_unique
    UNIQUE (assignment_id, ordinal),
  CONSTRAINT evidence_assignment_snapshot_nodes_ordinal_nonnegative
    CHECK (ordinal >= 0),
  CONSTRAINT evidence_assignment_snapshot_nodes_id_nonempty
    CHECK (btrim(node_id) <> '')
);

CREATE TABLE IF NOT EXISTS evidence_sessions (
  session_id             UUID NOT NULL DEFAULT gen_random_uuid(),
  enrollment_id          UUID NOT NULL,
  started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at               TIMESTAMPTZ NULL,
  terminal_outcome       TEXT NULL,
  technical_failure_ref  TEXT NULL,
  restarted_from         UUID NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_sessions_pk PRIMARY KEY (session_id),
  CONSTRAINT evidence_sessions_enrollment_fk
    FOREIGN KEY (enrollment_id)
    REFERENCES evidence_enrollments(enrollment_id),
  CONSTRAINT evidence_sessions_restarted_from_fk
    FOREIGN KEY (restarted_from)
    REFERENCES evidence_sessions(session_id),
  CONSTRAINT evidence_sessions_outcome_check
    CHECK (
      terminal_outcome IS NULL
      OR terminal_outcome IN (
        'COMPLETED',
        'ABANDONED',
        'TIMED_OUT',
        'TECHNICAL_FAILURE',
        'WITHDRAWN'
      )
    ),
  CONSTRAINT evidence_sessions_terminal_pair_check
    CHECK (
      (ended_at IS NULL AND terminal_outcome IS NULL)
      OR (ended_at IS NOT NULL AND terminal_outcome IS NOT NULL)
    ),
  CONSTRAINT evidence_sessions_no_self_restart
    CHECK (restarted_from IS NULL OR restarted_from <> session_id),
  CONSTRAINT evidence_sessions_failure_ref_nonempty
    CHECK (
      technical_failure_ref IS NULL
      OR btrim(technical_failure_ref) <> ''
    )
);

CREATE TABLE IF NOT EXISTS evidence_attempt_series (
  attempt_series_id  UUID NOT NULL DEFAULT gen_random_uuid(),
  assignment_id      UUID NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_attempt_series_pk PRIMARY KEY (attempt_series_id),
  CONSTRAINT evidence_attempt_series_assignment_fk
    FOREIGN KEY (assignment_id)
    REFERENCES evidence_assignments(assignment_id),
  CONSTRAINT evidence_attempt_series_ownership_unique
    UNIQUE (attempt_series_id, assignment_id)
);

CREATE TABLE IF NOT EXISTS evidence_attempts (
  attempt_id             UUID NOT NULL DEFAULT gen_random_uuid(),
  assignment_id          UUID NOT NULL,
  session_id             UUID NOT NULL,
  attempt_series_id      UUID NOT NULL,
  retry_ordinal          INTEGER NOT NULL,
  retry_of_attempt_id    UUID NULL,
  idempotency_identity   TEXT NOT NULL,
  open_payload_digest    TEXT NOT NULL,
  digest_algorithm       TEXT NOT NULL,
  normalization_version  TEXT NOT NULL,
  replay_result          JSONB NOT NULL,
  started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_attempts_pk PRIMARY KEY (attempt_id),
  CONSTRAINT evidence_attempts_assignment_fk
    FOREIGN KEY (assignment_id)
    REFERENCES evidence_assignments(assignment_id),
  CONSTRAINT evidence_attempts_session_fk
    FOREIGN KEY (session_id)
    REFERENCES evidence_sessions(session_id),
  CONSTRAINT evidence_attempts_series_assignment_fk
    FOREIGN KEY (attempt_series_id, assignment_id)
    REFERENCES evidence_attempt_series(attempt_series_id, assignment_id),
  CONSTRAINT evidence_attempts_retry_parent_fk
    FOREIGN KEY (retry_of_attempt_id)
    REFERENCES evidence_attempts(attempt_id),
  CONSTRAINT evidence_attempts_assignment_idempotency_unique
    UNIQUE (assignment_id, idempotency_identity),
  CONSTRAINT evidence_attempts_series_ordinal_unique
    UNIQUE (attempt_series_id, retry_ordinal),
  CONSTRAINT evidence_attempts_retry_ordinal_nonnegative
    CHECK (retry_ordinal >= 0),
  CONSTRAINT evidence_attempts_retry_parent_consistency
    CHECK (
      (retry_ordinal = 0 AND retry_of_attempt_id IS NULL)
      OR (retry_ordinal > 0 AND retry_of_attempt_id IS NOT NULL)
    ),
  CONSTRAINT evidence_attempts_no_self_retry
    CHECK (retry_of_attempt_id IS NULL OR retry_of_attempt_id <> attempt_id),
  CONSTRAINT evidence_attempts_idempotency_nonempty
    CHECK (
      btrim(idempotency_identity) <> ''
      AND btrim(open_payload_digest) <> ''
      AND btrim(digest_algorithm) <> ''
      AND btrim(normalization_version) <> ''
    ),
  CONSTRAINT evidence_attempts_replay_result_check
    CHECK (
      jsonb_typeof(replay_result) = 'object'
      AND octet_length(replay_result::text) <= 16384
    )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conname = 'evidence_assignments_completion_attempt_fk'
       AND conrelid = 'evidence_assignments'::regclass
  ) THEN
    ALTER TABLE evidence_assignments
      ADD CONSTRAINT evidence_assignments_completion_attempt_fk
      FOREIGN KEY (completion_attempt_id)
      REFERENCES evidence_attempts(attempt_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS evidence_attempt_finalizations (
  attempt_id                              UUID NOT NULL,
  finalization_idempotency_identity       TEXT NOT NULL,
  finalization_payload_digest             TEXT NOT NULL,
  digest_algorithm                        TEXT NOT NULL,
  normalization_version                   TEXT NOT NULL,
  server_received_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at                            TIMESTAMPTZ NOT NULL DEFAULT now(),
  clock_quality                           TEXT NOT NULL,
  response_kind                           TEXT NOT NULL,
  attempt_outcome                         TEXT NOT NULL,
  instrumentation_protocol_id             TEXT NOT NULL,
  instrumentation_protocol_version        INTEGER NOT NULL,
  actual_stimulus_modalities              JSONB NOT NULL,
  actual_response_modalities              JSONB NOT NULL,
  input_enabled_offset_ms                 BIGINT NULL,
  first_valid_activity_offset_ms          BIGINT NULL,
  submitted_offset_ms                     BIGINT NULL,
  reported_client_monotonic_duration_ms   BIGINT NULL,
  response_text                           TEXT NULL,
  response_json                           JSONB NULL,
  response_ref                            TEXT NULL,
  replay_result                           JSONB NOT NULL,
  created_at                              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_attempt_finalizations_pk PRIMARY KEY (attempt_id),
  CONSTRAINT evidence_attempt_finalizations_attempt_fk
    FOREIGN KEY (attempt_id)
    REFERENCES evidence_attempts(attempt_id),
  CONSTRAINT evidence_attempt_finalizations_clock_quality_check
    CHECK (clock_quality IN ('VALID', 'DEGRADED', 'UNKNOWN', 'INVALID')),
  CONSTRAINT evidence_attempt_finalizations_response_kind_check
    CHECK (response_kind IN ('TEXT', 'JSON', 'REFERENCE', 'NORMAL_EMPTY')),
  CONSTRAINT evidence_attempt_finalizations_outcome_check
    CHECK (attempt_outcome IN ('SCORABLE', 'UNSCORABLE', 'TECHNICAL_INVALID')),
  CONSTRAINT evidence_attempt_finalizations_protocol_version_positive
    CHECK (instrumentation_protocol_version > 0),
  CONSTRAINT evidence_attempt_finalizations_identity_nonempty
    CHECK (
      btrim(finalization_idempotency_identity) <> ''
      AND btrim(finalization_payload_digest) <> ''
      AND btrim(digest_algorithm) <> ''
      AND btrim(normalization_version) <> ''
      AND btrim(instrumentation_protocol_id) <> ''
    ),
  CONSTRAINT evidence_attempt_finalizations_timing_nonnegative
    CHECK (
      (input_enabled_offset_ms IS NULL OR input_enabled_offset_ms >= 0)
      AND (first_valid_activity_offset_ms IS NULL OR first_valid_activity_offset_ms >= 0)
      AND (submitted_offset_ms IS NULL OR submitted_offset_ms >= 0)
      AND (
        reported_client_monotonic_duration_ms IS NULL
        OR reported_client_monotonic_duration_ms >= 0
      )
    ),
  CONSTRAINT evidence_attempt_finalizations_timing_order
    CHECK (
      (
        input_enabled_offset_ms IS NULL
        OR first_valid_activity_offset_ms IS NULL
        OR input_enabled_offset_ms <= first_valid_activity_offset_ms
      )
      AND (
        first_valid_activity_offset_ms IS NULL
        OR submitted_offset_ms IS NULL
        OR first_valid_activity_offset_ms <= submitted_offset_ms
      )
      AND (
        input_enabled_offset_ms IS NULL
        OR submitted_offset_ms IS NULL
        OR input_enabled_offset_ms <= submitted_offset_ms
      )
    ),
  CONSTRAINT evidence_attempt_finalizations_response_representation
    CHECK (
      (response_kind = 'TEXT'
        AND response_text IS NOT NULL
        AND response_json IS NULL
        AND response_ref IS NULL)
      OR (response_kind = 'JSON'
        AND response_text IS NULL
        AND response_json IS NOT NULL
        AND response_ref IS NULL)
      OR (response_kind = 'REFERENCE'
        AND response_text IS NULL
        AND response_json IS NULL
        AND response_ref IS NOT NULL
        AND btrim(response_ref) <> '')
      OR (response_kind = 'NORMAL_EMPTY'
        AND response_text IS NULL
        AND response_json IS NULL
        AND response_ref IS NULL)
    ),
  CONSTRAINT evidence_attempt_finalizations_response_json_bounded
    CHECK (
      response_json IS NULL
      OR octet_length(response_json::text) <= 65536
    ),
  CONSTRAINT evidence_attempt_finalizations_stimulus_modalities_array
    CHECK (
      jsonb_typeof(actual_stimulus_modalities) = 'array'
      AND jsonb_array_length(actual_stimulus_modalities) BETWEEN 1 AND 4
      AND octet_length(actual_stimulus_modalities::text) <= 2048
      AND NOT jsonb_path_exists(
        actual_stimulus_modalities,
        '$[*] ? (@ != "TEXT" && @ != "AUDIO" && @ != "IMAGE" && @ != "VIDEO")'
      )
    ),
  CONSTRAINT evidence_attempt_finalizations_response_modalities_array
    CHECK (
      jsonb_typeof(actual_response_modalities) = 'array'
      AND jsonb_array_length(actual_response_modalities) BETWEEN 1 AND 4
      AND octet_length(actual_response_modalities::text) <= 2048
      AND NOT jsonb_path_exists(
        actual_response_modalities,
        '$[*] ? (@ != "TEXT_ENTRY" && @ != "SELECTION" && @ != "STRUCTURED_ACTION" && @ != "SPEECH")'
      )
    ),
  CONSTRAINT evidence_attempt_finalizations_replay_result_check
    CHECK (
      jsonb_typeof(replay_result) = 'object'
      AND octet_length(replay_result::text) <= 16384
    )
);

CREATE TABLE IF NOT EXISTS evidence_target_node_evaluations (
  evaluation_id     UUID NOT NULL DEFAULT gen_random_uuid(),
  attempt_id        UUID NOT NULL,
  node_id           TEXT NOT NULL,
  rubric_id         TEXT NOT NULL,
  rubric_version    INTEGER NOT NULL,
  rubric_outcome    JSONB NOT NULL,
  scorable          BOOLEAN NOT NULL,
  is_correct        BOOLEAN NULL,
  evaluation_source TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_target_node_evaluations_pk PRIMARY KEY (evaluation_id),
  CONSTRAINT evidence_target_node_evaluations_finalization_fk
    FOREIGN KEY (attempt_id)
    REFERENCES evidence_attempt_finalizations(attempt_id),
  CONSTRAINT evidence_target_node_evaluations_node_fk
    FOREIGN KEY (node_id)
    REFERENCES grammar_nodes(node_id),
  CONSTRAINT evidence_target_node_evaluations_attempt_node_unique
    UNIQUE (attempt_id, node_id),
  CONSTRAINT evidence_target_node_evaluations_rubric_version_positive
    CHECK (rubric_version > 0),
  CONSTRAINT evidence_target_node_evaluations_source_check
    CHECK (evaluation_source IN ('RULE', 'HUMAN', 'AI_ASSISTED')),
  CONSTRAINT evidence_target_node_evaluations_scorable_consistency
    CHECK (scorable OR is_correct IS NULL),
  CONSTRAINT evidence_target_node_evaluations_rubric_outcome_check
    CHECK (
      jsonb_typeof(rubric_outcome) <> 'null'
      AND octet_length(rubric_outcome::text) <= 16384
    ),
  CONSTRAINT evidence_target_node_evaluations_ids_nonempty
    CHECK (btrim(node_id) <> '' AND btrim(rubric_id) <> '')
);

CREATE TABLE IF NOT EXISTS evidence_correction_aggregates (
  attempt_id          UUID NOT NULL,
  initiator           TEXT NOT NULL,
  feedback_phase      TEXT NOT NULL,
  correction_outcome  TEXT NOT NULL,
  count               INTEGER NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_correction_aggregates_pk
    PRIMARY KEY (
      attempt_id,
      initiator,
      feedback_phase,
      correction_outcome
    ),
  CONSTRAINT evidence_correction_aggregates_finalization_fk
    FOREIGN KEY (attempt_id)
    REFERENCES evidence_attempt_finalizations(attempt_id),
  CONSTRAINT evidence_correction_aggregates_initiator_check
    CHECK (initiator IN ('LEARNER', 'SYSTEM')),
  CONSTRAINT evidence_correction_aggregates_phase_check
    CHECK (feedback_phase IN ('PRE_FEEDBACK', 'POST_FEEDBACK')),
  CONSTRAINT evidence_correction_aggregates_outcome_check
    CHECK (correction_outcome IN ('SUCCESSFUL', 'UNSUCCESSFUL', 'UNKNOWN')),
  CONSTRAINT evidence_correction_aggregates_count_nonnegative
    CHECK (count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_evidence_experiment_versions_published
  ON evidence_experiment_versions (experiment_id, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_condition_versions_published
  ON evidence_condition_versions (condition_id, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_reference_versions_published
  ON evidence_reference_versions (
    reference_kind,
    reference_id,
    published_at DESC
  );

CREATE INDEX IF NOT EXISTS idx_evidence_enrollments_participant_created
  ON evidence_enrollments (participant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_enrollments_cohort
  ON evidence_enrollments (
    experiment_id,
    experiment_version,
    condition_id,
    condition_version
  );

CREATE INDEX IF NOT EXISTS idx_evidence_assignments_enrollment_lifecycle
  ON evidence_assignments (
    enrollment_id,
    assignment_type,
    target_timepoint,
    terminal_outcome,
    created_at DESC
  );

CREATE INDEX IF NOT EXISTS idx_evidence_assignments_active_review_due
  ON evidence_assignments (enrollment_id, due_at)
  WHERE assignment_type = 'REVIEW'
    AND terminal_outcome IS NULL
    AND superseded_by IS NULL;

CREATE INDEX IF NOT EXISTS idx_evidence_sessions_enrollment_started
  ON evidence_sessions (enrollment_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_attempts_assignment_started
  ON evidence_attempts (assignment_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_attempts_session_started
  ON evidence_attempts (session_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_attempt_finalizations_finalized
  ON evidence_attempt_finalizations (finalized_at DESC, attempt_id);

CREATE INDEX IF NOT EXISTS idx_evidence_evaluations_node_attempt
  ON evidence_target_node_evaluations (node_id, attempt_id);

CREATE INDEX IF NOT EXISTS idx_evidence_corrections_dimensions
  ON evidence_correction_aggregates (
    initiator,
    feedback_phase,
    correction_outcome,
    attempt_id
  );
