/**
 * ⚠️ In-memory store — good enough for a demo / portfolio project.
 * Tokens are lost when the server restarts, and this won't work if you
 * ever run multiple server instances (no shared state).
 *
 * For production, swap this out for a real database (Postgres/Mongo/Redis)
 * keyed by user id, with tokens encrypted at rest.
 */

const tokens = new Map(); // sessionId -> { access_token, refresh_token, expiry_date, ... }

export function saveTokens(sessionId, tokenData) {
  tokens.set(sessionId, tokenData);
}

export function getTokens(sessionId) {
  return tokens.get(sessionId);
}

export function hasTokens(sessionId) {
  return tokens.has(sessionId);
}

export function clearTokens(sessionId) {
  tokens.delete(sessionId);
}
