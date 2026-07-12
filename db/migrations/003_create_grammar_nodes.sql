-- 003_create_grammar_nodes.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.3
-- concept_ids는 JSONB 배열(다대다 참조) — concepts에 대한 실제 FK 아님.

CREATE TABLE IF NOT EXISTS grammar_nodes (
  node_id        TEXT PRIMARY KEY,
  language       TEXT NOT NULL,
  concept_ids    JSONB NOT NULL DEFAULT '[]'::jsonb,
  label          TEXT NOT NULL,
  surface_forms  JSONB NOT NULL DEFAULT '[]'::jsonb,
  difficulty     SMALLINT NOT NULL
);
