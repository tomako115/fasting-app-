'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', plan: '3', fasting_start_date: '', memo: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.fasting_start_date) {
      setError('名前と開始日を入力してください');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, plan: Number(form.plan) }),
    });
    if (res.ok) {
      router.push('/clients');
    } else {
      setError('保存に失敗しました');
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients" className="text-gray-400 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-800">クライアント追加</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">お名前 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例：田中花子"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ファスティング開始日 *</label>
            <input
              type="date"
              value={form.fasting_start_date}
              onChange={(e) => setForm({ ...form, fasting_start_date: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">プラン</label>
            <div className="flex gap-3">
              {['3', '5'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, plan: p })}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    form.plan === p
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {p}日プラン
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
            <textarea
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              placeholder="例：妊活目的、鮭アレルギーあり など"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-base active:bg-green-700 disabled:opacity-50"
        >
          {saving ? '保存中...' : '登録する'}
        </button>
      </form>
    </div>
  );
}
