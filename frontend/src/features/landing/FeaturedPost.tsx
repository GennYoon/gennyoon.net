import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ScrollReveal from '@/components/blog/ScrollReveal'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { Post } from './types'

interface Props {
  post: Post
}

export const FeaturedPost: React.FC<Props> = ({ post }) => {
  const cat = post.categories as { name: string; slug: string; emoji: string } | null
  return (
    <ScrollReveal>
      <section id="posts" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <div className="w-px h-4 bg-emerald-500" />
              <span className="text-zinc-500 text-xs uppercase tracking-widest">최신 글</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400 text-xs">NEW</span>
            </div>
          </div>

          <Button asChild variant="ghost" className="group block p-0 h-auto hover:bg-transparent rounded-3xl">
            <Link to={`/blog/${post.slug}`}>
            <div className="p-1.5 rounded-3xl bg-zinc-800/30 border border-zinc-700/40 hover:border-emerald-500/20 transition-all duration-500 hover:bg-zinc-800/40">
              <div className="rounded-[calc(1.5rem-0.375rem)] overflow-hidden bg-zinc-900/60 border border-zinc-800/40">
                <div className="grid md:grid-cols-[1fr_auto] gap-0">
                  {/* Cover image */}
                  <div className="relative overflow-hidden bg-zinc-800 min-h-48 md:min-h-80">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-zinc-900/60" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/80 hidden md:block" />
                  </div>

                  {/* Content */}
                  <div className="p-8 md:p-10 md:w-96 flex flex-col justify-between">
                    <div>
                      {cat && (
                        <div className="flex items-center gap-2 mb-6">
                          <span className="text-zinc-500 text-xs font-medium">{cat.name}</span>
                        </div>
                      )}
                      <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors duration-300 keep-all leading-snug mb-4">
                        {post.title}
                      </h2>
                      {post.seo_description && (
                        <p className="text-zinc-500 text-sm leading-relaxed keep-all line-clamp-3">
                          {post.seo_description}
                        </p>
                      )}
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="text-zinc-600 text-xs">
                        {post.published_at && formatDate(post.published_at)}
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all duration-300">
                        읽기
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </Link>
          </Button>
        </div>
      </section>
    </ScrollReveal>
  )
}
