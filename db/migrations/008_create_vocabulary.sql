-- 008_create_vocabulary.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.7
--
-- PARTICLE 반영: 과거 코드베이스는 11종으로 만들고 나중에(migration 012)
-- ALTER TYPE ... ADD VALUE로 PARTICLE을 추가했으나, 지금은 DATA_PERSISTENCE_BRIEF.md
-- §3.7이 처음부터 12종(PARTICLE 포함)으로 명시하므로 최초 생성 시 바로 포함한다
-- (DB_MIGRATION_DESIGN.md 승인분). 최종 스키마 결과는 과거와 동일.
--
-- irregular_surface_forms의 규칙형 중복 저장 금지 검증(work+-ed=worked 금지 등)은
-- SQL 제약으로 표현 불가 — §3.7이 명시한 대로 애플리케이션 레벨(Domain Logic) 책임.

DO $$ BEGIN
  CREATE TYPE pos_enum AS ENUM (
    'NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PRONOUN', 'PREPOSITION',
    'CONJUNCTION', 'DETERMINER', 'INTERJECTION', 'CLASSIFIER', 'NUMERAL', 'PARTICLE'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS vocabulary (
  vocab_id                  TEXT PRIMARY KEY,
  lemma                     TEXT NOT NULL,
  language                  TEXT NOT NULL,
  pos                       pos_enum NOT NULL,
  canonical_gloss           TEXT NOT NULL,
  irregular_surface_forms   JSONB NOT NULL DEFAULT '[]'::jsonb,
  features                  JSONB NULL,
  pronunciation_ref         TEXT NULL,
  phonetic_ref              TEXT NULL
);
