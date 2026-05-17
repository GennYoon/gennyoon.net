import React from 'react'
import { Link } from 'react-router-dom'
import { NotebookPen, ArrowDown, ArrowRight } from 'lucide-react'
import type { Post, Category } from './types'

const PRIMARY = '#10b981'
const PRIMARY_HOVER = '#34d399'
const BG = '#09090b'

interface Props {
  posts: Post[]
  categories: Category[]
}

export const Hero: React.FC<Props> = ({ posts, categories }) => {
  const countPerCategory = Object.fromEntries(
    categories.map((cat) => [
      cat.slug,
      posts.filter((p) => (p.categories as { slug: string } | null)?.slug === cat.slug).length,
    ])
  )

  return (
  <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="orb absolute rounded-full"
        style={{ width: 700, height: 700, background: PRIMARY, opacity: 0.3, filter: 'blur(120px)', top: '-20%', right: '-20%' }}
      />
      <div
        className="orb absolute rounded-full"
        style={{ width: 550, height: 550, background: PRIMARY, opacity: 0.22, filter: 'blur(100px)', bottom: '-15%', left: '-15%', animationDelay: '3s' }}
      />
      <div
        className="float absolute rounded-full"
        style={{ width: 300, height: 300, background: PRIMARY_HOVER, opacity: 0.2, filter: 'blur(60px)', top: '25%', left: '15%', animationDelay: '4s' }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${PRIMARY}12 1px, transparent 1px), linear-gradient(90deg, ${PRIMARY}12 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: `linear-gradient(to top, ${BG}, transparent)` }} />
    </div>

    <div className="relative max-w-6xl mx-auto px-6 w-full pt-20 pb-16">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
        {/* 왼쪽: 통계 카드 */}
        <div className="hidden lg:block shrink-0 w-36 reveal" style={{ animationDelay: '300ms' }}>
          <div className="p-1.5 rounded-2xl bg-zinc-800/40 border border-zinc-700/40">
            <div className="p-4 bg-zinc-900/80 border border-zinc-800/60 rounded-xl flex flex-col gap-4">
              <div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-3" style={{ background: `${PRIMARY}1a`, border: `1px solid ${PRIMARY}33` }}>
                  <NotebookPen size={14} style={{ color: PRIMARY }} />
                </div>
                <div className="text-2xl font-bold text-zinc-50 leading-none">{posts.length}+</div>
                <div className="text-[11px] text-zinc-500 mt-1">글 게시됨</div>
              </div>
              <div className="border-t border-zinc-800" />
              <div className="flex flex-col gap-2.5">
                <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">카테고리</div>
                {categories.slice(0, 4).map((cat) => (
                  <div key={cat.slug} className="flex items-center justify-between gap-1">
                    <span className="text-[11px] text-zinc-500 truncate">{cat.name}</span>
                    <span className="text-[11px] font-mono shrink-0" style={{ color: PRIMARY }}>{countPerCategory[cat.slug] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col items-end text-right space-y-6 justify-center">
          <div
            className="reveal flex items-center gap-3 px-3 py-1.5 rounded-full"
            style={{ background: `${PRIMARY}1a`, border: `1px solid ${PRIMARY}33`, animationDelay: '100ms' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: PRIMARY }} />
            <span className="text-[11px] uppercase tracking-[0.15em] font-medium" style={{ color: PRIMARY }}>
              Nomad Coder
            </span>
          </div>

          <h1
            className="reveal text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-zinc-50"
            style={{ animationDelay: '150ms', wordBreak: 'keep-all' }}
          >
            AI를 활용해
            <br />
            <span style={{ color: PRIMARY_HOVER }}>만들고, 배우고</span>
            <br />
            기록합니다.
          </h1>

          <p className="reveal text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed" style={{ animationDelay: '200ms', wordBreak: 'keep-all' }}>
            1인 AI 개발사를 운영하는 노마드 코더 GennYoon. AI로 개발하고, 경험한 것들을 솔직하게 씁니다.
          </p>

          <div className="reveal flex items-center gap-3 justify-end flex-wrap" style={{ animationDelay: '250ms' }}>
            <a
              href="#posts"
              className="group flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: PRIMARY, color: '#09090b', boxShadow: `0 0 30px ${PRIMARY}33` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = PRIMARY_HOVER }}
              onMouseLeave={(e) => { e.currentTarget.style.background = PRIMARY }}
            >
              최근 글 보기
              <span className="w-6 h-6 rounded-full flex items-center justify-center group-hover:translate-x-0.5 transition-transform" style={{ background: 'rgba(9,9,11,0.15)' }}>
                <ArrowDown size={12} />
              </span>
            </a>
            <Link
              to="/category/nomad-life"
              className="group flex items-center gap-2 px-6 py-4 border border-zinc-700/60 text-zinc-300 hover:text-zinc-100 rounded-full text-sm font-medium transition-all duration-500"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${PRIMARY}66`; e.currentTarget.style.background = `${PRIMARY}0d` }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = '' }}
            >
              노마드 이야기
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}
