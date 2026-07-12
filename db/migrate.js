// db/migrate.js
//
// LLE Production 마이그레이션 러너.
//
// 설계 근거: DB_MIGRATION_DESIGN.md §6(재실행 멱등성 전략) + 미노 추가 결정
// (schema_migrations는 별도 000 마이그레이션 파일로 만들지 않고, 이 러너가 최초 실행
// 시 자동 생성한다 — LLE 도메인 스키마(001~010)와 러너 내부 관리 테이블을 분리하기 위함).
//
// 동작 방식:
//   1. schema_migrations 테이블이 없으면 만든다(이 파일이 유일한 생성 지점).
//   2. db/migrations/*.sql 파일을 이름순(001, 002, ...)으로 정렬해 읽는다.
//   3. 각 파일에 대해, schema_migrations에 이미 기록된 filename이면 건너뛴다(SKIP).
//   4. 기록되지 않은 파일만 트랜잭션 안에서 실행하고, 성공하면 같은 트랜잭션에서
//      schema_migrations에 기록한다(파일 실행 성공과 기록이 원자적으로 함께 일어남).
//   5. 개별 .sql 파일 자체도 CREATE TABLE/INDEX IF NOT EXISTS, CREATE TYPE ... EXCEPTION
//      duplicate_object 패턴을 쓰므로, 혹시 schema_migrations 기록이 유실된 채로
//      재실행되더라도 에러 없이 안전하게 통과한다(이중 안전장치).

const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

function listMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // 파일명이 001_, 002_ ... 로 시작하므로 문자열 정렬 = 순서 정렬
}

async function getAppliedFilenames(client) {
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

/**
 * 마이그레이션을 전부 적용한다. 이미 적용된 파일은 SKIP한다.
 * @returns {{ applied: string[], skipped: string[] }}
 */
async function runMigrations() {
  const client = await pool.connect();
  const applied = [];
  const skipped = [];
  try {
    await ensureMigrationsTable(client);
    const already = await getAppliedFilenames(client);
    const files = listMigrationFiles();

    for (const filename of files) {
      if (already.has(filename)) {
        skipped.push(filename);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        applied.push(filename);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`마이그레이션 실패: ${filename}\n${err.message}`);
      }
    }

    return { applied, skipped };
  } finally {
    client.release();
  }
}

module.exports = { runMigrations, listMigrationFiles, MIGRATIONS_DIR };

// CLI로 직접 실행했을 때만 동작(테스트에서 require할 때는 자동 실행되지 않음)
if (require.main === module) {
  runMigrations()
    .then(({ applied, skipped }) => {
      console.log(`적용됨: ${applied.length}건 ${applied.join(', ')}`);
      console.log(`건너뜀(이미 적용됨): ${skipped.length}건`);
      return pool.end();
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
