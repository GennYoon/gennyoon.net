import { createClient } from '@/lib/supabase/server'
import PromptsEditor from './PromptsEditor'

export default async function PromptsPage() {
  const supabase = await createClient()

  const { data: prompts } = await supabase
    .from('ai_prompts')
    .select('*')
    .order('category_name')

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name, emoji')
    .order('name')

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-zinc-100">AI 프롬프트</h1>
        <p className="text-zinc-500 text-sm mt-1">카테고리별 AI 글쓰기 시스템 프롬프트를 관리합니다.</p>
      </div>
      <PromptsEditor prompts={prompts || []} categories={categories || []} />
    </div>
  )
}
