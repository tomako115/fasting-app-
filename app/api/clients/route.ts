import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  const { results } = await db.prepare(
    'SELECT * FROM clients ORDER BY fasting_start_date ASC'
  ).all();
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { name: string; plan: number; fasting_start_date: string; memo: string };
  const { name, plan, fasting_start_date, memo } = body;
  if (!name || !fasting_start_date) {
    return NextResponse.json({ error: '名前と開始日は必須です' }, { status: 400 });
  }
  const db = getDB();
  const result = await db.prepare(
    'INSERT INTO clients (name, plan, fasting_start_date, memo) VALUES (?, ?, ?, ?)'
  ).bind(name, plan || 3, fasting_start_date, memo || '').run();
  return NextResponse.json({ id: result.meta.last_row_id }, { status: 201 });
}
