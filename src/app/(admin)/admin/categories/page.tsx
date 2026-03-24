import { createClient } from '@/lib/supabase/server'
import CategoriesEditor from './CategoriesEditor'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, emoji, color')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-zinc-100 mb-8">카테고리 관리</h1>
      <CategoriesEditor categories={categories || []} />
    </div>
  )
}
