import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import NewPostEditor, { type NewPostEditorHandle } from '@/components/admin/NewPostEditor'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface Category {
  id: string
  slug: string
  name: string
}

const NewPostPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const editorRef = useRef<NewPostEditorHandle>(null)

  useEffect(() => {
    supabase.from('categories').select('id, slug, name').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  const handleSave = async (status: string) => {
    setSaving(true)
    await editorRef.current?.save(status)
    setSaving(false)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-3 border-b border-zinc-800/60 flex items-center gap-4 bg-zinc-900/40">
        <Link to="/admin/posts" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
          ← 목록
        </Link>
        <span className="text-zinc-700">|</span>
        <h1 className="text-sm font-semibold text-zinc-300 flex-1">새 글 작성</h1>
        <div className="flex items-center gap-2">
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
        <NewPostEditor ref={editorRef} categories={categories} />
      </div>
    </div>
  )
}

export default NewPostPage
