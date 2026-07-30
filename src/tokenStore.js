
const store = new Map();

export function getSession(sessionId) {
    if (!store.has(sessionId)) {
        store.set(sessionId, {
            tokens: null,
            threadId: sessionId, 
            pendingInterrupt: null,
        });
    }
    return store.get(sessionId);
}

export function saveTokens(sessionId, tokens) {
    const session = getSession(sessionId);
    session.tokens = tokens;
}

export function savePendingInterrupt(sessionId, interrupt) {
    const session = getSession(sessionId);
    session.pendingInterrupt = interrupt;
}

export function clearPendingInterrupt(sessionId) {
    const session = getSession(sessionId);
    session.pendingInterrupt = null;
}
