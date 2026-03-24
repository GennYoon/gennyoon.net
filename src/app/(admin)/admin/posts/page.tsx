import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export default async function PostsListPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, status, view_count, published_at, categories(name, slug, emoji), cross_posts(platform)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-100">글 목록</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-sm font-semibold transition-colors"
        >
          + 새 글
        </Link>
      </div>

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
              {/* 제목 + 상태 */}
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

              {/* 카테고리 + 조회수 */}
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                {cat
                  ? <span className="flex items-center gap-1">{cat.emoji} {cat.name}</span>
                  : <span className="text-zinc-700">카테고리 없음</span>
                }
                <span className="flex items-center gap-1">👁 {post.view_count?.toLocaleString() ?? 0}</span>
              </div>

              {/* 발행일 + 크로스포스팅 */}
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
    </div>
  )
}
