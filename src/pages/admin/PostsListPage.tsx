import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
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

interface Post {
  id: string
  title: string
  slug: string
  status: string
  view_count: number | null
  published_at: string | null
  categories?: unknown
  cross_posts?: unknown
}

const PAGE_SIZE = 12

const PostsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [count, setCount] = useState(0)
  const [inputQ, setInputQ] = useState(searchParams.get('q') || '')

  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const status = searchParams.get('status') || ''
  const category = searchParams.get('category') || ''
  const q = searchParams.get('q') || ''

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== '__all__') params.set(key, value)
    else params.delete(key)
    params.delete('page')
    setSearchParams(params)
  }

  useEffect(() => {
    supabase.from('categories').select('id, name, emoji').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  useEffect(() => {
    const offset = (page - 1) * PAGE_SIZE

    let query = supabase
      .from('posts')
      .select('id, title, slug, status, view_count, published_at, categories(name, slug, emoji), cross_posts(platform)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category_id', category)
    if (q) query = query.ilike('title', `%${q}%`)

    query.then(({ data, count: total }) => {
      if (data) setPosts(data as Post[])
      setCount(total ?? 0)
    })
  }, [page, status, category, q])

  const totalPages = Math.ceil(count / PAGE_SIZE)
  const hasFilter = q || status || category

  const buildHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (p > 1) params.set('page', String(p))
    else params.delete('page')
    return `?${params.toString()}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-100">
          글 목록
          <span className="ml-2 text-sm font-normal text-zinc-500">{count}개</span>
        </h1>
        <Link
          to="/admin/posts/new"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
        >
          + 새 글
        </Link>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex flex-1 min-w-40">
          <input
            type="text"
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && update('q', inputQ.trim())}
            placeholder="제목 검색..."
            className="flex-1 px-3 py-2 text-sm border border-zinc-700/60 rounded-l-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
          />
          <button
            onClick={() => update('q', inputQ.trim())}
            className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 border border-l-0 border-zinc-700/60 rounded-r-lg text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

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
            onClick={() => { setSearchParams({}); setInputQ('') }}
            className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-700/60 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {!posts.length && (
        <p className="text-center text-zinc-600 text-sm py-12">글이 없습니다.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {posts.map((post) => {
          const cat = post.categories as { name: string; slug: string; emoji: string } | null
          const crossPosts = post.cross_posts as { platform: string }[] | null
          const platforms = crossPosts?.map((cp) => cp.platform) || []

          return (
            <Link
              key={post.id}
              to={`/admin/posts/${post.id}`}
              className="flex flex-col bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-100 line-clamp-2 flex-1 leading-snug">{post.title}</p>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                  post.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                }`}>
                  {post.status === 'published' ? '발행' : '임시저장'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500">
                {cat
                  ? <span>{cat.emoji} {cat.name}</span>
                  : <span className="text-zinc-700">카테고리 없음</span>
                }
                <span>👁 {post.view_count?.toLocaleString() ?? 0}</span>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-zinc-600">
                  {post.published_at ? formatDate(post.published_at) : '미발행'}
                </span>
                <div className="flex gap-1">
                  {['devto', 'medium', 'linkedin'].map((platform) => (
                    <span
                      key={platform}
                      className={`text-xs px-1.5 py-0.5 rounded border ${
                        platforms.includes(platform)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-800/60 text-zinc-700 border-zinc-700/40'
                      }`}
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              to={buildHref(page - 1)}
              className="px-4 py-2 text-sm text-zinc-400 border border-zinc-700/60 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              ← 이전
            </Link>
          )}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis')
                acc.push(p)
                return acc
              }, [])
              .map((item, i) =>
                item === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-2 py-2 text-sm text-zinc-600">…</span>
                ) : (
                  <Link
                    key={item}
                    to={buildHref(item as number)}
                    className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-colors ${
                      item === page
                        ? 'bg-emerald-500 text-zinc-950 font-semibold'
                        : 'text-zinc-400 border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {item}
                  </Link>
                )
              )}
          </div>
          {page < totalPages && (
            <Link
              to={buildHref(page + 1)}
              className="px-4 py-2 text-sm text-zinc-400 border border-zinc-700/60 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              다음 →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default PostsListPage
