// Explicitly selected trusted host module. No default or randomly generated signing key.
const { parseGuestSigningKey } = require('../src/server/guestTokenCodec');
const { createPostgresGuestHost } = require('../src/server/postgresGuestHost');

const signingKey = parseGuestSigningKey(process.env.LLE_GUEST_SIGNING_KEY);
const tokenTtlSeconds = process.env.LLE_GUEST_TOKEN_TTL_SECONDS === undefined ? 86400 :
  Number(process.env.LLE_GUEST_TOKEN_TTL_SECONDS);
const defaultTimezone = process.env.LLE_GUEST_TIMEZONE === undefined ? 'UTC' : process.env.LLE_GUEST_TIMEZONE;
const { pool } = require('../db/pool');

module.exports = createPostgresGuestHost({ pool, signingKey, tokenTtlSeconds, defaultTimezone });
