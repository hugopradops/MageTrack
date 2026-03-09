import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Must import after mocking
import CriticScoresCard from '@/app/components/CriticScoresCard';

describe('CriticScoresCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton loader initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<CriticScoresCard />);
    expect(screen.getByText('Critic Scores')).toBeInTheDocument();
    expect(document.querySelector('.skeleton-loader')).toBeInTheDocument();
  });

  it('renders games after successful fetch', async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          games: [
            {
              id: 1,
              name: 'Test Game',
              score: 92,
              tier: 'Mighty',
              platforms: ['PC'],
              image: null,
              url: 'https://opencritic.com/game/1/test-game',
            },
          ],
        }),
    });

    render(<CriticScoresCard />);

    expect(await screen.findByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('Mighty')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<CriticScoresCard />);

    expect(await screen.findByText('Failed to load critic scores.')).toBeInTheDocument();
  });
});
