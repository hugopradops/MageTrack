import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), 'data', 'steam-sales.json'),
      'utf-8'
    );
    const data = JSON.parse(raw);
    const now = new Date();

    const upcoming = data.sales
      .map((s: { name: string; start: string; end: string }) => ({
        ...s,
        startDate: new Date(s.start),
        endDate: new Date(s.end),
      }))
      .filter((s: { endDate: Date }) => s.endDate > now)
      .sort(
        (a: { startDate: Date }, b: { startDate: Date }) =>
          a.startDate.getTime() - b.startDate.getTime()
      );

    const next = upcoming[0] || null;
    const active = next && next.startDate <= now;

    return NextResponse.json({ next, active, allUpcoming: upcoming });
  } catch (err) {
    console.error('Steam sales error:', (err as Error).message);
    return NextResponse.json(
      { error: 'Failed to load steam sales data' },
      { status: 500 }
    );
  }
}
