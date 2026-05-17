import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { slugifyKo } from '@/lib/utils'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  slug: string
}

const EMPTY: Omit<Category, 'id'> = { name: '', slug: '' }

const labelCls = 'block text-xs font-medium text-zinc-500 mb-1'

interface Props {
  categories: Category[]
}

const CategoriesEditor: React.FC<Props> = ({ categories: initial }) => {
  const [categories, setCategories] = useState<Category[]>(initial)
  const [form, setForm] = useState<Omit<Category, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleNameChange = (value: string) => {
    setForm((f) => ({ ...f, name: value, slug: slugifyKo(value) }))
  }

  const handleAdd = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      alert('이름과 슬러그를 입력해주세요.')
      return
    }
    setSaving(true)
    const { data, error } = await supabase
      .from('categories')
      .insert(form)
      .select('id, name, slug')
      .single()

    if (error) {
      alert(error.message)
    } else {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(EMPTY)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 카테고리를 삭제할까요? 연결된 글의 카테고리가 해제됩니다.')) return
    setDeleting(id)
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
              {['이름', '슬러그', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-600 text-sm">
                  카테고리가 없습니다.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-sm text-zinc-200 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-sm text-zinc-500 font-mono">{cat.slug}</td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleting === cat.id}
                    className="w-8 h-8 text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                  >
                    {deleting === cat.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </Button>
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
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelCls}>이름 *</label>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="노마드 라이프"
            />
          </div>
          <div>
            <label className={labelCls}>슬러그 *</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="nomad-life"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={saving}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          추가하기
        </Button>
      </div>
    </div>
  )
}

export default CategoriesEditor
