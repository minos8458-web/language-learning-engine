-- 011_add_aud002_spaced_review.sql
--
-- 근거: AUD-002(Independent Architecture Audit, Frozen Core Standard Amendment) —
-- PROGRESS_SCHEMA.md v1.1 §3(mastered_at), §4(is_spaced_review), DATA_PERSISTENCE_BRIEF.md
-- v1.10, MIGRATION_GUIDE.md Entry 003.
--
-- 001~010 기존 마이그레이션은 수정하지 않는다(미노 지시) — 이 파일만 새로 추가한다.
--
-- Backfill 정책: 기존 MASTERED/AUTOMATIC 행에 대한 mastered_at 소급 계산 정책은
-- MIGRATION_GUIDE.md Entry 003이 "별도 결정 필요"로 명시적으로 남겨둔 사항이다.
-- 이 마이그레이션은 임의로 backfill하지 않는다 — 기존 행은 mastered_at=NULL로 남는다.
-- (현재 재구성 환경은 Tier D 시딩 전의 빈 DB라 실질적 영향 없음 — 완료 보고 참고)

ALTER TABLE progress
  ADD COLUMN IF NOT EXISTS mastered_at TIMESTAMPTZ NULL;

ALTER TABLE attempt_records
  ADD COLUMN IF NOT EXISTS is_spaced_review BOOLEAN NOT NULL DEFAULT FALSE;
