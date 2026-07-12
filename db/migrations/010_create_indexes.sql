-- 010_create_indexes.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §5 (get_due_reviews 기준으로 설계된 5개 인덱스)
-- 여기 5개 외의 인덱스는 이번 승인 범위 밖이므로 추가하지 않는다.

CREATE INDEX IF NOT EXISTS idx_progress_user_next_review
  ON progress (user_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_grammar_nodes_language
  ON grammar_nodes (language);

CREATE INDEX IF NOT EXISTS idx_grammar_nodes_concept_ids_gin
  ON grammar_nodes USING GIN (concept_ids);

CREATE INDEX IF NOT EXISTS idx_attempt_records_user_node_attempted
  ON attempt_records (user_id, node_id, attempted_at);

CREATE INDEX IF NOT EXISTS idx_cascade_jobs_status_created
  ON cascade_jobs (status, created_at);
