import { Link } from 'react-router-dom'
import ScrollReveal from '@/components/blog/ScrollReveal'
import type { Category } from './types'

interface Props {
  categories: Category[]
}

export function CategoryStrip({ categories }: Props) {
  if (categories.length === 0) return null
  return (
    <ScrollReveal>
      <section className="px-6 py-16 border-y border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-px h-4 bg-emerald-500" />
            <span className="text-zinc-500 text-xs uppercase tracking-widest">카테고리</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-800/80 bg-zinc-900/40 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-zinc-400 hover:text-emerald-400 text-sm font-medium transition-all duration-500"
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                {/* @ts-expect-error iconify */}
                <iconify-icon
                  icon="solar:arrow-right-up-linear"
                  width="12"
                  class="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  )
}
