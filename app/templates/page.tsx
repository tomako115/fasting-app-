'use client';
import { useState } from 'react';
import { TEMPLATES, PETIT_KNOWLEDGE, FAQS } from '@/lib/templates';

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

function FaqCard({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(faq.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-3 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left active:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <span className="text-2xl">{faq.emoji}</span>
        <span className="flex-1 font-medium text-gray-800 text-sm">Q. {faq.question}</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-amber-50 rounded-lg p-3 mt-3">
            {faq.answer}
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

type Tab = 'templates' | 'knowledge' | 'faq';

export default function TemplatesPage() {
  const [tab, setTab] = useState<Tab>('templates');
  const [search, setSearch] = useState('');

  const list: AnyTemplate[] = tab === 'templates' ? TEMPLATES : PETIT_KNOWLEDGE;
  const filteredList = list.filter((t) =>
    t.title.includes(search) || t.body.includes(search)
  );
  const filteredFaqs = FAQS.filter((f) =>
    f.question.includes(search) || f.answer.includes(search)
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">📋 テンプレート</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('templates')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium ${tab === 'templates' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          📨 送信
        </button>
        <button
          onClick={() => setTab('knowledge')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium ${tab === 'knowledge' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          💡 プチ知識
        </button>
        <button
          onClick={() => setTab('faq')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium ${tab === 'faq' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          ❓ よくある質問
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 検索..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {tab === 'faq' ? (
        filteredFaqs.length === 0 ? (
          <div className="text-center text-gray-400 py-8">見つかりませんでした</div>
        ) : (
          filteredFaqs.map((f) => <FaqCard key={f.key} faq={f} />)
        )
      ) : (
        filteredList.length === 0 ? (
          <div className="text-center text-gray-400 py-8">見つかりませんでした</div>
        ) : (
          filteredList.map((t) => <TemplateCard key={t.key} template={t} />)
        )
      )}
    </div>
  );
}
