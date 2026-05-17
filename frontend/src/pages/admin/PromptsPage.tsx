import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import PromptsEditor from '@/components/admin/PromptsEditor'

interface Prompt {
  id: string
  category_slug: string
  category_name: string
  system_prompt: string
  updated_at: string
}

interface Category {
  slug: string
  name: string
}

const PromptsPage: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('ai_prompts').select('*').order('category_name'),
      supabase.from('categories').select('slug, name').order('name'),
    ]).then(([promptsRes, catsRes]) => {
      if (promptsRes.data) setPrompts(promptsRes.data)
      if (catsRes.data) setCategories(catsRes.data)
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-zinc-100">AI 프롬프트</h1>
        <p className="text-zinc-500 text-sm mt-1">카테고리별 AI 글쓰기 시스템 프롬프트를 관리합니다.</p>
      </div>
      <PromptsEditor prompts={prompts} categories={categories} />
    </div>
  )
}

export default PromptsPage
