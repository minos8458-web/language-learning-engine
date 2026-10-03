const { createHmac, timingSafeEqual } = require('node:crypto');

const HEADER = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'lle-guest+jwt' })).toString('base64url');
const ISSUER = 'lle-guest';
const AUDIENCE = 'lle-learning-api';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseGuestSigningKey(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value)) {
    throw new TypeError('guest signing key must be a canonical 32-byte base64url value');
  }
  const key = Buffer.from(value, 'base64url');
  if (key.length !== 32 || key.toString('base64url') !== value) {
    throw new TypeError('guest signing key must be a canonical 32-byte base64url value');
  }
  return key;
}

// A closed codec for this service's own tokens, not a general JWT library.
function createGuestTokenCodec({ signingKey, tokenTtlSeconds = 86400, now = Date.now } = {}) {
  if (!Buffer.isBuffer(signingKey) || signingKey.length !== 32) {
    throw new TypeError('a 32-byte guest signing key is required');
  }
  if (!Number.isInteger(tokenTtlSeconds) || tokenTtlSeconds < 1 || tokenTtlSeconds > 2592000) {
    throw new TypeError('guest token lifetime must be between 1 and 2592000 seconds');
  }
  if (typeof now !== 'function') throw new TypeError('now must be a function');
  const key = Buffer.from(signingKey);
  const seconds = () => {
    const time = now();
    if (!Number.isSafeInteger(time) || time < 0) throw new TypeError('invalid guest token clock');
    return Math.floor(time / 1000);
  };
  const mac = (input) => createHmac('sha256', key).update(input).digest();
  const claimsText = (claims) => JSON.stringify({
    iss: claims.iss, aud: claims.aud, sub: claims.sub, jti: claims.jti, iat: claims.iat, exp: claims.exp,
  });

  function issue(userId, authIdentifier) {
    if (typeof userId !== 'string' || !UUID.test(userId) ||
        typeof authIdentifier !== 'string' || !UUID.test(authIdentifier)) {
      throw new TypeError('guest token identities must be UUIDs');
    }
    const iat = seconds();
    const exp = iat + tokenTtlSeconds;
    const payload = Buffer.from(claimsText({ iss: ISSUER, aud: AUDIENCE, sub: userId, jti: authIdentifier, iat, exp })).toString('base64url');
    const input = `${HEADER}.${payload}`;
    return { accessToken: `${input}.${mac(input).toString('base64url')}`, expiresAt: new Date(exp * 1000).toISOString() };
  }

  function verify(token) {
    if (typeof token !== 'string' || token.length > 4096) return null;
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== HEADER ||
        !/^[A-Za-z0-9_-]+$/.test(parts[1]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[2])) return null;
    const signature = Buffer.from(parts[2], 'base64url');
    if (signature.length !== 32 || signature.toString('base64url') !== parts[2] ||
        !timingSafeEqual(signature, mac(`${parts[0]}.${parts[1]}`))) return null;
    const payload = Buffer.from(parts[1], 'base64url');
    if (payload.toString('base64url') !== parts[1]) return null;
    let claims, text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(payload);
      claims = JSON.parse(text);
    } catch { return null; }
    if (!claims || typeof claims !== 'object' || Array.isArray(claims) ||
        claimsText(claims) !== text || Object.keys(claims).length !== 6 ||
        claims.iss !== ISSUER || claims.aud !== AUDIENCE ||
        typeof claims.sub !== 'string' || !UUID.test(claims.sub) ||
        typeof claims.jti !== 'string' || !UUID.test(claims.jti) ||
        !Number.isSafeInteger(claims.iat) || !Number.isSafeInteger(claims.exp) ||
        claims.iat < 0 || claims.exp <= claims.iat || claims.exp - claims.iat > tokenTtlSeconds) return null;
    const current = seconds();
    if (claims.iat > current || claims.exp <= current) return null;
    return claims;
  }

  return { issue, verify };
}

module.exports = { createGuestTokenCodec, parseGuestSigningKey };
