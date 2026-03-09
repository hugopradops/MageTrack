import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs and path before importing the route
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

vi.mock('path', () => ({
  default: {
    join: vi.fn((...args: string[]) => args.join('/')),
  },
}));

import fs from 'fs';
import { GET } from '@/app/api/steam-sales/route';

const mockReadFileSync = vi.mocked(fs.readFileSync);

describe('GET /api/steam-sales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the next upcoming sale', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 10).toISOString();
    const endDate = new Date(Date.now() + 86400000 * 17).toISOString();

    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        sales: [{ name: 'Test Sale', start: futureDate, end: endDate }],
      }),
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.next).not.toBeNull();
    expect(data.next.name).toBe('Test Sale');
    expect(data.active).toBe(false);
  });

  it('returns active=true when sale has started', async () => {
    const pastStart = new Date(Date.now() - 86400000).toISOString();
    const futureEnd = new Date(Date.now() + 86400000 * 5).toISOString();

    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        sales: [{ name: 'Active Sale', start: pastStart, end: futureEnd }],
      }),
    );

    const response = await GET();
    const data = await response.json();

    expect(data.active).toBe(true);
    expect(data.next.name).toBe('Active Sale');
  });

  it('returns next=null when no upcoming sales', async () => {
    const pastEnd = new Date(Date.now() - 86400000).toISOString();
    const pastStart = new Date(Date.now() - 86400000 * 7).toISOString();

    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        sales: [{ name: 'Old Sale', start: pastStart, end: pastEnd }],
      }),
    );

    const response = await GET();
    const data = await response.json();

    expect(data.next).toBeNull();
  });

  it('returns 500 on file read error', async () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    const response = await GET();
    expect(response.status).toBe(500);
  });
});
