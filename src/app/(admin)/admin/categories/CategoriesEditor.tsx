'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugifyKo } from '@/lib/utils'
import { Loader2, Trash2, Plus } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  emoji: string
  color: string
}

const EMPTY: Omit<Category, 'id'> = { name: '', slug: '', emoji: '📝', color: '#10b981' }

const inputCls = 'w-full px-3 py-2 text-sm border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-500 mb-1'

export default function CategoriesEditor({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initial)
  const [form, setForm] = useState<Omit<Category, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleNameChange = (value: string) => {
    setForm((f) => ({ ...f, name: value, slug: slugifyKo(value) }))
  }

  async function handleAdd() {
    if (!form.name.trim() || !form.slug.trim()) {
      alert('이름과 슬러그를 입력해주세요.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert(form)
      .select('id, name, slug, emoji, color')
      .single()

    if (error) {
      alert(error.message)
    } else {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(EMPTY)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('이 카테고리를 삭제할까요? 연결된 글의 카테고리가 해제됩니다.')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      {/* 기존 카테고리 목록 */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['이모지', '이름', '슬러그', '색상', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-600 text-sm">
                  카테고리가 없습니다.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-xl">{cat.emoji}</td>
                <td className="px-4 py-3 text-sm text-zinc-200 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-sm text-zinc-500 font-mono">{cat.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-zinc-700" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-zinc-600 font-mono">{cat.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleting === cat.id}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    {deleting === cat.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 새 카테고리 추가 폼 */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          새 카테고리 추가
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls}>이름 *</label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputCls}
              placeholder="노마드 라이프"
            />
          </div>
          <div>
            <label className={labelCls}>슬러그 *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className={inputCls}
              placeholder="nomad-life"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls}>이모지</label>
            <input
              value={form.emoji}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              className={inputCls}
              placeholder="✈️"
            />
          </div>
          <div>
            <label className={labelCls}>색상</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-10 h-9 rounded-lg border border-zinc-700/60 bg-zinc-800/60 cursor-pointer p-1"
              />
              <input
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className={`${inputCls} font-mono`}
                placeholder="#10b981"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          추가하기
        </button>
      </div>
    </div>
  )
}
