import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import NewPostEditor from '@/components/admin/NewPostEditor'

interface Category {
  id: string
  slug: string
  name: string
  emoji: string
}

export default function NewPostPage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    supabase.from('categories').select('id, slug, name, emoji').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-3 border-b border-zinc-800/60 flex items-center gap-4 bg-zinc-900/40">
        <Link to="/admin/posts" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← 목록
        </Link>
        <span className="text-zinc-700">|</span>
        <h1 className="text-sm font-semibold text-zinc-300">새 글 작성</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <NewPostEditor categories={categories} />
      </div>
    </div>
  )
}
