'use client';
import { useEffect, useState, useCallback } from 'react';
import { TEMPLATES } from '@/lib/templates';
import type { ScheduledMessage } from '@/lib/schedule';
import type { Client } from '@/lib/db';

interface TodayItem {
  client: Client;
  messages: ScheduledMessage[];
  checkedKeys: string[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium active:bg-green-200 transition-colors"
    >
      {copied ? '✅ コピーしました' : 'コピー'}
    </button>
  );
}

function MessageCard({
  msg,
  clientId: _clientId,
  checked,
  onToggle,
}: {
  msg: ScheduledMessage;
  clientId: number;
  checked: boolean;
  onToggle: (key: string, checked: boolean) => void;
}) {
  const template = TEMPLATES.find((t) => t.key === msg.key);
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border p-4 mb-3 transition-all ${checked ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-green-100 shadow-sm'}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(msg.key, !checked)}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            checked ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
          }`}
        >
          {checked && '✓'}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{msg.emoji}</span>
            <span className={`text-sm font-medium ${checked ? 'line-through text-gray-400' : ''}`}>
              {msg.title}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{msg.dayLabel}</div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-400 text-xs px-2 py-1 rounded border border-gray-200"
        >
          {open ? '閉じる' : '確認'}
        </button>
      </div>
      {open && template && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-stone-50 rounded-lg p-3 text-xs">
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

export default function TodayPage() {
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });

  const fetchToday = useCallback(async () => {
    const res = await fetch('/api/today');
    const data = await res.json();
    setItems(data as TodayItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchToday(); }, [fetchToday]);

  const handleToggle = async (clientId: number, key: string, checked: boolean) => {
    await fetch(`/api/clients/${clientId}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_key: key, checked }),
    });
    setItems((prev) =>
      prev.map((item) =>
        item.client.id === clientId
          ? {
              ...item,
              checkedKeys: checked
                ? [...item.checkedKeys, key]
                : item.checkedKeys.filter((k) => k !== key),
            }
          : item
      )
    );
  };

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-5 mb-5 text-white">
        <div className="text-xs opacity-80 mb-1">🌿 CHEKA GIFU</div>
        <div className="text-lg font-bold">今日のサポート</div>
        <div className="text-sm opacity-90 mt-1">{today}</div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">読み込み中...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">✨</div>
          <div className="text-gray-500 font-medium">今日送るメッセージはありません</div>
          <div className="text-gray-400 text-sm mt-1">お疲れさまです！</div>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.client.id} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                {item.client.name[0]}
              </div>
              <div>
                <div className="font-bold text-gray-800">{item.client.name}</div>
                <div className="text-xs text-gray-400">{item.client.plan}日プラン</div>
              </div>
              <div className="ml-auto text-xs text-gray-400">
                {item.checkedKeys.length}/{item.messages.length} 送信済
              </div>
            </div>
            {item.messages.map((msg) => (
              <MessageCard
                key={msg.key}
                msg={msg}
                clientId={item.client.id}
                checked={item.checkedKeys.includes(msg.key)}
                onToggle={(key, checked) => handleToggle(item.client.id, key, checked)}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
