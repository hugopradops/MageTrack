import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import NewsCard from '@/app/components/NewsCard';

describe('NewsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton loader initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<NewsCard />);
    expect(screen.getByText('Gaming News')).toBeInTheDocument();
    expect(document.querySelector('.skeleton-loader')).toBeInTheDocument();
  });

  it('renders articles after fetch', async () => {
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          articles: [
            {
              title: 'Breaking News',
              link: 'https://example.com/1',
              date: new Date().toISOString(),
              source: 'PC Gamer',
            },
            {
              title: 'Another Article',
              link: 'https://example.com/2',
              date: new Date().toISOString(),
              source: 'Kotaku',
            },
          ],
        }),
    });

    render(<NewsCard />);

    expect(await screen.findByText('Breaking News')).toBeInTheDocument();
    expect(screen.getByText('Another Article')).toBeInTheDocument();
    expect(screen.getByText('PC Gamer')).toBeInTheDocument();
    expect(screen.getByText('Kotaku')).toBeInTheDocument();
  });

  it('renders pagination and changes page', async () => {
    const articles = Array.from({ length: 8 }, (_, i) => ({
      title: `Article ${i + 1}`,
      link: `https://example.com/${i}`,
      date: new Date().toISOString(),
      source: 'PC Gamer',
    }));

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ articles }),
    });

    render(<NewsCard />);

    // Wait for articles to load
    expect(await screen.findByText('Article 1')).toBeInTheDocument();

    // Should show pagination (5 per page, 8 articles = 2 pages)
    const page2Btn = screen.getByRole('button', { name: 'Page 2' });
    expect(page2Btn).toBeInTheDocument();

    // Click page 2
    await userEvent.click(page2Btn);

    // Articles 6-8 should now be visible
    expect(screen.getByText('Article 6')).toBeInTheDocument();
    expect(screen.queryByText('Article 1')).not.toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('fail'));

    render(<NewsCard />);

    expect(await screen.findByText('Failed to load news.')).toBeInTheDocument();
  });

  it('renders empty state when no articles', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ articles: [] }),
    });

    render(<NewsCard />);

    expect(await screen.findByText('No news available right now.')).toBeInTheDocument();
  });
});
