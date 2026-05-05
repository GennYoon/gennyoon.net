import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import ScrollReveal from '@/components/blog/ScrollReveal'
import PostCard from '@/components/blog/PostCard'

const LOCATIONS = ['코딩', 'AI', '기록', '노마드']

interface Post {
  id: string
  title: string
  slug: string
  seo_description?: string | null
  cover_image?: string | null
  published_at?: string | null
  view_count?: number | null
  categories?: unknown
}

interface Category {
  name: string
  slug: string
  emoji: string
  color: string
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([
      supabase
        .from('posts')
        .select('id, title, slug, seo_description, cover_image, published_at, view_count, categories(name, slug, emoji, color)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(9),
      supabase
        .from('categories')
        .select('name, slug, emoji, color')
        .order('name'),
    ]).then(([postsRes, catsRes]) => {
      if (postsRes.data) setPosts(postsRes.data as Post[])
      if (catsRes.data) setCategories(catsRes.data)
    })
  }, [])

  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)

  return (
    <>
      <Helmet>
        <title>gennyoon.net</title>
        <meta name="description" content="노마드 코더 GennYoon의 AI 개발 블로그. AI로 만들고, 배우고, 기록합니다." />
      </Helmet>

      <div className="min-h-[100dvh]">
        {/* === HERO === */}
        <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">

          {/* 배경 오브 — Webchemist 와 동일 위치 (쌍둥이 layout) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 메인 오브 — 우상단 */}
            <div
              className="orb absolute rounded-full"
              style={{
                width: 700, height: 700,
                background: 'rgba(16,185,129,1)',
                opacity: 0.30,
                filter: 'blur(120px)',
                top: '-20%', right: '-20%',
              }}
            />
            {/* 보조 오브 — 좌하단 */}
            <div
              className="orb absolute rounded-full"
              style={{
                width: 550, height: 550,
                background: 'rgba(16,185,129,1)',
                opacity: 0.22,
                filter: 'blur(100px)',
                bottom: '-15%', left: '-15%',
                animationDelay: '3s',
              }}
            />
            {/* 플로팅 오브 — 좌중단 */}
            <div
              className="float absolute rounded-full"
              style={{
                width: 300, height: 300,
                background: 'rgba(52,211,153,1)',
                opacity: 0.20,
                filter: 'blur(60px)',
                top: '25%', left: '15%',
                animationDelay: '4s',
              }}
            />
            {/* 격자선 */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
              }}
            />
            {/* 하단 페이드 */}
            <div
              className="absolute bottom-0 left-0 right-0 h-40"
              style={{ background: 'linear-gradient(to top, #09090b, transparent)' }}
            />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 w-full pt-20 pb-16">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12">

              {/* 왼쪽: 컴팩트 통계 카드 (Webchemist 스타일) */}
              <div className="hidden lg:block shrink-0 w-36 reveal" style={{ animationDelay: '300ms' }}>
                <div className="p-1.5 rounded-2xl bg-zinc-800/40 border border-zinc-700/40">
                  <div className="p-4 bg-zinc-900/80 border border-zinc-800/60 rounded-xl flex flex-col gap-4">
                    {/* 게시된 글 */}
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                        {/* @ts-expect-error iconify */}
                        <iconify-icon icon="solar:notebook-bold" width="14" class="text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-zinc-50 leading-none">{posts.length}+</div>
                      <div className="text-[11px] text-zinc-500 mt-1">글 게시됨</div>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-zinc-800" />

                    {/* 카테고리 미리보기 */}
                    <div className="flex flex-col gap-2.5">
                      <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">카테고리</div>
                      {categories.slice(0, 4).map((cat) => (
                        <div key={cat.slug} className="flex items-center justify-between gap-1">
                          <span className="text-[11px] text-zinc-500 truncate">{cat.emoji} {cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 메인 콘텐츠 */}
              <div className="flex-1 flex flex-col items-end text-right space-y-6 justify-center">
                {/* 상태 뱃지 */}
                <div
                  className="reveal flex items-center gap-3 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  style={{ animationDelay: '100ms' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[11px] uppercase tracking-[0.15em] font-medium">
                    Nomad Coder · {LOCATIONS.join(' · ')}
                  </span>
                </div>

                {/* 메인 제목 */}
                <h1
                  className="reveal text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-zinc-50"
                  style={{ animationDelay: '150ms', wordBreak: 'keep-all' }}
                >
                  AI를 활용해
                  <br />
                  <span className="text-emerald-400">만들고, 배우고</span>
                  <br />
                  기록합니다.
                </h1>

                {/* 설명 */}
                <p
                  className="reveal text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed"
                  style={{ animationDelay: '200ms', wordBreak: 'keep-all' }}
                >
                  1인 AI 개발사를 운영하는 노마드 코더 GennYoon.
                  AI로 개발하고, 경험한 것들을 솔직하게 씁니다.
                </p>

                {/* CTA 버튼 */}
                <div
                  className="reveal flex items-center gap-3 justify-end flex-wrap"
                  style={{ animationDelay: '250ms' }}
                >
                  <a
                    href="#posts"
                    className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full font-semibold text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}
                  >
                    최근 글 보기
                    <span className="w-6 h-6 rounded-full bg-zinc-950/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      {/* @ts-expect-error iconify */}
                      <iconify-icon icon="solar:arrow-down-linear" width="12" />
                    </span>
                  </a>
                  <Link
                    to="/category/nomad-life"
                    className="group flex items-center gap-2 px-6 py-4 border border-zinc-700/60 hover:border-emerald-500/40 text-zinc-300 hover:text-zinc-100 rounded-full text-sm font-medium transition-all duration-500 hover:bg-emerald-500/5"
                  >
                    노마드 이야기
                    {/* @ts-expect-error iconify */}
                    <iconify-icon icon="solar:arrow-right-linear" width="14" class="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
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
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
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
                <Link to={`/blog/${featuredPost.slug}`} className="group block">
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
                                {(featuredPost.categories as { emoji: string } | null)?.emoji ?? '✍'}
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
                              const cat = featuredPost.categories as { name: string; slug: string; emoji: string } | null
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
                {recentPosts.length >= 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PostCard post={recentPosts[0]} large />
                    <PostCard post={recentPosts[1]} />
                  </div>
                )}
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
    </>
  )
}
