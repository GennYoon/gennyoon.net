import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import CategoriesEditor from '@/components/admin/CategoriesEditor'

interface Category {
  id: string
  name: string
  slug: string
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-zinc-100 mb-8">카테고리 관리</h1>
      <CategoriesEditor categories={categories} />
    </div>
  )
}

export default CategoriesPage
