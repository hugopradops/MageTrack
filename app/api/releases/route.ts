import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';
import { decodeHTMLEntities } from '@/lib/utils';

interface Game {
  name: string;
  released: string | null;
  comingSoon: boolean;
  image: string | null;
  platforms: string[];
  genres: string[];
  description: string;
  appid: string;
}

interface ReleasesResult {
  games: Game[];
}

function formatPlatforms(
  platforms: {
    windows?: boolean;
    mac?: boolean;
    linux?: boolean;
  } | null,
): string[] {
  if (!platforms) return [];
  const result: string[] = [];
  if (platforms.windows) result.push('PC');
  if (platforms.mac) result.push('Mac');
  if (platforms.linux) result.push('Linux');
  return result;
}

function entryToGame(entry: {
  appid: string;
  name: string;
  searchImage: string | null;
}): Game {
  return {
    name: entry.name,
    released: null,
    comingSoon: true,
    image: entry.searchImage
      ? entry.searchImage.replace('capsule_sm_120', 'header')
      : null,
    platforms: [],
    genres: [],
    description: '',
    appid: entry.appid,
  };
}

async function fetchSteamMostWishlisted(): Promise<Game[]> {
  const searchUrl =
    'https://store.steampowered.com/search/results?sort_by=_ASC&filter=popularwishlist&category1=998&infinite=1&count=50';
  const searchResp = await fetch(searchUrl, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  });

  if (!searchResp.ok) {
    console.error('Steam search failed:', searchResp.status);
    return [];
  }

  const searchData = await searchResp.json();
  const html: string = searchData.results_html || '';

  const appIdMatches = [...html.matchAll(/data-ds-appid="(\d+)"/g)];
  const titleMatches = [...html.matchAll(/<span class="title">(.*?)<\/span>/g)];
  const imageMatches = [...html.matchAll(/src="(https:\/\/[^"]*capsule[^"]+)"/g)];

  const entries: { appid: string; name: string; searchImage: string | null }[] = [];
  for (let i = 0; i < Math.min(appIdMatches.length, titleMatches.length); i++) {
    entries.push({
      appid: appIdMatches[i][1],
      name: decodeHTMLEntities(titleMatches[i][1]),
      searchImage: imageMatches[i] ? imageMatches[i][1] : null,
    });
  }

  const detailPromises = entries.slice(0, 40).map(async (entry) => {
    try {
      const detailUrl = `https://store.steampowered.com/api/appdetails?appids=${entry.appid}`;
      const resp = await fetch(detailUrl);
      if (!resp.ok) return entryToGame(entry);
      const data = await resp.json();
      const appData = data[entry.appid];
      if (!appData || !appData.success) return entryToGame(entry);

      const d = appData.data;
      return {
        name: d.name || entry.name,
        released: d.release_date ? d.release_date.date : null,
        comingSoon: d.release_date ? d.release_date.coming_soon : true,
        image: d.header_image || entry.searchImage,
        platforms: formatPlatforms(d.platforms),
        genres: (d.genres || [])
          .map((g: { description: string }) => g.description)
          .slice(0, 3),
        description: d.short_description || '',
        appid: entry.appid,
      } as Game;
    } catch {
      return entryToGame(entry);
    }
  });

  const games = await Promise.all(detailPromises);

  const dated = games.filter((g) => {
    if (!g.released) return false;
    const lower = g.released.toLowerCase().trim();
    if (
      lower.includes('to be announced') ||
      lower.includes('coming soon') ||
      lower === 'tba'
    )
      return false;
    if (/^\d{4}$/.test(lower) || /^q\d/i.test(lower)) return false;
    const parsed = new Date(g.released);
    if (isNaN(parsed.getTime())) return false;
    const hasDay =
      /\d{1,2}\s+\w+,?\s+\d{4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}/.test(
        g.released,
      );
    return hasDay;
  });

  dated.sort((a, b) => new Date(a.released!).getTime() - new Date(b.released!).getTime());

  return dated;
}

export async function GET() {
  const cached = getCached<ReleasesResult>('releases', 60 * 60 * 1000);
  if (cached) return NextResponse.json(cached);

  try {
    const games = await fetchSteamMostWishlisted();
    const result: ReleasesResult = { games };
    if (games.length > 0) {
      setCache('releases', result);
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('Releases error:', (err as Error).message);
    return NextResponse.json({ games: [] });
  }
}
