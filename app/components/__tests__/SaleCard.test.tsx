import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import SaleCard from '@/app/components/SaleCard';

describe('SaleCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton loader initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<SaleCard />);
    expect(screen.getByText('Next Steam Sale')).toBeInTheDocument();
    expect(document.querySelector('.skeleton-loader')).toBeInTheDocument();
  });

  it('renders sale countdown after fetch', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 10).toISOString();
    const endDate = new Date(Date.now() + 86400000 * 17).toISOString();

    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          next: { name: 'Summer Sale', start: futureDate, end: endDate },
          active: false,
        }),
    });

    render(<SaleCard />);

    expect(await screen.findByText('Summer Sale')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Sec')).toBeInTheDocument();
  });

  it('renders LIVE NOW badge when sale is active', async () => {
    const pastStart = new Date(Date.now() - 86400000).toISOString();
    const futureEnd = new Date(Date.now() + 86400000 * 5).toISOString();

    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          next: { name: 'Winter Sale', start: pastStart, end: futureEnd },
          active: true,
        }),
    });

    render(<SaleCard />);

    expect(await screen.findByText('Winter Sale')).toBeInTheDocument();
    expect(screen.getByText(/LIVE NOW/)).toBeInTheDocument();
  });

  it('renders no sales message', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ next: null, active: false }),
    });

    render(<SaleCard />);

    expect(await screen.findByText('No upcoming sales found.')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('fail'));

    render(<SaleCard />);

    expect(await screen.findByText('Failed to load sale data.')).toBeInTheDocument();
  });
});
