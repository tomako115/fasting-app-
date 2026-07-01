'use client';
import { useState } from 'react';
import { TEMPLATES, PETIT_KNOWLEDGE } from '@/lib/templates';

type AnyTemplate = { key: string; title: string; emoji: string; body: string };

function TemplateCard({ template }: { template: AnyTemplate }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-3 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left active:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <span className="text-2xl">{template.emoji}</span>
        <span className="flex-1 font-medium text-gray-800 text-sm">{template.title}</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-stone-50 rounded-lg p-3 mt-3">
            {template.body}
          </pre>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleCopy}
              className="text-sm px-4 py-2 rounded-full bg-green-600 text-white font-medium active:bg-green-700"
            >
              {copied ? '✅ コピーしました！' : 'コピーする'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  const [tab, setTab] = useState<'templates' | 'knowledge'>('templates');
  const [search, setSearch] = useState('');

  const list: AnyTemplate[] = tab === 'templates' ? TEMPLATES : PETIT_KNOWLEDGE;
  const filtered = list.filter((t) =>
    t.title.includes(search) || t.body.includes(search)
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📋 テンプレート</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('templates')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'templates' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          📨 送信テンプレート
        </button>
        <button
          onClick={() => setTab('knowledge')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'knowledge' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          💡 プチ知識
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 検索..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-8">見つかりませんでした</div>
      ) : (
        filtered.map((t) => <TemplateCard key={t.key} template={t} />)
      )}
    </div>
  );
}
