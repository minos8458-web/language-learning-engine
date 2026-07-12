-- 007_create_attempt_records.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.6(attempt_records 부분)
--
-- AC-008(content_id) 반영: 별도 ALTER 없이 최초 CREATE TABLE에 포함.
-- is_correct=true면 error_category가 반드시 NULL이어야 한다는 규칙을 CHECK로 enforce
-- (문서화된 불변식의 구현, 새 설계 아님).

DO $$ BEGIN
  CREATE TYPE error_category_enum AS ENUM ('SELF', 'TRANSFER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS attempt_records (
  attempt_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  node_id            TEXT NOT NULL,
  content_id         TEXT NULL REFERENCES content(content_id),
  attempted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_correct         BOOLEAN NOT NULL,
  response_time_ms   INTEGER NULL,
  correction_count   INTEGER NOT NULL DEFAULT 0,
  hint_used          BOOLEAN NOT NULL DEFAULT false,
  preceding_streak   INTEGER NOT NULL DEFAULT 0,
  error_category     error_category_enum NULL,
  error_subcategory  TEXT NULL,
  CONSTRAINT attempt_records_progress_fk
    FOREIGN KEY (user_id, node_id) REFERENCES progress(user_id, node_id),
  CONSTRAINT attempt_records_correct_implies_no_error
    CHECK (is_correct = false OR error_category IS NULL)
);
