import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 noise pb-24">
      <div className="w-full max-w-sm">
        <form onSubmit={handleLogin} className="bg-zinc-900/60 rounded-2xl border border-zinc-800/60 p-8 space-y-6">
          <div className="text-center pb-2">
            <h1 className="text-2xl font-bold text-zinc-50">GennYoon</h1>
            <p className="text-sm text-zinc-500 mt-1">Webchemist Corp 어드민</p>
          </div>
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/40 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">이메일</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="info@webchemist.net"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-400">패스워드</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>

  )
}

export default LoginPage
