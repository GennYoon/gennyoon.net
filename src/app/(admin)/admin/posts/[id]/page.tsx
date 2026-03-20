import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewPostEditor from '@/components/admin/NewPostEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, slug, content, content_markdown, cover_image, category_id, status, seo_title, seo_description')
      .eq('id', id)
      .single(),
    supabase.from('categories').select('id, slug, name, emoji').order('name'),
  ])

  if (!post) notFound()

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-3 border-b border-zinc-800/60 flex items-center gap-4 bg-zinc-900/40">
        <a href="/admin/posts" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← 목록
        </a>
        <span className="text-zinc-700">|</span>
        <h1 className="text-sm font-semibold text-zinc-300">글 수정</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <NewPostEditor categories={categories || []} post={post} />
      </div>
    </div>
  )
}
