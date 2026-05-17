import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { NotebookPen, CheckCircle, Eye, PenLine, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RecentPost {
  id: string
  title: string
  status: string
  view_count: number | null
  published_at: string | null
  categories?: unknown
}

const DashboardPage: React.FC = () => {
  const [totalPosts, setTotalPosts] = useState(0)
  const [publishedPosts, setPublishedPosts] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase
        .from('posts')
        .select('id, title, status, view_count, published_at, categories(name)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('posts').select('view_count'),
    ]).then(([totalRes, publishedRes, recentRes, viewsRes]) => {
      setTotalPosts(totalRes.count ?? 0)
      setPublishedPosts(publishedRes.count ?? 0)
      if (recentRes.data) setRecentPosts(recentRes.data as RecentPost[])
      if (viewsRes.data) setTotalViews(viewsRes.data.reduce((acc, p) => acc + (p.view_count || 0), 0))
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-zinc-100">대시보드</h1>
        <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg">
          <Link to="/admin/posts/new">
            <PenLine size={13} />
            새 글 작성
          </Link>
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {(
          [
            { label: '전체 글', value: totalPosts, icon: NotebookPen },
            { label: '발행된 글', value: publishedPosts, icon: CheckCircle },
            { label: '총 조회수', value: totalViews.toLocaleString(), icon: Eye },
          ] as { label: string; value: number | string; icon: LucideIcon }[]
        ).map((card) => (
          <div key={card.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6">
            <card.icon size={20} className="text-emerald-400 mb-3" />
            <p className="text-3xl font-bold text-zinc-100">{card.value}</p>
            <p className="text-sm text-zinc-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 최근 글 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">최근 글</h2>
          <Button asChild variant="ghost" size="xs" className="text-emerald-500 hover:text-emerald-400 hover:bg-transparent">
            <Link to="/admin/posts">전체 보기 →</Link>
          </Button>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
          {recentPosts.map((post, i) => {
            const cat = post.categories as { name: string } | null
            return (
              <div
                key={post.id}
                className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  i < recentPosts.length - 1 ? 'border-b border-zinc-800/60' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {cat && <span className="text-xs text-zinc-600 font-mono shrink-0">{cat.name}</span>}
                  <Button asChild variant="ghost" className="p-0 h-auto hover:bg-transparent text-sm font-medium text-zinc-200 hover:text-emerald-400 truncate">
                    <Link to={`/admin/posts/${post.id}`}>{post.title}</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    post.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                  }`}>
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

export default DashboardPage
