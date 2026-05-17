import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, PenLine } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    supabase.from('categories').select('id, name').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  useEffect(() => {
    const offset = (page - 1) * PAGE_SIZE

    let query = supabase
      .from('posts')
      .select('id, title, slug, status, view_count, published_at, categories(name, slug), cross_posts(platform)', { count: 'exact' })
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
        <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg">
          <Link to="/admin/posts/new">
            <PenLine size={13} />
            새 글
          </Link>
        </Button>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex flex-1 min-w-40">
          <Input
            type="text"
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && update('q', inputQ.trim())}
            placeholder="제목 검색..."
            className="rounded-r-none"
          />
          <Button
            onClick={() => update('q', inputQ.trim())}
            variant="secondary"
            className="rounded-l-none border border-l-0 border-zinc-700/60 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-3"
          >
            <Search className="w-4 h-4" />
          </Button>
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
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilter && (
          <Button
            variant="outline"
            onClick={() => { setSearchParams({}); setInputQ('') }}
            className="border-zinc-700/60 bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          >
            초기화
          </Button>
        )}
      </div>

      {!posts.length && (
        <p className="text-center text-zinc-600 text-sm py-12">글이 없습니다.</p>
      )}

      <div className="flex flex-col gap-1.5">
        {posts.map((post) => {
          const cat = post.categories as { name: string; slug: string } | null
          const crossPosts = post.cross_posts as { platform: string }[] | null
          const platforms = crossPosts?.map((cp) => cp.platform) || []

          return (
            <Button
              key={post.id}
              asChild
              variant="ghost"
              className="block p-0 h-auto hover:bg-transparent rounded-xl text-left"
            >
              <Link to={`/admin/posts/${post.id}`}>
                <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl px-4 py-3 hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors">
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                    post.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                  }`}>
                    {post.status === 'published' ? '발행' : '임시저장'}
                  </span>
                  <p className="flex-1 text-sm font-medium text-zinc-100 truncate">{post.title}</p>
                  <span className="text-xs text-zinc-500 shrink-0 hidden sm:block">
                    {cat ? cat.name : <span className="text-zinc-700">-</span>}
                  </span>
                  <span className="text-xs text-zinc-600 shrink-0 hidden md:block w-20 text-right">
                    {post.published_at ? formatDate(post.published_at) : '미발행'}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded border shrink-0 hidden lg:block ${
                      platforms.includes('linkedin')
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-800/60 text-zinc-700 border-zinc-700/40'
                    }`}
                  >
                    LinkedIn
                  </span>
                </div>
              </Link>
            </Button>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Button asChild variant="outline" className="border-zinc-700/60 bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
              <Link to={buildHref(page - 1)}>← 이전</Link>
            </Button>
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
                  <Button
                    key={item}
                    asChild
                    variant={item === page ? 'default' : 'outline'}
                    size="icon"
                    className={item === page
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-0'
                      : 'border-zinc-700/60 bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }
                  >
                    <Link to={buildHref(item as number)}>{item}</Link>
                  </Button>
                )
              )}
          </div>
          {page < totalPages && (
            <Button asChild variant="outline" className="border-zinc-700/60 bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
              <Link to={buildHref(page + 1)}>다음 →</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default PostsListPage
