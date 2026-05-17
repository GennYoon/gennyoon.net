import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Loader2, ExternalLink, Check, Link2 } from 'lucide-react'

interface CrossPost {
  platform: string
  external_url: string
}

interface Props {
  postId: string
  postStatus: string
}

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const PLATFORM_LOGOS: Record<string, React.FC> = {
  linkedin: LinkedInLogo,
}

const CrossPostPanel: React.FC<Props> = ({ postId, postStatus }) => {
  const [crossPosts, setCrossPosts] = useState<CrossPost[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [linkedinConnected, setLinkedinConnected] = useState<boolean | null>(null)

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

    supabase
      .from('linkedin_tokens')
      .select('expires_at')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        setLinkedinConnected(!!data && new Date(data.expires_at) > new Date())
      })
  }, [postId])

  const platforms = [
    { key: 'linkedin', label: 'LinkedIn', desc: '한국어', fn: 'crosspost-linkedin' },
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">크로스포스팅</h3>
        {linkedinConnected === false && (
          <a
            href={`${supabaseUrl}/functions/v1/crosspost-linkedin-auth?action=login`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Link2 className="w-3 h-3" />
            LinkedIn 연동
          </a>
        )}
        {linkedinConnected === true && (
          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" />
            연동됨
          </span>
        )}
      </div>

      {isDisabled && (
        <p className="text-xs text-zinc-600 mb-3">발행된 글만 크로스포스팅할 수 있습니다.</p>
      )}

      <div className="space-y-2">
        {platforms.map(({ key, label, desc, fn }) => {
          const Logo = PLATFORM_LOGOS[key]
          const posted = crossPosts.find((cp) => cp.platform === key)
          const isLoading = loading[key]
          const error = errors[key]

          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-zinc-400">
                  <Logo />
                </span>
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

export default CrossPostPanel
