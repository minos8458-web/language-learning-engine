-- 009_create_cascade_jobs.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.8, ARCHITECTURE_CLARIFICATION_BACKLOG.md "AC-002"(복구 메모)
--
-- 8개 Engine에 속하지 않는 별도 인프라 컴포넌트(아웃박스 테이블). 이 마이그레이션은
-- 테이블·제약만 만든다 — 워커(cascade_jobs Worker)의 트랜잭션 처리 로직은 Phase 5 범위.

DO $$ BEGIN
  CREATE TYPE job_status_enum AS ENUM ('PENDING', 'DONE', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS cascade_jobs (
  job_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(user_id),
  target_node_id   TEXT NOT NULL REFERENCES grammar_nodes(node_id),
  status           job_status_enum NOT NULL DEFAULT 'PENDING',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at     TIMESTAMPTZ NULL,
  retry_count      INTEGER NOT NULL DEFAULT 0
);
