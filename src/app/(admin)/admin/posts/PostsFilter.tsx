'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      if (value && value !== '__all__') {
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
  const hasFilter = q || status || category

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <input
        type="text"
        value={q}
        onChange={(e) => update('q', e.target.value)}
        placeholder="제목 검색..."
        className="flex-1 min-w-40 px-3 py-2 text-sm border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
      />

      <Select value={status || '__all__'} onValueChange={(v) => update('status', v)}>
        <SelectTrigger className="w-36 border-zinc-700/60 bg-zinc-800/60 text-zinc-100 focus:ring-emerald-500/50">
          <SelectValue placeholder="전체 상태" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700/60 text-zinc-100">
          <SelectItem value="__all__" className="focus:bg-zinc-800 focus:text-zinc-100">전체 상태</SelectItem>
          <SelectItem value="published" className="focus:bg-zinc-800 focus:text-zinc-100">발행</SelectItem>
          <SelectItem value="draft" className="focus:bg-zinc-800 focus:text-zinc-100">임시저장</SelectItem>
        </SelectContent>
      </Select>

      <Select value={category || '__all__'} onValueChange={(v) => update('category', v)}>
        <SelectTrigger className="w-44 border-zinc-700/60 bg-zinc-800/60 text-zinc-100 focus:ring-emerald-500/50">
          <SelectValue placeholder="전체 카테고리" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700/60 text-zinc-100">
          <SelectItem value="__all__" className="focus:bg-zinc-800 focus:text-zinc-100">전체 카테고리</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id} className="focus:bg-zinc-800 focus:text-zinc-100">
              {cat.emoji} {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilter && (
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
