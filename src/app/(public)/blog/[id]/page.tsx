import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import ViewCounter from '@/components/blog/ViewCounter'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('title, seo_title, seo_description, slug, categories(name, slug, emoji)')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!post) return {}

  const cat = post.categories as unknown as { name: string; slug: string; emoji: string } | null
  const ogImageUrl = `/og?title=${encodeURIComponent(post.title)}&category=${cat?.slug || ''}&emoji=${cat?.emoji || '✍️'}`

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || undefined,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || undefined,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || undefined,
      images: [ogImageUrl],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*, categories(name, slug, emoji, color)')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  const cat = post.categories as unknown as { name: string; slug: string; emoji: string; color: string } | null

  return (
    <article className="min-h-[100dvh] pt-32 pb-24">
      <ViewCounter slug={post.slug} />
      <div className="max-w-3xl mx-auto px-6">
        {/* Back */}
        <Link
          href="/"
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
              href={`/category/${cat.slug}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/40 hover:border-emerald-500/30 hover:text-emerald-400 text-zinc-400 text-xs font-medium mb-6 transition-all duration-300"
            >
              <span>{cat.emoji}</span>
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
            href="/"
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors duration-300"
          >
            {/* @ts-expect-error iconify */}
            <iconify-icon icon="solar:arrow-left-linear" width="14" class="group-hover:-translate-x-0.5 transition-transform duration-300" />
            목록으로
          </Link>
          {cat && (
            <Link
              href={`/category/${cat.slug}`}
              className="group flex items-center gap-2 text-zinc-500 hover:text-emerald-400 text-sm transition-colors duration-300"
            >
              {cat.emoji} {cat.name} 더 보기
              {/* @ts-expect-error iconify */}
              <iconify-icon icon="solar:arrow-right-linear" width="14" class="group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
