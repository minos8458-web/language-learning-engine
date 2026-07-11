// db/pool.js
//
// PostgreSQL 커넥션 풀. 환경 변수(PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE)는
// node-postgres(pg)가 기본적으로 인식하는 이름을 그대로 사용한다 — 별도 설정
// 객체를 만들지 않고 new Pool()만 호출해도 pg가 process.env를 읽는다.
//
// PRODUCTION_ARCHITECTURE_OVERVIEW.md 결정 1(서버+DB, PostgreSQL)과
// DATA_PERSISTENCE_BRIEF.md §2(PostgreSQL + JSONB)를 따른다.
// 이 파일은 Phase 0 스캐폴딩 범위 — 스키마/마이그레이션 로직은 포함하지 않는다.

const { Pool } = require('pg');

const pool = new Pool();

module.exports = { pool };
