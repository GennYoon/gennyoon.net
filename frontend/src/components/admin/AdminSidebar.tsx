import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BarChart2, NotebookPen, PenLine, Tag, Cpu, ArrowLeft, Menu, X, type LucideIcon } from 'lucide-react'

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin', label: '대시보드', icon: BarChart2 },
  { href: '/admin/posts', label: '글 목록', icon: NotebookPen },
  { href: '/admin/posts/new', label: '새 글 작성', icon: PenLine },
  { href: '/admin/categories', label: '카테고리', icon: Tag },
  { href: '/admin/prompts', label: 'AI 프롬프트', icon: Cpu },
]

interface Props {
  children: React.ReactNode
}

const AdminSidebar: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const NavLinks: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={onClick}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
            pathname === item.href
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200'
          }`}
        >
          <item.icon size={15} />
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden md:flex w-52 border-r border-zinc-800/60 bg-zinc-900/50 flex-shrink-0 flex-col">
        <div className="p-5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">G</span>
            </div>
            <div>
              <Link to="/" className="text-sm font-semibold text-zinc-100 hover:text-emerald-400 transition-colors">
                gennyoon.net
              </Link>
              <p className="text-[10px] text-zinc-600 mt-0.5">어드민</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-zinc-800/60">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <ArrowLeft size={13} />
            블로그로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 모바일 헤더 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-12 bg-zinc-900/95 border-b border-zinc-800/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 text-[10px] font-bold">G</span>
          </div>
          <span className="text-sm font-semibold text-zinc-100">어드민</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* 모바일 드로어 오버레이 */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-zinc-900 border-r border-zinc-800/60 flex flex-col">
            <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-emerald-400 text-xs font-bold">G</span>
                </div>
                <span className="text-sm font-semibold text-zinc-100">어드민</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="p-3 space-y-0.5 flex-1">
              <NavLinks onClick={() => setOpen(false)} />
            </nav>
            <div className="p-3 border-t border-zinc-800/60">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {/* @ts-expect-error iconify */}
                <iconify-icon icon="solar:arrow-left-linear" width="13" />
                블로그로 돌아가기
              </Link>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto md:pt-0 pt-12">{children}</main>
    </div>
  )
}

export default AdminSidebar
