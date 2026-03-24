'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Category {
  id: string
  name: string
  emoji: string
}

export default function PostsFilter({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || ''
  const category = searchParams.get('category') || ''

  const inputCls = 'px-3 py-2 text-sm border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors'

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <input
        type="text"
        value={q}
        onChange={(e) => update('q', e.target.value)}
        placeholder="제목 검색..."
        className={`${inputCls} flex-1 min-w-40`}
      />
      <select
        value={status}
        onChange={(e) => update('status', e.target.value)}
        className={`${inputCls} min-w-28`}
      >
        <option value="">전체 상태</option>
        <option value="published">발행</option>
        <option value="draft">임시저장</option>
      </select>
      <select
        value={category}
        onChange={(e) => update('category', e.target.value)}
        className={`${inputCls} min-w-36`}
      >
        <option value="">전체 카테고리</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.emoji} {cat.name}
          </option>
        ))}
      </select>
      {(q || status || category) && (
        <button
          onClick={() => router.push('?')}
          className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-700/60 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
        >
          초기화
        </button>
      )}
    </div>
  )
}
