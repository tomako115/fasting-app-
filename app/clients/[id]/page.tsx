'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildSchedule } from '@/lib/schedule';
import { TEMPLATES } from '@/lib/templates';
import type { Client } from '@/lib/db';
import type { ScheduledMessage } from '@/lib/schedule';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium"
    >
      {copied ? '✅ コピー済み' : 'コピー'}
    </button>
  );
}

function MessageRow({
  msg,
  checked,
  isToday,
  onToggle,
}: {
  msg: ScheduledMessage;
  checked: boolean;
  isToday: boolean;
  onToggle: (key: string, checked: boolean) => void;
}) {
  const template = TEMPLATES.find((t) => t.key === msg.key);
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border p-4 mb-2 transition-all ${
      checked ? 'bg-gray-50 border-gray-200 opacity-60' : isToday ? 'bg-green-50 border-green-300' : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(msg.key, !checked)}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            checked ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
          }`}
        >
          {checked && '✓'}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base">{msg.emoji}</span>
            <span className={`text-sm font-medium ${checked ? 'line-through text-gray-400' : ''}`}>
              {msg.title}
            </span>
            {isToday && !checked && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">今日</span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{msg.scheduledDate}（{msg.dayLabel}）</div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-400 text-xs px-2 py-1 rounded border border-gray-200 flex-shrink-0"
        >
          {open ? '閉' : '確認'}
        </button>
      </div>
      {open && template && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-stone-50 rounded-lg p-3">
            {template.body}
          </pre>
          <div className="mt-2 flex justify-end">
            <CopyButton text={template.body} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/clients/${id}`);
    if (!res.ok) { router.push('/clients'); return; }
    const data = await res.json() as { client: Client; checks: string[] };
    setClient(data.client);
    setCheckedKeys(data.checks);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  const handleToggle = async (key: string, checked: boolean) => {
    await fetch(`/api/clients/${id}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_key: key, checked }),
    });
    setCheckedKeys((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  const handleDelete = async () => {
    if (!confirm(`${client?.name}さんを削除しますか？`)) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    router.push('/clients');
  };

  if (loading) return <div className="p-4 text-center text-gray-400 py-10">読み込み中...</div>;
  if (!client) return null;

  const schedule = buildSchedule(client.fasting_start_date, client.plan);
  const sentCount = checkedKeys.length;

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/clients" className="text-gray-400 text-sm">← 戻る</Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
            {client.name[0]}
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg text-gray-800">{client.name}</div>
            <div className="text-sm text-gray-500">{client.plan}日プラン ／ 開始: {client.fasting_start_date}</div>
          </div>
        </div>
        {client.memo && (
          <div className="mt-3 text-sm text-gray-500 bg-stone-50 rounded-lg p-2.5">📝 {client.memo}</div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(sentCount / schedule.length) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">{sentCount}/{schedule.length} 送信済</div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">送信スケジュール</h2>
        {schedule.map((msg) => (
          <MessageRow
            key={msg.key}
            msg={msg}
            checked={checkedKeys.includes(msg.key)}
            isToday={msg.scheduledDate === today}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <button
        onClick={handleDelete}
        className="w-full text-red-400 text-sm py-3 border border-red-200 rounded-xl mt-2"
      >
        このクライアントを削除
      </button>
    </div>
  );
}
