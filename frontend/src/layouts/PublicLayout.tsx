import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import NavClient from '@/components/blog/NavClient'

interface Category {
  name: string
  slug: string
}

const PublicLayout: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    supabase
      .from('categories')
      .select('name, slug')
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
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-emerald-400 text-xs font-bold">G</span>
              </div>
              <span className="text-zinc-300 text-sm font-semibold">gennyoon.net</span>
            </div>
            <p className="text-zinc-600 text-xs">
              © 2024–{new Date().getFullYear()} Webchemist Corp. All rights reserved.
            </p>
          </div>
          <div className="border-t border-zinc-800/40 pt-6 flex flex-col md:flex-row gap-1 text-[11px] text-zinc-600">
            <span>대표자: 윤원열</span>
            <span className="hidden md:inline mx-2">·</span>
            <span>사업자등록번호: 722-86-03469</span>
            <span className="hidden md:inline mx-2">·</span>
            <span>경기도 안양시 동안구 평촌대로 212번길 14-8, 3층 316호</span>
            <span className="hidden md:inline mx-2">·</span>
            <a href="mailto:info@webchemist.net" className="hover:text-zinc-400 transition-colors">info@webchemist.net</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
