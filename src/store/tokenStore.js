

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
