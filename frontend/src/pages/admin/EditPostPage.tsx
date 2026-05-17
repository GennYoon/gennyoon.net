import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import NewPostEditor, { type NewPostEditorHandle } from '@/components/admin/NewPostEditor'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'

interface Category {
  id: string
  slug: string
  name: string
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

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const editorRef = useRef<NewPostEditorHandle>(null)

  const handleSave = async (status: string) => {
    setSaving(true)
    await editorRef.current?.save(status)
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('글을 삭제할까요? 되돌릴 수 없습니다.')) return
    setDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      alert('삭제에 실패했습니다.')
      setDeleting(false)
    } else {
      navigate('/admin/posts')
    }
  }

  useEffect(() => {
    if (!id) return

    Promise.all([
      supabase
        .from('posts')
        .select('id, title, slug, content, content_markdown, cover_image, category_id, status, seo_title, seo_description, published_at')
        .eq('id', id)
        .single(),
      supabase.from('categories').select('id, slug, name').order('name'),
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
        <Link to="/admin/posts" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
          ← 목록
        </Link>
        <span className="text-zinc-700">|</span>
        <h1 className="text-sm font-semibold text-zinc-300 flex-1">글 수정</h1>
        <div className="flex items-center gap-2">
          {post.status === 'draft' ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              삭제
            </Button>
          ) : (
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="border-zinc-700/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 rounded-lg"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              발행 취소
            </Button>
          )}
          <Button
            variant="outline"
            size="xs"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="border-zinc-700/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 rounded-lg"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            임시저장
          </Button>
          <Button
            size="xs"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            발행하기
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <NewPostEditor ref={editorRef} categories={categories} post={post} />
      </div>
    </div>
  )
}

export default EditPostPage
