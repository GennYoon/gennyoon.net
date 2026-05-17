import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart2, NotebookPen, LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin', label: '대시보드', icon: BarChart2 },
  { href: '/admin/posts', label: '글 목록', icon: NotebookPen },
]

interface Props {
  children: React.ReactNode
}

const AdminSidebar: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const NavLinks: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={`w-full justify-start gap-2.5 px-3 py-2.5 h-auto rounded-lg text-sm ${
              isActive
                ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100'
                : 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200'
            }`}
          >
            <Link to={item.href} onClick={onClick}>
              <item.icon size={15} />
              <span>{item.label}</span>
            </Link>
          </Button>
        )
      })}
    </>
  )

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden md:flex w-52 border-r border-zinc-800 bg-zinc-900 flex-shrink-0 flex-col">
        <div className="p-5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <span className="text-emerald-400 text-xs font-bold">G</span>
            </div>
            <div>
              <Button asChild variant="ghost" className="p-0 h-auto text-sm font-semibold text-zinc-100 hover:text-emerald-400 hover:bg-transparent">
                <Link to="/">GennYoon BLOG</Link>
              </Button>
              <p className="text-[10px] text-zinc-600 mt-0.5">어드민</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          <NavLinks />
        </nav>
        <div className="p-3 border-t border-zinc-800/60">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 px-3 py-2 h-auto rounded-lg text-xs text-zinc-600 hover:text-zinc-400 hover:text-red-400">
            <LogOut size={13} />
            로그아웃
          </Button>
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
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="w-8 h-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
          <Menu size={18} />
        </Button>
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
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="w-7 h-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800">
                <X size={16} />
              </Button>
            </div>
            <nav className="p-3 space-y-0.5 flex-1">
              <NavLinks onClick={() => setOpen(false)} />
            </nav>
            <div className="p-3 border-t border-zinc-800/60">
              <Button variant="ghost" onClick={() => { setOpen(false); handleLogout() }} className="w-full justify-start gap-2 px-3 py-2 h-auto rounded-lg text-xs text-zinc-600 hover:text-zinc-400 hover:text-red-400">
                <LogOut size={13} />
                로그아웃
              </Button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto md:pt-0 pt-12">{children}</main>
    </div>
  )
}

export default AdminSidebar
