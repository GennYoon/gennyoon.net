'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Category {
  name: string
  slug: string
  emoji: string
}

export default function NavClient({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* Floating Pill Nav */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 w-auto`}>
        <div
          className={`flex items-center gap-1 px-3 py-2 rounded-full border transition-all duration-500 ${
            scrolled
              ? 'bg-zinc-900/90 border-zinc-700/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
              : 'bg-zinc-900/60 border-zinc-800/40 backdrop-blur-md'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-zinc-800/60 transition-all duration-300 mr-1">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <span className="text-emerald-400 text-[10px] font-bold">G</span>
            </div>
            <span className="text-zinc-200 text-sm font-semibold tracking-tight hidden sm:block">
              GennYoon
            </span>
          </Link>

          <div className="w-px h-4 bg-zinc-700/60 mx-1" />

          {/* Categories — desktop */}
          <div className="hidden md:flex items-center gap-0.5">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  pathname === `/category/${cat.slug}`
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {cat.emoji} {cat.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-300"
            aria-label="메뉴"
          >
            {/* @ts-expect-error iconify */}
            <iconify-icon icon={menuOpen ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear'} width="18" />
          </button>
        </div>
      </nav>

      {/* Mobile Full-screen Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-zinc-950/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-4 md:hidden">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              style={{ animationDelay: `${i * 60}ms` }}
              className="reveal text-2xl font-bold text-zinc-300 hover:text-emerald-400 transition-colors duration-300"
            >
              {cat.emoji} {cat.name}
            </Link>
          ))}
          <Link
            href="/"
            style={{ animationDelay: `${categories.length * 60}ms` }}
            className="reveal mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            홈으로
          </Link>
        </div>
      )}
    </>
  )
}
