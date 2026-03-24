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

      {/* 모바일 카드 */}
      <div className="md:hidden space-y-3">
        {posts?.map((post) => {
          const cat = post.categories as unknown as { name: string; slug: string; emoji: string } | null
          const crossPosts = post.cross_posts as unknown as { platform: string }[] | null
          const platforms = crossPosts?.map((cp) => cp.platform) || []

          return (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}`}
              className="block bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-zinc-100 line-clamp-2 flex-1">{post.title}</p>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                  post.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                }`}>
                  {post.status === 'published' ? '발행' : '임시저장'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                {cat && <span>{cat.emoji} {cat.name}</span>}
                <span>👁 {post.view_count?.toLocaleString() ?? 0}</span>
                {post.published_at && <span>{formatDate(post.published_at)}</span>}
              </div>
              {platforms.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {['devto', 'medium', 'linkedin'].map((platform) => (
                    <span
                      key={platform}
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        platforms.includes(platform)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800/60 text-zinc-700 border border-zinc-700/40'
                      }`}
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          )
        })}
        {!posts?.length && (
          <p className="text-center text-zinc-600 text-sm py-12">글이 없습니다.</p>
        )}
      </div>

      {/* 데스크탑 테이블 */}
      <div className="hidden md:block bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {['제목', '카테고리', '상태', '조회수', '크로스포스팅', '발행일', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts?.map((post) => {
              const cat = post.categories as unknown as { name: string; slug: string; emoji: string } | null
              const crossPosts = post.cross_posts as unknown as { platform: string }[] | null
              const platforms = crossPosts?.map((cp) => cp.platform) || []

              return (
                <tr key={post.id} className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/posts/${post.id}`} className="text-sm font-medium text-zinc-200 hover:text-emerald-400 line-clamp-1 max-w-xs transition-colors">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {cat && <span className="text-sm text-zinc-500">{cat.emoji} {cat.name}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700/40'
                    }`}>
                      {post.status === 'published' ? '발행' : '임시저장'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{post.view_count?.toLocaleString() ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {['devto', 'medium', 'linkedin'].map((platform) => (
                        <span key={platform} className={`text-xs px-1.5 py-0.5 rounded ${
                          platforms.includes(platform)
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800/60 text-zinc-700 border border-zinc-700/40'
                        }`}>
                          {platform}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600">
                    {post.published_at ? formatDate(post.published_at) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/posts/${post.id}`} className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors">
                      수정
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
