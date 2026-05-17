import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'

interface Prompt {
  id: string
  category_slug: string
  category_name: string
  system_prompt: string
  updated_at: string
}

interface Category {
  slug: string
  name: string
  emoji: string
}

interface Props {
  prompts: Prompt[]
  categories: Category[]
}

const PromptsEditor: React.FC<Props> = ({ prompts: initial, categories }) => {
  const [prompts, setPrompts] = useState<Prompt[]>(initial)
  const [selected, setSelected] = useState<Prompt | null>(initial[0] ?? null)
  const [editText, setEditText] = useState(initial[0]?.system_prompt ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newSlug, setNewSlug] = useState('')
  const [adding, setAdding] = useState(false)

  function selectPrompt(p: Prompt) {
    setSelected(p)
    setEditText(p.system_prompt)
    setShowAdd(false)
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)

    const { data, error } = await supabase
      .from('ai_prompts')
      .update({ system_prompt: editText, updated_at: new Date().toISOString() })
      .eq('id', selected.id)
      .select()
      .single()

    if (!error && data) {
      const updated = prompts.map((p) => (p.id === data.id ? data as Prompt : p))
      setPrompts(updated)
      setSelected(data as Prompt)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!selected) return
    if (!confirm(`"${selected.category_name}" 프롬프트를 삭제할까요?`)) return

    setDeleting(true)
    await supabase.from('ai_prompts').delete().eq('id', selected.id)

    const remaining = prompts.filter((p) => p.id !== selected.id)
    setPrompts(remaining)
    setSelected(remaining[0] ?? null)
    setEditText(remaining[0]?.system_prompt ?? '')
    setDeleting(false)
  }

  async function handleAdd() {
    if (!newSlug) return
    const cat = categories.find((c) => c.slug === newSlug)
    if (!cat) return

    setAdding(true)

    const { data, error } = await supabase
      .from('ai_prompts')
      .insert({
        category_slug: cat.slug,
        category_name: cat.name,
        system_prompt: `당신은 GennYoon의 블로그 편집자입니다.\n\n카테고리: ${cat.name}\n\n출력 형식:\n## 제목 후보\n1. [제목1]\n2. [제목2]\n3. [제목3]\n\n## 본문\n[마크다운 본문]\n\n## SEO\n- description: [100자 이내]\n- 태그: [tag1, tag2, tag3]`,
      })
      .select()
      .single()

    if (!error && data) {
      const updated = [...prompts, data as Prompt].sort((a, b) =>
        a.category_name.localeCompare(b.category_name)
      )
      setPrompts(updated)
      selectPrompt(data as Prompt)
    }
    setAdding(false)
    setShowAdd(false)
    setNewSlug('')
  }

  const unusedCategories = categories.filter(
    (c) => !prompts.find((p) => p.category_slug === c.slug)
  )

  const inputCls = 'w-full px-3 py-2 text-sm border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors'

  return (
    <div className="flex gap-5 h-[calc(100vh-180px)]">
      {/* 왼쪽: 카테고리 목록 */}
      <div className="w-52 shrink-0 flex flex-col gap-2">
        <div className="flex-1 bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-zinc-800/60">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">카테고리</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {prompts.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPrompt(p)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  selected?.id === p.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <span className="mr-1.5">
                  {categories.find((c) => c.slug === p.category_slug)?.emoji ?? '📝'}
                </span>
                {p.category_name}
              </button>
            ))}
          </nav>
          <div className="p-2 border-t border-zinc-800/60">
            {unusedCategories.length > 0 && (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors border border-dashed border-zinc-800 hover:border-zinc-700"
              >
                <Plus className="w-3.5 h-3.5" />
                프롬프트 추가
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽: 에디터 */}
      <div className="flex-1 flex flex-col gap-3">
        {showAdd ? (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-zinc-200">새 프롬프트 추가</h2>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">카테고리 선택</label>
              <select
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className={inputCls}
              >
                <option value="">선택해주세요</option>
                {unusedCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newSlug || adding}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
              >
                {adding && <Loader2 className="w-4 h-4 animate-spin" />}
                추가
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : selected ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {categories.find((c) => c.slug === selected.category_slug)?.emoji ?? '📝'}
                </span>
                <h2 className="text-base font-semibold text-zinc-100">{selected.category_name}</h2>
                <span className="text-xs text-zinc-600">
                  최종 수정: {new Date(selected.updated_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-900/40 text-red-500 hover:bg-red-900/20 rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  삭제
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-lg text-xs font-semibold transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  저장
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-900/40">
                <span className="text-xs text-zinc-600">system_prompt</span>
              </div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 w-full bg-transparent text-zinc-300 text-sm font-mono p-4 resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-4">
              <p className="text-xs text-zinc-600 mb-2 font-medium">출력 형식 가이드</p>
              <code className="text-xs text-zinc-500 leading-relaxed">
                ## 제목 후보 → ## 본문 → ## SEO 순서로 출력해야 파싱됩니다.
              </code>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-700">
            <p className="text-sm">왼쪽에서 카테고리를 선택하세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptsEditor
