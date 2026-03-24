import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import PostsFilter from './PostsFilter'

const PAGE_SIZE = 12

export default async function PostsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; category?: string; q?: string }>
}) {
  const { page: pageParam, status, category, q } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, emoji')
    .order('name')

  let query = supabase
    .from('posts')
    .select('id, title, slug, status, view_count, published_at, categories(name, slug, emoji), cross_posts(platform)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category_id', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: posts, count } = await query

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    const s = params.toString()
    return s ? `?${s}` : '?'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-100">
          글 목록
          <span className="ml-2 text-sm font-normal text-zinc-500">{count ?? 0}개</span>
        </h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
        >
          + 새 글
        </Link>
      </div>

      <PostsFilter categories={categories ?? []} />

      {!posts?.length && (
        <p className="text-center text-zinc-600 text-sm py-12">글이 없습니다.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {posts?.map((post) => {
          const cat = post.categories as unknown as { name: string; slug: string; emoji: string } | null
          const crossPosts = post.cross_posts as unknown as { platform: string }[] | null
          const platforms = crossPosts?.map((cp) => cp.platform) || []

          return (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}`}
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
              href={buildHref(page - 1)}
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
                    href={buildHref(item as number)}
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
              href={buildHref(page + 1)}
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
