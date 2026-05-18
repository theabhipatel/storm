// In-memory access token singleton. Never localStorage / sessionStorage.
// Cleared on logout, refilled by silent /refresh interceptor + AuthBootstrap.

let accessToken: string | null = null;
let listeners: Array<(token: string | null) => void> = [];

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null): void {
    accessToken = token;
    for (const fn of listeners) fn(token);
  },
  subscribe(fn: (token: string | null) => void): () => void {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },
};
