import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

const STORAGE_KEY = 'viewed_posts'
const COOLDOWN_MS = 24 * 60 * 60 * 1000

export default function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const viewed: Record<string, number> = raw ? JSON.parse(raw) : {}
      const lastViewed = viewed[slug]
      const now = Date.now()

      if (lastViewed && now - lastViewed < COOLDOWN_MS) return

      viewed[slug] = now
      for (const key in viewed) {
        if (now - viewed[key] > 7 * 24 * 60 * 60 * 1000) delete viewed[key]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed))

      supabase.rpc('increment_view_count', { post_slug: slug })
    } catch {
      // localStorage 접근 불가(시크릿 모드 등) 시 무시
    }
  }, [slug])

  return null
}
