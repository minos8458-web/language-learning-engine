-- 004_create_grammar_relations.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.4
-- PREREQUISITE 관계는 항상 UNIDIRECTIONAL이어야 한다는 규칙은
-- VI_LANGUAGE_PACK.md §9 금지 사항에서 이미 확정된 것이므로,
-- 새 설계가 아니라 문서화된 불변식을 CHECK 제약으로 그대로 enforce한다.

DO $$ BEGIN
  CREATE TYPE relation_type_enum AS ENUM ('PREREQUISITE', 'RELATED', 'CONTRAST', 'ALTERNATIVE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE direction_enum AS ENUM ('UNIDIRECTIONAL', 'BIDIRECTIONAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS grammar_relations (
  relation_id    TEXT PRIMARY KEY,
  from_node_id   TEXT NOT NULL REFERENCES grammar_nodes(node_id),
  to_node_id     TEXT NOT NULL REFERENCES grammar_nodes(node_id),
  relation_type  relation_type_enum NOT NULL,
  direction      direction_enum NOT NULL,
  weight         NUMERIC NOT NULL,
  description    TEXT NOT NULL,
  CONSTRAINT grammar_relations_prereq_unidirectional
    CHECK (relation_type <> 'PREREQUISITE' OR direction = 'UNIDIRECTIONAL')
);

-- 참고: from_node_id/to_node_id에 대한 보조 인덱스는 DATA_PERSISTENCE_BRIEF.md §5의
-- 승인된 5개 인덱스 목록에 없어 이 마이그레이션에는 추가하지 않았다(DB_MIGRATION_DESIGN.md
-- 승인 범위 준수). 필요하면 별도 승인 후 010 또는 후속 마이그레이션에서 추가한다.
