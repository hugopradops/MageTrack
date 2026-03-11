import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

interface CriticGame {
  id: number;
  name: string;
  score: number;
  tier: string;
  releaseDate: string | null;
  platforms: string[];
  image: string | null;
  url: string;
}

interface CriticResult {
  games: CriticGame[];
}

function scoreTier(score: number): string {
  if (score >= 90) return 'Mighty';
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Fair';
  return 'Weak';
}

function platformList(p: { windows?: boolean; mac?: boolean; linux?: boolean }): string[] {
  const list: string[] = [];
  if (p.windows) list.push('PC');
  if (p.mac) list.push('Mac');
  if (p.linux) list.push('Linux');
  return list;
}

async function fetchAppDetails(appId: number): Promise<CriticGame | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}`,
      { headers: { 'User-Agent': 'MageTrack/1.0' } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const entry = json[String(appId)];
    if (!entry?.success) return null;

    const d = entry.data;
    const metacritic = d.metacritic;
    if (!metacritic || !metacritic.score) return null;

    return {
      id: appId,
      name: d.name,
      score: metacritic.score,
      tier: scoreTier(metacritic.score),
      releaseDate: d.release_date?.date || null,
      platforms: platformList(d.platforms || {}),
      image: d.header_image || null,
      url: `https://store.steampowered.com/app/${appId}`,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const cached = getCached<CriticResult>('metacritic', 60 * 60 * 1000);
  if (cached) return NextResponse.json(cached);

  try {
    // Gather app IDs from multiple Steam categories
    const [catRes, featRes] = await Promise.all([
      fetch('https://store.steampowered.com/api/featuredcategories/', {
        headers: { 'User-Agent': 'MageTrack/1.0' },
      }),
      fetch('https://store.steampowered.com/api/featured/', {
        headers: { 'User-Agent': 'MageTrack/1.0' },
      }),
    ]);

    if (!catRes.ok) throw new Error(`Steam categories returned ${catRes.status}`);

    const catData = await catRes.json();
    const featData = featRes.ok ? await featRes.json() : {};

    // Collect unique app IDs from top sellers, new releases, specials, and featured
    const idSet = new Set<number>();
    for (const key of ['top_sellers', 'new_releases', 'specials']) {
      for (const item of catData[key]?.items || []) {
        idSet.add(item.id);
      }
    }
    for (const item of featData.featured_win || []) {
      idSet.add(item.id);
    }

    const appIds = [...idSet];
    if (appIds.length === 0) throw new Error('No games found from Steam');

    // Fetch details for all apps in parallel
    const results = await Promise.all(appIds.map(fetchAppDetails));

    // Filter to games that have metacritic scores, keep discovery order
    const games = results.filter((g): g is CriticGame => g !== null).slice(0, 9);

    const result: CriticResult = { games };
    if (games.length > 0) setCache('metacritic', result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Steam critic scores error:', (err as Error).message);
    return NextResponse.json({ error: 'Failed to load critic scores' }, { status: 500 });
  }
}
