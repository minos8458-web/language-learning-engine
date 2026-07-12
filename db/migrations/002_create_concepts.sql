-- 002_create_concepts.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.2
-- Tier A(CONCEPT_SCHEMA.md)가 정의한 논리적 엔터티의 물리 테이블화.
-- prerequisite_concept_ids/relationships는 JSONB 배열 — 실제 FK 제약 없음
-- (concept_id는 문자열 slug라 배열 원소 단위 FK는 애플리케이션 검증 책임).

CREATE TABLE IF NOT EXISTS concepts (
  concept_id                TEXT PRIMARY KEY,
  category                  TEXT NOT NULL,
  function                  TEXT NOT NULL,
  difficulty                SMALLINT NOT NULL,
  prerequisite_concept_ids  JSONB NOT NULL DEFAULT '[]'::jsonb,
  relationships             JSONB NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT concepts_difficulty_range CHECK (difficulty BETWEEN 1 AND 5)
);
