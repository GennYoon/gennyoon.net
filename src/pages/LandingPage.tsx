import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Hero } from '@/features/landing/Hero'
import { CategoryStrip } from '@/features/landing/CategoryStrip'
import { FeaturedPost } from '@/features/landing/FeaturedPost'
import { PostsGrid } from '@/features/landing/PostsGrid'
import type { Post, Category } from '@/features/landing/types'

export default function LandingPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([
      supabase
        .from('posts')
        .select(
          'id, title, slug, seo_description, cover_image, published_at, view_count, categories(name, slug, emoji, color)'
        )
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(9),
      supabase
        .from('categories')
        .select('name, slug, emoji, color')
        .order('name'),
    ]).then(([postsRes, catsRes]) => {
      if (postsRes.data) setPosts(postsRes.data as Post[])
      if (catsRes.data) setCategories(catsRes.data)
    })
  }, [])

  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)

  return (
    <>
      <title>gennyoon.net</title>
      <meta
        name="description"
        content="노마드 코더 GennYoon의 AI 개발 블로그. AI로 만들고, 배우고, 기록합니다."
      />

      <div className="min-h-[100dvh]">
        <Hero posts={posts} categories={categories} />
        <CategoryStrip categories={categories} />
        {featuredPost && <FeaturedPost post={featuredPost} />}
        <PostsGrid posts={recentPosts} />
      </div>
    </>
  )
}
