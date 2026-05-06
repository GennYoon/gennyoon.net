import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import NewPostEditor from '@/components/admin/NewPostEditor'

interface Category {
  id: string
  slug: string
  name: string
  emoji: string
}

interface Post {
  id: string
  title: string
  slug: string
  content: string
  content_markdown: string
  cover_image: string
  category_id: string
  status: string
  seo_title: string
  seo_description: string
  published_at: string | null
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return

    Promise.all([
      supabase
        .from('posts')
        .select('id, title, slug, content, content_markdown, cover_image, category_id, status, seo_title, seo_description, published_at')
        .eq('id', id)
        .single(),
      supabase.from('categories').select('id, slug, name, emoji').order('name'),
    ]).then(([postRes, catsRes]) => {
      if (!postRes.data) {
        setNotFound(true)
      } else {
        setPost(postRes.data as Post)
      }
      if (catsRes.data) setCategories(catsRes.data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !post) return <Navigate to="/admin/posts" replace />

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-3 border-b border-zinc-800/60 flex items-center gap-4 bg-zinc-900/40">
        <Link to="/admin/posts" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← 목록
        </Link>
        <span className="text-zinc-700">|</span>
        <h1 className="text-sm font-semibold text-zinc-300">글 수정</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <NewPostEditor categories={categories} post={post} />
      </div>
    </div>
  )
}
