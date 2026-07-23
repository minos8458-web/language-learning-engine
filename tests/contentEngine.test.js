const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pool } = require('../db/pool');
const { runMigrations } = require('../db/migrate');
const contentEngine = require('../src/engines/contentEngine');
const { createAiGenerationEngine } = require('../src/engines/aiGenerationEngine');
const { createGenerationEngine } = require('../src/engines/generationEngine');

async function rejectsWithCode(fn, code) {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    return true;
  });
}

const quizMedia = (text = 'alpha beta example') => [
  { media_format: 'TEXT', asset_ref: text, role: 'PRIMARY' },
];

describe('Content Engine (AC-017)', () => {
  before(async () => {
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await runMigrations();
    await pool.query(`
      INSERT INTO grammar_nodes (node_id, language, concept_ids, label, surface_forms, difficulty) VALUES
        ('GRAMMAR_VI_ALPHA', 'VI', '[]'::jsonb, 'alpha', '["alpha"]'::jsonb, 1),
        ('GRAMMAR_VI_BETA', 'VI', '[]'::jsonb, 'beta', '["beta"]'::jsonb, 4),
        ('GRAMMAR_VI_AC018_RECENT_ALPHA', 'VI', '[]'::jsonb, 'ac018 recent alpha', '["ac018 recent alpha"]'::jsonb, 1),
        ('GRAMMAR_VI_AC018_RECENT_BETA', 'VI', '[]'::jsonb, 'ac018 recent beta', '["ac018 recent beta"]'::jsonb, 4),
        ('GRAMMAR_EN_GAMMA', 'EN', '[]'::jsonb, 'gamma', '["gamma"]'::jsonb, 2)
    `);
    await pool.query(`
      INSERT INTO content
        (content_id, grammar_node_ids, content_type, media_assets, source, human_reviewed,
         is_canonical, difficulty, meta_language, version, author, is_active,
         type_specific_metadata)
      VALUES
        ('CONTENT_VI_ALPHA_EXAMPLE_1', '["GRAMMAR_VI_ALPHA"]'::jsonb, 'EXAMPLE',
         '[{"media_format":"TEXT","asset_ref":"human alpha","role":"PRIMARY"}]'::jsonb,
         'HUMAN_AUTHORED', true, true, 1, 'KO', 1, 'TEST', true, NULL)
    `);
  });

  after(async () => {
    await pool.end();
  });

  describe('get_content (7.1)', () => {
    test('supports exact content_id lookup', async () => {
      assert.deepEqual(await contentEngine.getContent(pool, 'CONTENT_VI_ALPHA_EXAMPLE_1'), {
        content_id: 'CONTENT_VI_ALPHA_EXAMPLE_1',
        grammar_node_ids: ['GRAMMAR_VI_ALPHA'],
        content_type: 'EXAMPLE',
        media_assets: [{ media_format: 'TEXT', asset_ref: 'human alpha', role: 'PRIMARY' }],
        difficulty: 1,
        type_specific_metadata: null,
      });
    });

    test('returns condition results and preserves normal empty', async () => {
      assert.equal((await contentEngine.getContent(pool, 'GRAMMAR_VI_ALPHA', 'EXAMPLE')).length, 1);
      assert.deepEqual(await contentEngine.getContent(pool, 'GRAMMAR_VI_BETA', 'EXAMPLE'), []);
    });

    test('rejects missing content and node IDs', async () => {
      await rejectsWithCode(
        () => contentEngine.getContent(pool, 'CONTENT_DOES_NOT_EXIST'),
        'INVALID_ID'
      );
      await rejectsWithCode(
        () => contentEngine.getContent(pool, 'GRAMMAR_VI_MISSING', 'EXAMPLE'),
        'INVALID_ID'
      );
    });
  });

  describe('save_generated_content (7.2)', () => {
    test('normalizes node order, computes MAX difficulty, ID, and fixed fields', async () => {
      const saved = await contentEngine.saveGeneratedContent(
        pool,
        ['GRAMMAR_VI_BETA', 'GRAMMAR_VI_ALPHA', 'GRAMMAR_VI_ALPHA'],
        'QUIZ',
        quizMedia(),
        { answer_key: 'answer' }
      );
      assert.deepEqual(Object.keys(saved).sort(), [
        'content_id',
        'content_type',
        'difficulty',
        'grammar_node_ids',
        'media_assets',
        'type_specific_metadata',
      ]);
      assert.match(
        saved.content_id,
        /^CONTENT_VI_ALPHA_QUIZ_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      assert.deepEqual(saved.grammar_node_ids, ['GRAMMAR_VI_ALPHA', 'GRAMMAR_VI_BETA']);
      assert.equal(saved.difficulty, 4);

      const { rows } = await pool.query(
        `SELECT source, human_reviewed, is_canonical, meta_language, version, author, is_active
           FROM content WHERE content_id = $1`,
        [saved.content_id]
      );
      assert.deepEqual(rows[0], {
        source: 'AI_GENERATED',
        human_reviewed: false,
        is_canonical: false,
        meta_language: 'KO',
        version: 1,
        author: 'LLE_AI_GENERATION_ENGINE',
        is_active: true,
      });
    });

    test('applies exact required and conditional validation', async () => {
      await rejectsWithCode(() => contentEngine.saveGeneratedContent(pool), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => contentEngine.saveGeneratedContent(pool, [], 'QUIZ', quizMedia(), { answer_key: 'a' }),
        'CONTRACT_VIOLATION'
      );
      await rejectsWithCode(
        () => contentEngine.saveGeneratedContent(pool, ['GRAMMAR_VI_ALPHA']),
        'MISSING_REQUIRED_FIELD'
      );
      await rejectsWithCode(
        () => contentEngine.saveGeneratedContent(pool, ['GRAMMAR_VI_ALPHA'], 'QUIZ'),
        'MISSING_REQUIRED_FIELD'
      );
      await rejectsWithCode(
        () => contentEngine.saveGeneratedContent(pool, ['GRAMMAR_VI_ALPHA'], 'QUIZ', quizMedia()),
        'MISSING_REQUIRED_FIELD'
      );
    });

    test('rejects non-exact media and QUIZ metadata', async () => {
      for (const mediaAssets of [
        [],
        [{ media_format: 'AUDIO', asset_ref: 'x', role: 'PRIMARY' }],
        [{ media_format: 'TEXT', asset_ref: ' ', role: 'PRIMARY' }],
        [{ media_format: 'TEXT', asset_ref: 'x', role: 'PRIMARY', extra: true }],
      ]) {
        await rejectsWithCode(
          () => contentEngine.saveGeneratedContent(
            pool,
            ['GRAMMAR_VI_ALPHA'],
            'QUIZ',
            mediaAssets,
            { answer_key: 'a' }
          ),
          'CONTRACT_VIOLATION'
        );
      }
      for (const metadata of [null, {}, { answer_key: '' }, { answer_key: 'a', extra: true }]) {
        await rejectsWithCode(
          () => contentEngine.saveGeneratedContent(
            pool,
            ['GRAMMAR_VI_ALPHA'],
            'QUIZ',
            quizMedia(),
            metadata
          ),
          'CONTRACT_VIOLATION'
        );
      }
    });

    test('rejects missing and mixed-language nodes without writing', async () => {
      const { rows: beforeRows } = await pool.query(
        "SELECT count(*) AS n FROM content WHERE author='LLE_AI_GENERATION_ENGINE'"
      );
      await rejectsWithCode(
        () => contentEngine.saveGeneratedContent(
          pool,
          ['GRAMMAR_VI_MISSING'],
          'QUIZ',
          quizMedia(),
          { answer_key: 'a' }
        ),
        'INVALID_ID'
      );
      await rejectsWithCode(
        () => contentEngine.saveGeneratedContent(
          pool,
          ['GRAMMAR_EN_GAMMA', 'GRAMMAR_VI_ALPHA'],
          'QUIZ',
          quizMedia(),
          { answer_key: 'a' }
        ),
        'CONTRACT_VIOLATION'
      );
      const { rows: afterRows } = await pool.query(
        "SELECT count(*) AS n FROM content WHERE author='LLE_AI_GENERATION_ENGINE'"
      );
      assert.equal(afterRows[0].n, beforeRows[0].n);
    });

    test('stores null metadata for non-QUIZ when omitted', async () => {
      const saved = await contentEngine.saveGeneratedContent(
        pool,
        ['GRAMMAR_VI_ALPHA'],
        'EXAMPLE',
        quizMedia('generated example')
      );
      assert.equal(saved.type_specific_metadata, null);
    });
  });

  describe('get_recent_generated_content (7.3)', () => {
    test('validates node arrays, language, existence, and language agreement', async () => {
      await rejectsWithCode(() => contentEngine.getRecentGeneratedContent(pool), 'MISSING_REQUIRED_FIELD');
      await rejectsWithCode(
        () => contentEngine.getRecentGeneratedContent(pool, ['GRAMMAR_VI_ALPHA']),
        'MISSING_REQUIRED_FIELD'
      );
      await rejectsWithCode(
        () => contentEngine.getRecentGeneratedContent(pool, [], 'VI'),
        'CONTRACT_VIOLATION'
      );
      await rejectsWithCode(
        () => contentEngine.getRecentGeneratedContent(pool, ['GRAMMAR_VI_MISSING'], 'VI'),
        'INVALID_ID'
      );
      await rejectsWithCode(
        () => contentEngine.getRecentGeneratedContent(pool, ['GRAMMAR_EN_GAMMA', 'GRAMMAR_VI_ALPHA'], 'VI'),
        'CONTRACT_VIOLATION'
      );
      await rejectsWithCode(
        () => contentEngine.getRecentGeneratedContent(pool, ['GRAMMAR_VI_ALPHA'], 'EN'),
        'CONTRACT_VIOLATION'
      );
    });

    test('uses superset matching, fixed limit 5, and deterministic order', async () => {
      const saved = [];
      for (let index = 0; index < 6; index += 1) {
        saved.push(
          await contentEngine.saveGeneratedContent(
            pool,
            ['GRAMMAR_VI_AC018_RECENT_ALPHA', 'GRAMMAR_VI_AC018_RECENT_BETA'],
            'QUIZ',
            quizMedia(`alpha beta recent ${index}`),
            { answer_key: `answer ${index}` }
          )
        );
      }
      const anyMatchOnly = await contentEngine.saveGeneratedContent(
        pool,
        ['GRAMMAR_VI_AC018_RECENT_ALPHA'],
        'QUIZ',
        quizMedia('alpha only'),
        { answer_key: 'alpha' }
      );
      for (let index = 0; index < saved.length; index += 1) {
        await pool.query('UPDATE content SET created_at=$1 WHERE content_id=$2', [
          new Date(Date.UTC(2026, 6, 23, 2, index)).toISOString(),
          saved[index].content_id,
        ]);
      }
      await pool.query('UPDATE content SET created_at=$1 WHERE content_id=$2', [
        '2026-07-23T03:00:00.000Z',
        anyMatchOnly.content_id,
      ]);

      const result = await contentEngine.getRecentGeneratedContent(
        pool,
        [
          'GRAMMAR_VI_AC018_RECENT_BETA',
          'GRAMMAR_VI_AC018_RECENT_ALPHA',
          'GRAMMAR_VI_AC018_RECENT_ALPHA',
        ],
        'VI'
      );
      assert.equal(result.length, 5);
      assert.deepEqual(result.map((item) => item.content_id), saved.slice(1).reverse().map((item) => item.content_id));
      assert.ok(!result.some((item) => item.content_id === anyMatchOnly.content_id));
      assert.deepEqual(Object.keys(result[0]).sort(), ['content_id', 'created_at', 'media_assets']);
      assert.match(result[0].created_at, /^2026-07-23T02:05:00\.000Z$/);
    });

    test('returns [] when no AI-generated superset exists', async () => {
      assert.deepEqual(
        await contentEngine.getRecentGeneratedContent(pool, ['GRAMMAR_EN_GAMMA'], 'EN'),
        []
      );
    });
  });

  test('runs the PostgreSQL-backed ladder step 1 with a contract-identical deterministic fake', async () => {
    const { rows: users } = await pool.query(
      `INSERT INTO users (auth_provider, auth_identifier, timezone)
       VALUES ('GUEST', 'ac018-vertical-user', 'UTC')
       RETURNING user_id`
    );
    const userId = users[0].user_id;
    await pool.query(
      `INSERT INTO progress (user_id, node_id, state) VALUES
        ($1, 'GRAMMAR_VI_ALPHA', 'PRACTICING'),
        ($1, 'GRAMMAR_VI_BETA', 'MASTERED')`,
      [userId]
    );

    const generationRequests = [];
    const validatorRequests = [];
    const providerAdapter = {
      async generateStructuredContent(request) {
        generationRequests.push(structuredClone(request));
        return {
          generated_text: 'alpha beta deterministic vertical',
          answer_key: 'vertical answer',
          self_reported_node_ids: ['UNTRUSTED_PROVIDER_HINT'],
        };
      },
      async validateGeneratedContent(request) {
        validatorRequests.push(structuredClone(request));
        return { is_valid: true, violations: [] };
      },
    };
    const aiGenerationEngine = createAiGenerationEngine({ providerAdapter });
    const generationEngine = createGenerationEngine({ aiGenerationEngine, contentEngine });
    const result = await generationEngine.generateProblem(
      pool,
      userId,
      'VI',
      undefined,
      'GRAMMAR_VI_UNUSED_TARGET'
    );

    assert.equal(result.ladder_step, 1);
    assert.equal(result.source, 'AI_GENERATED');
    assert.equal(result.content_id, result.content.content_id);
    assert.deepEqual(result.content.grammar_node_ids, ['GRAMMAR_VI_ALPHA', 'GRAMMAR_VI_BETA']);
    assert.deepEqual(result.content.type_specific_metadata, { answer_key: 'vertical answer' });
    assert.equal(generationRequests.length, 1);
    assert.equal(validatorRequests.length, 1);
    assert.deepEqual(generationRequests[0].grammar_nodes, [
      { node_id: 'GRAMMAR_VI_ALPHA', label: 'alpha' },
      { node_id: 'GRAMMAR_VI_BETA', label: 'beta' },
    ]);
    assert.deepEqual(generationRequests[0].regeneration_feedback, []);
    assert.deepEqual(Object.keys(result).sort(), ['content', 'content_id', 'ladder_step', 'source']);
  });

  test('Content Engine remains a leaf with only approved table access', () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/engines/contentEngine.js'), 'utf8');
    assert.doesNotMatch(source, /require\([^)]*Engine[^)]*\)/);
    assert.doesNotMatch(source, /\b(users|progress|attempt_records|grammar_relations)\b/i);
  });
});
