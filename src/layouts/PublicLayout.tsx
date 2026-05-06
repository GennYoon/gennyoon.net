import { useState, useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import NavClient from '@/components/blog/NavClient'

interface Category {
  name: string
  slug: string
  emoji: string
}

export default function PublicLayout() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    supabase
      .from('categories')
      .select('name, slug, emoji')
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [])

  return (
    <div className="min-h-[100dvh] bg-zinc-950 noise">
      <NavClient categories={categories} />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-zinc-800/60 mt-32">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">G</span>
            </div>
            <span className="text-zinc-400 text-sm font-medium">gennyoon.net</span>
          </div>
          <p className="text-zinc-600 text-xs">
            노마드 코더 GennYoon의 AI 개발 기록 — {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/blog"
              className="text-zinc-600 hover:text-emerald-400 transition-colors duration-300"
            >
              {/* @ts-expect-error iconify */}
              <iconify-icon icon="solar:notebook-bold" width="16" />
            </Link>
            <Link
              to="/admin"
              className="text-zinc-700 hover:text-zinc-500 transition-colors duration-300 text-xs"
            >
              관리
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
