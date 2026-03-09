// Simple in-memory cache for API route handlers
const cache: Record<string, { data: unknown; time: number }> = {};

export function getCached<T>(key: string, ttlMs: number): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.time < ttlMs) return entry.data as T;
  return null;
}

export function setCache(key: string, data: unknown): void {
  cache[key] = { data, time: Date.now() };
}
