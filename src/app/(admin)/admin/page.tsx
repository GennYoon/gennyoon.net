import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: totalPosts }, { count: publishedPosts }, { data: recentPosts }] =
    await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase
        .from('posts')
        .select('id, title, slug, status, view_count, published_at, categories(name, emoji)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  const totalViews = recentPosts?.reduce((acc, p) => acc + (p.view_count || 0), 0) ?? 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-zinc-100">대시보드</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
        >
          + 새 글 작성
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: '전체 글', value: totalPosts ?? 0, icon: 'solar:notebook-bold' },
          { label: '발행된 글', value: publishedPosts ?? 0, icon: 'solar:check-circle-bold' },
          { label: '총 조회수', value: totalViews.toLocaleString(), icon: 'solar:eye-bold' },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6"
          >
            {/* @ts-expect-error iconify */}
            <iconify-icon icon={card.icon} width="22" class="text-emerald-400 mb-3 block" />
            <p className="text-3xl font-bold text-zinc-100">{card.value}</p>
            <p className="text-sm text-zinc-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 최근 글 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">최근 글</h2>
          <Link href="/admin/posts" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
            전체 보기 →
          </Link>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          {recentPosts?.map((post, i) => {
            const cat = post.categories as unknown as { name: string; emoji: string } | null
            return (
              <div
                key={post.id}
                className={`flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-colors ${
                  i < (recentPosts.length - 1) ? 'border-b border-zinc-800/60' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {cat && <span className="text-base">{cat.emoji}</span>}
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-sm font-medium text-zinc-200 hover:text-emerald-400 truncate transition-colors"
                  >
                    {post.title}
                  </Link>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700/40'
                    }`}
                  >
                    {post.status === 'published' ? '발행' : '임시저장'}
                  </span>
                  <span className="text-xs text-zinc-600">{post.view_count ?? 0} 조회</span>
                  {post.published_at && (
                    <span className="text-xs text-zinc-600">{formatDate(post.published_at)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
