import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2, ExternalLink, Check } from 'lucide-react'

interface CrossPost {
  platform: string
  external_url: string
}

interface Props {
  postId: string
  postStatus: string
}

export default function CrossPostPanel({ postId, postStatus }: Props) {
  const [crossPosts, setCrossPosts] = useState<CrossPost[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  useEffect(() => {
    supabase
      .from('cross_posts')
      .select('platform, external_url')
      .eq('post_id', postId)
      .then(({ data }) => {
        if (data) setCrossPosts(data)
      })
  }, [postId])

  const platforms = [
    { key: 'linkedin', label: 'LinkedIn', desc: '한국어', emoji: '💼', fn: 'crosspost-linkedin' },
    { key: 'medium', label: 'Medium', desc: '영어 번역', emoji: '📝', fn: 'crosspost-medium' },
    { key: 'devto', label: 'Dev.to', desc: '영어', emoji: '👩‍💻', fn: 'crosspost-devto' },
  ]

  async function handlePost(platform: string, fnName: string) {
    setLoading((prev) => ({ ...prev, [platform]: true }))
    setErrors((prev) => ({ ...prev, [platform]: '' }))

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/${fnName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publishableKey}`,
        },
        body: JSON.stringify({ postId }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || '포스팅 실패')
      }

      const data = await res.json()
      setCrossPosts((prev) => [
        ...prev.filter((cp) => cp.platform !== platform),
        { platform, external_url: data.url },
      ])
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [platform]: err instanceof Error ? err.message : '오류 발생',
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [platform]: false }))
    }
  }

  const isDisabled = postStatus !== 'published'

  return (
    <div className="border border-zinc-700/60 rounded-xl p-4 bg-zinc-800/30">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">크로스포스팅</h3>

      {isDisabled && (
        <p className="text-xs text-zinc-600 mb-3">발행된 글만 크로스포스팅할 수 있습니다.</p>
      )}

      <div className="space-y-2">
        {platforms.map(({ key, label, desc, emoji, fn }) => {
          const posted = crossPosts.find((cp) => cp.platform === key)
          const isLoading = loading[key]
          const error = errors[key]

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{emoji}</span>
                <div>
                  <p className="text-xs font-medium text-zinc-300">{label}</p>
                  <p className="text-xs text-zinc-600">{desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {error && <span className="text-xs text-red-400">{error}</span>}
                {posted ? (
                  <a
                    href={posted.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    완료
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => handlePost(key, fn)}
                    disabled={isDisabled || isLoading}
                    className="px-3 py-1.5 text-xs border border-zinc-700/60 text-zinc-400 rounded-lg hover:bg-zinc-700/40 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    포스팅
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
