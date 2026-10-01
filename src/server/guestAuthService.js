const { randomUUID } = require('node:crypto');
const { createGuestTokenCodec } = require('./guestTokenCodec');

function createGuestAuthService({ pool, signingKey, defaultTimezone = 'UTC', tokenTtlSeconds, now } = {}) {
  if (!pool || typeof pool.query !== 'function') throw new TypeError('a query-capable pool is required');
  if (typeof defaultTimezone !== 'string' || !defaultTimezone || /^[+-]/.test(defaultTimezone)) {
    throw new TypeError('a named IANA timezone is required');
  }
  // Validate host configuration before any INSERT. This is not a device-timezone guess.
  new Intl.DateTimeFormat('en', { timeZone: defaultTimezone });
  const codec = createGuestTokenCodec({ signingKey, tokenTtlSeconds, now });

  async function createGuest({ signal } = {}) {
    signal?.throwIfAborted();
    const userId = randomUUID();
    const authIdentifier = randomUUID();
    // Prepare safely before writing, but never release a credential before storage completes.
    const token = codec.issue(userId, authIdentifier);
    const result = await pool.query(
      `INSERT INTO users (user_id, auth_provider, auth_identifier, display_name, timezone, converted_at)
       VALUES ($1, 'GUEST', $2, NULL, $3, NULL)
       RETURNING user_id`,
      [userId, authIdentifier, defaultTimezone]
    );
    signal?.throwIfAborted();
    if (!Array.isArray(result?.rows) || result.rows.length !== 1 ||
        result.rows[0].user_id !== userId || !codec.verify(token.accessToken)) {
      throw new Error('guest storage confirmation unavailable');
    }
    return { user_id: userId, access_token: token.accessToken, token_type: 'Bearer', expires_at: token.expiresAt };
  }

  async function resolveUserId(token, { signal } = {}) {
    signal?.throwIfAborted();
    const claims = codec.verify(token);
    if (!claims) return null;
    const result = await pool.query(
      `SELECT user_id FROM users
        WHERE user_id = $1 AND auth_provider = 'GUEST' AND auth_identifier = $2`,
      [claims.sub, claims.jti]
    );
    signal?.throwIfAborted();
    if (!Array.isArray(result?.rows) || result.rows.length > 1) throw new Error('guest lookup unavailable');
    if (result.rows.length === 0) return null;
    if (result.rows[0].user_id !== claims.sub) throw new Error('guest lookup unavailable');
    // Do not accept a credential that expired while the database lookup was pending.
    if (!codec.verify(token)) return null;
    return claims.sub;
  }

  return { createGuest, resolveUserId };
}

module.exports = { createGuestAuthService };
