import { describe, it, expect, beforeEach } from 'vitest';
import { getCached, setCache } from '@/lib/cache';

describe('cache', () => {
  beforeEach(() => {
    // Clear cache state between tests by setting expired entries
    setCache('__test', null);
  });

  it('returns null for a cache miss', () => {
    expect(getCached('nonexistent', 60000)).toBeNull();
  });

  it('returns cached data within TTL', () => {
    setCache('mykey', { foo: 'bar' });
    expect(getCached('mykey', 60000)).toEqual({ foo: 'bar' });
  });

  it('returns null for expired entries', () => {
    // Manually test by setting a very short TTL
    setCache('expire-test', 'data');
    // With TTL of 0, it should be expired immediately
    expect(getCached('expire-test', 0)).toBeNull();
  });

  it('overwrites previous cache entries', () => {
    setCache('overwrite', 'first');
    setCache('overwrite', 'second');
    expect(getCached('overwrite', 60000)).toBe('second');
  });
});
