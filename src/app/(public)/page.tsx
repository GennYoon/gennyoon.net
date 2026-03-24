import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import ScrollReveal from '@/components/blog/ScrollReveal'
import PostCard from '@/components/blog/PostCard'

export const revalidate = 3600

const LOCATIONS = ['코딩', 'AI', '기록', '노마드']

export default async function HomePage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, seo_description, cover_image, published_at, view_count, categories(name, slug, emoji, color)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(9)

  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug, emoji, color')
    .order('name')

  const featuredPost = posts?.[0]
  const recentPosts = posts?.slice(1) ?? []

  return (
    <div className="min-h-[100dvh]">
      {/* === HERO === */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden px-6">

        {/* ── 그라디언트 메시 배경 ── */}

        {/* 오브 1 — 좌상단 메인 */}
        <div
          className="orb absolute pointer-events-none"
          style={{
            width: '700px', height: '700px',
            top: '-20%', left: '-20%',
            borderRadius: '50%',
            background: 'rgba(16,185,129,1)',
            opacity: 0.15,
            filter: 'blur(120px)',
          }}
        />

        {/* 오브 2 — 우하단 */}
        <div
          className="orb absolute pointer-events-none"
          style={{
            width: '550px', height: '550px',
            bottom: '-15%', right: '-15%',
            borderRadius: '50%',
            background: 'rgba(16,185,129,1)',
            opacity: 0.12,
            filter: 'blur(100px)',
            animationDelay: '3s',
          }}
        />

        {/* 오브 3 — 중앙 우측 포인트 */}
        <div
          className="float absolute pointer-events-none"
          style={{
            width: '300px', height: '300px',
            top: '25%', right: '15%',
            borderRadius: '50%',
            background: 'rgba(52,211,153,1)',
            opacity: 0.10,
            filter: 'blur(60px)',
            animationDelay: '4s',
          }}
        />

        {/* 격자선 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* 하단 페이드아웃 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #09090b, transparent)' }}
        />

        <div className="relative max-w-6xl mx-auto w-full pt-32 pb-20">
          {/* Eyebrow */}
          <div className="reveal flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[11px] uppercase tracking-[0.15em] font-medium">
                Nomad Coder
              </span>
            </div>
            <span className="text-zinc-600 text-xs">
              {LOCATIONS.join(' · ')}
            </span>
          </div>

          {/* Headline — Asymmetric split */}
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end mb-12">
            <div>
              <h1
                className="reveal text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight keep-all leading-[1.05] mb-6"
                style={{ animationDelay: '100ms' }}
              >
                AI를 활용해
                <br />
                <span className="text-emerald-400">만들고, 배우고</span>
                <br />
                기록합니다.
              </h1>
              <p
                className="reveal text-zinc-400 text-lg md:text-xl max-w-xl keep-all leading-relaxed"
                style={{ animationDelay: '200ms' }}
              >
                1인 AI 개발사를 운영하는 노마드 코더 GennYoon.
                AI로 개발하고, 경험한 것들을 솔직하게 씁니다.
              </p>
            </div>

            {/* Floating stat card */}
            <div
              className="reveal hidden md:block"
              style={{ animationDelay: '300ms' }}
            >
              <div className="p-1.5 rounded-2xl bg-zinc-800/40 border border-zinc-700/40">
                <div className="p-5 rounded-[calc(1rem-0.375rem)] bg-zinc-900/80 border border-zinc-800/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="float">
                    {/* @ts-expect-error iconify */}
                    <iconify-icon icon="solar:notebook-bold" width="28" class="text-emerald-400 mb-3 block" />
                  </div>
                  <div className="text-3xl font-bold text-zinc-100 mb-1">
                    {posts?.length ?? 0}+
                  </div>
                  <div className="text-zinc-500 text-xs">글 게시됨</div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="text-zinc-600 text-[10px] uppercase tracking-widest">카테고리</div>
                    <div className="text-zinc-300 text-sm font-medium mt-1">{categories?.length ?? 0}개</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            className="reveal flex items-center gap-4"
            style={{ animationDelay: '350ms' }}
          >
            <Link
              href="#posts"
              className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full font-semibold text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]"
            >
              최근 글 보기
              <span className="w-6 h-6 rounded-full bg-zinc-950/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                {/* @ts-expect-error iconify */}
                <iconify-icon icon="solar:arrow-down-linear" width="14" />
              </span>
            </Link>
            <Link
              href="/category/nomad-life"
              className="group flex items-center gap-2 px-6 py-4 border border-zinc-700/60 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 rounded-full text-sm font-medium transition-all duration-500 hover:bg-zinc-800/40"
            >
              노마드 이야기
              {/* @ts-expect-error iconify */}
              <iconify-icon icon="solar:arrow-right-linear" width="14" class="group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
          <span className="text-[10px] uppercase tracking-widest">스크롤</span>
          <div className="w-px h-12 bg-gradient-to-b from-zinc-600 to-transparent" />
        </div>
      </section>

      {/* === CATEGORY STRIP === */}
      <ScrollReveal>
        <section className="px-6 py-16 border-y border-zinc-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-px h-4 bg-emerald-500" />
              <span className="text-zinc-500 text-xs uppercase tracking-widest">카테고리</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories?.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-800/80 bg-zinc-900/40 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-zinc-400 hover:text-emerald-400 text-sm font-medium transition-all duration-500"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                  {/* @ts-expect-error iconify */}
                  <iconify-icon icon="solar:arrow-right-up-linear" width="12" class="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* === FEATURED POST === */}
      {featuredPost && (
        <ScrollReveal>
          <section id="posts" className="px-6 py-24">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2">
                  <div className="w-px h-4 bg-emerald-500" />
                  <span className="text-zinc-500 text-xs uppercase tracking-widest">최신 글</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-zinc-400 text-xs">NEW</span>
                </div>
              </div>

              {/* Featured — full width asymmetric */}
              <Link href={`/blog/${featuredPost.id}`} className="group block">
                <div className="p-1.5 rounded-3xl bg-zinc-800/30 border border-zinc-700/40 hover:border-emerald-500/20 transition-all duration-500 hover:bg-zinc-800/40">
                  <div className="rounded-[calc(1.5rem-0.375rem)] overflow-hidden bg-zinc-900/60 border border-zinc-800/40">
                    <div className="grid md:grid-cols-[1fr_auto] gap-0">
                      {/* Cover image */}
                      <div className="relative overflow-hidden bg-zinc-800 min-h-48 md:min-h-80">
                        {featuredPost.cover_image ? (
                          <img
                            src={featuredPost.cover_image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl opacity-20">
                              {(featuredPost.categories as unknown as { emoji: string } | null)?.emoji ?? '✍'}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-zinc-900/60" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/80 hidden md:block" />
                      </div>

                      {/* Content */}
                      <div className="p-8 md:p-10 md:w-96 flex flex-col justify-between">
                        <div>
                          {(() => {
                            const cat = featuredPost.categories as unknown as { name: string; slug: string; emoji: string } | null
                            return cat ? (
                              <div className="flex items-center gap-1.5 mb-6">
                                <span className="text-base">{cat.emoji}</span>
                                <span className="text-zinc-500 text-xs font-medium">{cat.name}</span>
                              </div>
                            ) : null
                          })()}
                          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors duration-300 keep-all leading-snug mb-4">
                            {featuredPost.title}
                          </h2>
                          {featuredPost.seo_description && (
                            <p className="text-zinc-500 text-sm leading-relaxed keep-all line-clamp-3">
                              {featuredPost.seo_description}
                            </p>
                          )}
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                          <div className="text-zinc-600 text-xs">
                            {featuredPost.published_at && formatDate(featuredPost.published_at)}
                          </div>
                          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all duration-300">
                            읽기
                            {/* @ts-expect-error iconify */}
                            <iconify-icon icon="solar:arrow-right-linear" width="16" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* === POSTS GRID (Bento) === */}
      {recentPosts.length > 0 && (
        <ScrollReveal>
          <section className="px-6 pb-32">
            <div className="max-w-6xl mx-auto space-y-4">

              {/* Row 1: 큰 카드(2/3) + 작은 카드(1/3) */}
              {recentPosts.length >= 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PostCard post={recentPosts[0]} large />
                  <PostCard post={recentPosts[1]} />
                </div>
              )}

              {/* Row 2: 나머지 균등 3분할 */}
              {recentPosts.length > 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentPosts.slice(2).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}

            </div>
          </section>
        </ScrollReveal>
      )}
    </div>
  )
}
