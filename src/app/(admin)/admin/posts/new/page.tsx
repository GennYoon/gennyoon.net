import { createClient } from '@/lib/supabase/server'
import NewPostEditor from '@/components/admin/NewPostEditor'

export default async function NewPostPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name, emoji')
    .order('name')

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-3 border-b border-zinc-800/60 flex items-center gap-4 bg-zinc-900/40">
        <a href="/admin/posts" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← 목록
        </a>
        <span className="text-zinc-700">|</span>
        <h1 className="text-sm font-semibold text-zinc-300">새 글 작성</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <NewPostEditor categories={categories || []} />
      </div>
    </div>
  )
}
