-- 006_create_progress.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.6(progress 부분)
-- PK는 복합키 (user_id, node_id) — PROGRESS_SCHEMA §2 명시.
--
-- confidence_self_reported가 NULL이면 confidence_calibration_delta도 반드시 NULL이어야
-- 한다는 규칙(§3.6: "근거 없는 보정값 금지")을 CHECK로 그대로 enforce한다 — 새 설계 아님,
-- 문서화된 불변식의 구현.

DO $$ BEGIN
  CREATE TYPE progress_state_enum AS ENUM (
    'NOT_INTRODUCED', 'INTRODUCED', 'STUDYING', 'PRACTICING', 'MASTERED', 'AUTOMATIC'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS progress (
  user_id                        UUID NOT NULL REFERENCES users(user_id),
  node_id                         TEXT NOT NULL REFERENCES grammar_nodes(node_id),
  state                           progress_state_enum NOT NULL DEFAULT 'NOT_INTRODUCED',
  accuracy                        NUMERIC NOT NULL DEFAULT 0,
  avg_response_time_ms            NUMERIC NOT NULL DEFAULT 0,
  confidence_inferred             NUMERIC NOT NULL DEFAULT 0,
  confidence_self_reported        NUMERIC NULL,
  confidence_calibration_delta    NUMERIC NULL,
  next_review_at                  TIMESTAMPTZ NULL,
  explicit_study_event_at         TIMESTAMPTZ NULL,
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, node_id),
  CONSTRAINT progress_calibration_requires_self_reported
    CHECK (confidence_self_reported IS NOT NULL OR confidence_calibration_delta IS NULL)
);
