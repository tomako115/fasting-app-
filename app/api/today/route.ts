import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getTodayMessages } from '@/lib/schedule';
import type { Client } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const db = getDB();
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const { results } = await db.prepare('SELECT * FROM clients').all();
  const clients = results as unknown as Client[];

  const todayItems = await Promise.all(
    clients.map(async (client) => {
      const messages = getTodayMessages(client.fasting_start_date, client.plan, today);
      if (messages.length === 0) return null;
      const { results: checks } = await db.prepare(
        'SELECT template_key FROM message_checks WHERE client_id = ?'
      ).bind(client.id).all();
      type CheckRow = { template_key: string };
      const checkedKeys = (checks as CheckRow[]).map((c) => c.template_key);
      return { client, messages, checkedKeys };
    })
  );

  return NextResponse.json(todayItems.filter(Boolean));
}
