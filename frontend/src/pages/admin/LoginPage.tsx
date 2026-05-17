import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/admin')
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-zinc-950 noise">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-400 text-lg font-bold">G</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50">GennYoon</h1>
          <p className="text-sm text-zinc-500 mt-1">Webchemist Corp 어드민</p>
        </div>

        <form onSubmit={handleLogin} className="bg-zinc-900/60 rounded-2xl border border-zinc-800/60 p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/40 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
              placeholder="info@webchemist.net"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">패스워드</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-zinc-700/60 rounded-lg bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-lg font-semibold text-sm transition-colors"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
