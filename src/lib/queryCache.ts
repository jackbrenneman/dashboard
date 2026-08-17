// In-memory cache so panel data (todos, meals, foods, calendar) survives
// switching between routed dashboard tabs instead of refetching every mount.
// Lives for the page session only — cleared on a full reload.
const store = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  store.set(key, value);
}

export function clearCachedPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
