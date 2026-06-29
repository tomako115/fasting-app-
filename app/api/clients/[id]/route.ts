import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const client = await db.prepare('SELECT * FROM clients WHERE id = ?').bind(id).first();
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { results: checks } = await db.prepare(
    'SELECT template_key FROM message_checks WHERE client_id = ?'
  ).bind(id).all();
  type CheckRow = { template_key: string };
  return NextResponse.json({ client, checks: (checks as CheckRow[]).map((c) => c.template_key) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  await db.prepare('DELETE FROM clients WHERE id = ?').bind(id).run();
  return NextResponse.json({ ok: true });
}
