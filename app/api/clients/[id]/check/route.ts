import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json() as { template_key: string; checked: boolean };
  const { template_key, checked } = body;
  const db = getDB();
  if (checked) {
    await db.prepare(
      'INSERT OR IGNORE INTO message_checks (client_id, template_key) VALUES (?, ?)'
    ).bind(id, template_key).run();
  } else {
    await db.prepare(
      'DELETE FROM message_checks WHERE client_id = ? AND template_key = ?'
    ).bind(id, template_key).run();
  }
  return NextResponse.json({ ok: true });
}
