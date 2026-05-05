import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import ViewCounter from '@/components/blog/ViewCounter'

interface Post {
  id: string
  title: string
  slug: string
  content?: string | null
  seo_title?: string | null
  seo_description?: string | null
  cover_image?: string | null
  published_at?: string | null
  view_count?: number | null
  categories?: unknown
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('posts')
      .select('*, categories(name, slug, emoji, color)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
      .then(({ data }) => {
        if (data) setPost(data as Post)
        else setNotFound(true)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !post) return <Navigate to="/404" replace />

  const cat = post.categories as { name: string; slug: string; emoji: string; color: string } | null

  return (
    <>
      <Helmet>
        <title>{post.seo_title || post.title} | gennyoon.net</title>
        {post.seo_description && <meta name="description" content={post.seo_description} />}
        <meta property="og:title" content={post.seo_title || post.title} />
        {post.seo_description && <meta property="og:description" content={post.seo_description} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="min-h-[100dvh] pt-32 pb-24">
        <ViewCounter slug={post.slug} />
        <div className="max-w-3xl mx-auto px-6">
          {/* Back */}
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-300 text-sm mb-12 transition-colors duration-300"
          >
            {/* @ts-expect-error iconify */}
            <iconify-icon icon="solar:arrow-left-linear" width="16" class="group-hover:-translate-x-0.5 transition-transform duration-300" />
            모든 글
          </Link>

          {/* Header */}
          <header className="mb-12">
            {cat && (
              <Link
                to={`/category/${cat.slug}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/40 hover:border-emerald-500/30 hover:text-emerald-400 text-zinc-400 text-xs font-medium mb-6 transition-all duration-300"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: cat.color || '#10b981' }}
                />
                <span>{cat.name}</span>
              </Link>
            )}

            <h1 className="text-3xl md:text-5xl font-bold text-zinc-50 keep-all leading-snug mb-6">
              {post.title}
            </h1>

            {post.seo_description && (
              <p className="text-zinc-400 text-lg keep-all leading-relaxed mb-8">
                {post.seo_description}
              </p>
            )}

            <div className="flex items-center gap-6 text-zinc-600 text-sm border-t border-zinc-800/60 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-emerald-400 text-[9px] font-bold">G</span>
                </div>
                <span>GennYoon</span>
              </div>
              {post.published_at && (
                <time className="text-zinc-600">{formatDate(post.published_at)}</time>
              )}
              <div className="flex items-center gap-1.5 text-zinc-600">
                {/* @ts-expect-error iconify */}
                <iconify-icon icon="solar:eye-linear" width="14" />
                <span>{post.view_count?.toLocaleString() ?? 0}</span>
              </div>
            </div>
          </header>

          {/* Cover image */}
          {post.cover_image && (
            <div className="mb-12 rounded-2xl overflow-hidden border border-zinc-800/60">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full object-cover max-h-96"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose-gennyoon"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Bottom navigation */}
          <div className="mt-20 pt-8 border-t border-zinc-800/60 flex items-center justify-between">
            <Link
              to="/"
              className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors duration-300"
            >
              {/* @ts-expect-error iconify */}
              <iconify-icon icon="solar:arrow-left-linear" width="14" class="group-hover:-translate-x-0.5 transition-transform duration-300" />
              목록으로
            </Link>
            {cat && (
              <Link
                to={`/category/${cat.slug}`}
                className="group flex items-center gap-2 text-zinc-500 hover:text-emerald-400 text-sm transition-colors duration-300"
              >
                {cat.name} 더 보기
                {/* @ts-expect-error iconify */}
                <iconify-icon icon="solar:arrow-right-linear" width="14" class="group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            )}
          </div>
        </div>
      </article>
    </>
  )
}
