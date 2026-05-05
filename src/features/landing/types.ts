export interface Post {
  id: string
  title: string
  slug: string
  seo_description?: string | null
  cover_image?: string | null
  published_at?: string | null
  view_count?: number | null
  categories?: unknown
}

export interface Category {
  name: string
  slug: string
  emoji: string
  color: string
}
