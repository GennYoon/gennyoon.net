import React from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils'

type Post = {
  id: string
  title: string
  slug: string
  seo_description?: string | null
  cover_image?: string | null
  published_at?: string | null
  view_count?: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories?: any
}

interface Props {
  post: Post
  large?: boolean
}

const PostCard: React.FC<Props> = ({ post, large }) => {
  const cat = post.categories as { name: string; slug: string; emoji: string } | null

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block${large ? ' md:col-span-2' : ''}`}
    >
      <div className="h-full p-1.5 rounded-2xl bg-zinc-800/30 border border-zinc-700/40 hover:border-emerald-500/20 transition-all duration-500 hover:bg-zinc-800/40">
        <div className="h-full rounded-[calc(1rem-0.375rem)] overflow-hidden bg-zinc-900/60 border border-zinc-800/40 flex flex-col">
          {/* Cover image */}
          <div className={`relative overflow-hidden bg-zinc-800 ${large ? 'min-h-52' : 'min-h-36'}`}>
            {post.cover_image ? (
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-zinc-900/60" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-5">
            {cat && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-zinc-500 text-xs font-medium">{cat.name}</span>
              </div>
            )}
            <h3 className={`font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors duration-300 keep-all leading-snug mb-2 ${large ? 'text-xl' : 'text-base'}`}>
              {post.title}
            </h3>
            {post.seo_description && (
              <p className="text-zinc-500 text-xs leading-relaxed keep-all line-clamp-2 flex-1">
                {post.seo_description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-zinc-600 text-xs">
                {post.published_at && formatDate(post.published_at)}
              </span>
              <span className="text-emerald-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                읽기 →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PostCard
