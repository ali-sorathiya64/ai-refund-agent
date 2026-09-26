
const tokens = new Map(); 
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
