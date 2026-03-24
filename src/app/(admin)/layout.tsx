import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* 사이드바 */}
      <aside className="w-52 border-r border-zinc-800/60 bg-zinc-900/50 flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">G</span>
            </div>
            <div>
              <Link href="/" className="text-sm font-semibold text-zinc-100 hover:text-emerald-400 transition-colors">
                gennyoon.net
              </Link>
              <p className="text-[10px] text-zinc-600 mt-0.5">어드민</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {[
            { href: '/admin', label: '대시보드', icon: 'solar:chart-2-bold' },
            { href: '/admin/posts', label: '글 목록', icon: 'solar:notebook-bold' },
            { href: '/admin/posts/new', label: '새 글 작성', icon: 'solar:pen-bold' },
            { href: '/admin/categories', label: '카테고리', icon: 'solar:tag-bold' },
            { href: '/admin/prompts', label: 'AI 프롬프트', icon: 'solar:cpu-bolt-bold' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200 transition-all duration-200"
            >
              {/* @ts-expect-error iconify */}
              <iconify-icon icon={item.icon} width="15" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800/60">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {/* @ts-expect-error iconify */}
            <iconify-icon icon="solar:arrow-left-linear" width="13" />
            블로그로 돌아가기
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
