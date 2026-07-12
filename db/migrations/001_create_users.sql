-- 001_create_users.sql
--
-- 근거: DATA_PERSISTENCE_BRIEF.md §3.1
--
-- Nullability 해석 규칙(전체 마이그레이션 공통, DB_MIGRATION_DESIGN.md 승인분):
-- 문서에 "NULL 허용"이 명시된 컬럼만 NULL을 허용한다. 나머지는 NOT NULL로 구현한다.
-- 이 규칙은 문서에 없는 세부사항에 대한 해석적 판단이므로, 실제와 다르면 보고 요청.
--
-- target_language 컬럼은 만들지 않는다(§1 보류 결정 — 향후 Enrollment 엔터티 검토 대상).

DO $$ BEGIN
  CREATE TYPE auth_provider_enum AS ENUM ('GUEST', 'EMAIL', 'OAUTH_GOOGLE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_provider   auth_provider_enum NOT NULL,
  auth_identifier TEXT NOT NULL,
  display_name    TEXT NULL,
  timezone        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at    TIMESTAMPTZ NULL
);
