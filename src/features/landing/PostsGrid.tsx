import ScrollReveal from '@/components/blog/ScrollReveal'
import PostCard from '@/components/blog/PostCard'
import type { Post } from './types'

interface Props {
  posts: Post[]
}

export function PostsGrid({ posts }: Props) {
  if (posts.length === 0) return null
  return (
    <ScrollReveal>
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto space-y-4">
          {posts.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PostCard post={posts[0]} large />
              <PostCard post={posts[1]} />
            </div>
          )}
          {posts.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {posts.slice(2).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </ScrollReveal>
  )
}
