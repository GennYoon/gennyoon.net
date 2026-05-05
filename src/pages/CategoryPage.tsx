import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase/client'
import PostCard from '@/components/blog/PostCard'

interface Category {
  name: string
  slug: string
  emoji: string
  color: string
}

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

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<{ name: string; slug: string; emoji: string }[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    Promise.all([
      supabase.from('categories').select('name, slug, emoji, color').eq('slug', slug).single(),
      supabase.from('categories').select('name, slug, emoji').order('name'),
      supabase
        .from('posts')
        .select('id, title, slug, seo_description, cover_image, published_at, view_count, categories(name, slug, emoji, color)')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
    ]).then(([catRes, allCatsRes, postsRes]) => {
      if (!catRes.data) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setCategory(catRes.data)
      if (allCatsRes.data) setAllCategories(allCatsRes.data)

      const filtered = (postsRes.data ?? []).filter((p) => {
        const cat = (p.categories as unknown) as { slug: string } | null
        return cat?.slug === slug
      })
      setPosts(filtered as Post[])
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

  if (notFound || !category) return <Navigate to="/404" replace />

  return (
    <>
      <Helmet>
        <title>{category.name} | gennyoon.net</title>
        <meta name="description" content={`GennYoon의 ${category.name} 관련 글 모음`} />
      </Helmet>

      <div className="min-h-[100dvh] pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="mb-16">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-400 text-sm mb-10 transition-colors duration-300"
            >
              {/* @ts-expect-error iconify */}
              <iconify-icon icon="solar:arrow-left-linear" width="14" class="group-hover:-translate-x-0.5 transition-transform duration-300" />
              홈으로
            </Link>

            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: category.color || '#10b981' }}
                  />
                  <span className="text-zinc-500 text-xs uppercase tracking-widest">Category</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-50 keep-all">
                  {category.name}
                </h1>
                <p className="text-zinc-500 text-sm mt-3">
                  {posts.length}개의 글
                </p>
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-12 pb-8 border-b border-zinc-800/60">
            <Link
              to="/#posts"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-all duration-300"
            >
              전체
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all duration-300 ${
                  cat.slug === slug
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Posts grid */}
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="text-zinc-500 text-lg">아직 게시된 글이 없습니다.</p>
              <p className="text-zinc-600 text-sm mt-2">곧 새로운 글이 올라올 예정이에요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
