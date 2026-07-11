// tests/dbPool.healthcheck.test.js
//
// Phase 0 스캐폴딩 검증용 — db/pool.js가 실제로 PostgreSQL에 연결되는지만 확인한다.
// 스키마·테이블에 의존하지 않는 최소 쿼리(SELECT 1)만 사용 — Phase 1 이전이라
// 아직 어떤 테이블도 존재하지 않는다.

const { test, describe, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../db/pool');

describe('db/pool.js healthcheck', () => {
  after(async () => {
    await pool.end();
  });

  test('PostgreSQL에 연결되고 SELECT 1이 정상 반환된다', async () => {
    const { rows } = await pool.query('SELECT 1 AS ok');
    assert.equal(rows[0].ok, 1);
  });

  test('풀 설정이 환경 변수(PGDATABASE)를 그대로 사용한다', async () => {
    const { rows } = await pool.query('SELECT current_database() AS db');
    assert.equal(rows[0].db, process.env.PGDATABASE || 'lle_dev');
  });
});
