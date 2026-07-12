-- 005_create_content.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.5
--
-- AC-004(explanation_level) 반영: 별도 ALTER 없이 최초 CREATE TABLE에 포함.
-- AC-011(error_attributed_node_id) 반영: 별도 컬럼이 아니라 기존 type_specific_metadata
-- JSONB 안에서 애플리케이션 레벨로 사용하는 키(SELF/TRANSFER 진단, DOMAIN_LOGIC_BRIEF.md §5.1).
-- 스키마 자체는 type_specific_metadata 컬럼만 있으면 되므로 별도 DDL 변경 없음 — 이 주석으로
-- 위치만 명시해둔다.
--
-- is_canonical 유일성(§3.5: "같은 (노드, content_type) 조합에서 최대 1개")은 grammar_node_ids가
-- JSONB 배열이라 단순 UNIQUE 인덱스로 표현할 수 없다 — vocabulary.irregular_surface_forms 검증과
-- 같은 성격으로 애플리케이션 레벨(Content Engine) 책임으로 남겨둔다(DB_MIGRATION_DESIGN.md
-- 승인 범위 밖의 트리거 설계를 임의로 추가하지 않음).

DO $$ BEGIN
  CREATE TYPE content_type_enum AS ENUM (
    'EXPLANATION', 'EXAMPLE', 'QUIZ', 'MINIMAL_PAIR', 'DIALOGUE',
    'LISTENING', 'SHADOWING', 'CONVERSATION_SEED', 'TRANSFER_EXERCISE', 'ERROR_PATTERN'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_source_enum AS ENUM ('HUMAN_AUTHORED', 'AI_GENERATED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS content (
  content_id              TEXT PRIMARY KEY,
  grammar_node_ids        JSONB NOT NULL,
  content_type            content_type_enum NOT NULL,
  media_assets            JSONB NOT NULL DEFAULT '[]'::jsonb,
  source                  content_source_enum NOT NULL,
  human_reviewed          BOOLEAN NOT NULL,
  is_canonical            BOOLEAN NOT NULL DEFAULT false,
  difficulty               SMALLINT NOT NULL,
  meta_language            TEXT NOT NULL,
  version                  INTEGER NOT NULL DEFAULT 1,
  author                   TEXT NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active                BOOLEAN NOT NULL DEFAULT true,
  explanation_level        TEXT NULL,
  type_specific_metadata   JSONB NULL,
  CONSTRAINT content_grammar_node_ids_nonempty
    CHECK (jsonb_typeof(grammar_node_ids) = 'array' AND jsonb_array_length(grammar_node_ids) >= 1)
);
