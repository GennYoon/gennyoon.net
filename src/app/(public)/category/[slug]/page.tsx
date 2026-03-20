import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/blog/PostCard'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: cat } = await supabase
    .from('categories')
    .select('name, emoji')
    .eq('slug', slug)
    .single()

  if (!cat) return {}

  return {
    title: `${cat.emoji} ${cat.name}`,
    description: `GennYoon의 ${cat.name} 관련 글 모음`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: category }, { data: allCategories }] = await Promise.all([
    supabase
      .from('categories')
      .select('name, slug, emoji, color')
      .eq('slug', slug)
      .single(),
    supabase
      .from('categories')
      .select('name, slug, emoji')
      .order('name'),
  ])

  if (!category) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, seo_description, cover_image, published_at, view_count, categories(name, slug, emoji, color)')
    .eq('status', 'published')
    .eq('categories.slug', slug)
    .not('category_id', 'is', null)
    .order('published_at', { ascending: false })

  // category_id 필터링 (supabase join filter 한계 보완)
  const filtered = posts?.filter((p) => {
    const cat = p.categories as unknown as { slug: string } | null
    return cat?.slug === slug
  }) ?? []

  return (
    <div className="min-h-[100dvh] pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-400 text-sm mb-10 transition-colors duration-300"
          >
            {/* @ts-expect-error iconify */}
            <iconify-icon icon="solar:arrow-left-linear" width="14" class="group-hover:-translate-x-0.5 transition-transform duration-300" />
            홈으로
          </Link>

          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-5xl">{category.emoji}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-50 keep-all">
                {category.name}
              </h1>
              <p className="text-zinc-500 text-sm mt-3">
                {filtered.length}개의 글
              </p>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-12 pb-8 border-b border-zinc-800/60">
          <Link
            href="/#posts"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-all duration-300"
          >
            전체
          </Link>
          {allCategories?.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all duration-300 ${
                cat.slug === slug
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Posts grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-6xl mb-6 opacity-30">{category.emoji}</span>
            <p className="text-zinc-500 text-lg">아직 게시된 글이 없습니다.</p>
            <p className="text-zinc-600 text-sm mt-2">곧 새로운 글이 올라올 예정이에요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                post={post as any}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
