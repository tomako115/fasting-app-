'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Client } from '@/lib/db';

function statusLabel(client: Client): { label: string; color: string } {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const start = new Date(client.fasting_start_date);
  const end = new Date(client.fasting_start_date);
  end.setDate(end.getDate() + client.plan + 4);
  const t = new Date(today);

  if (t < new Date(new Date(client.fasting_start_date).getTime() - 2 * 86400000)) {
    return { label: '準備前', color: 'bg-gray-100 text-gray-500' };
  }
  if (t < start) return { label: '準備食中', color: 'bg-yellow-100 text-yellow-700' };
  const fastEnd = new Date(client.fasting_start_date);
  fastEnd.setDate(fastEnd.getDate() + client.plan - 1);
  if (t <= fastEnd) {
    return { label: 'ファスティング中', color: 'bg-orange-100 text-orange-700' };
  }
  if (t <= end) return { label: '回復食中', color: 'bg-green-100 text-green-700' };
  return { label: '完了', color: 'bg-blue-100 text-blue-700' };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => { setClients(data as Client[]); setLoading(false); });
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">👥 クライアント</h1>
        <Link
          href="/clients/new"
          className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full active:bg-green-700"
        >
          ＋ 追加
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">読み込み中...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">👤</div>
          <div className="text-gray-500 font-medium">クライアントがいません</div>
          <Link href="/clients/new" className="mt-4 inline-block text-green-600 text-sm underline">
            最初のクライアントを追加する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
            const { label, color } = statusLabel(client);
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-4 active:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                    {client.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800">{client.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      開始日: {client.fasting_start_date} ／ {client.plan}日プラン
                    </div>
                  </div>
                  <div className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${color}`}>
                    {label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
