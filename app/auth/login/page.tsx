'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting sign in...')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log('Sign in result:', { data, error })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        console.log('Sign in successful. Redirecting to home page...')
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Sign in exception:', err)
      setError(err?.message || String(err) || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl tracking-widest text-surface-900 mb-2">HENNA</h1>
          <p className="text-surface-400 text-sm tracking-wide">Business Dashboard</p>
        </div>

        <div className="bg-white border border-surface-200 rounded-2xl p-8">
          <h2 className="text-surface-900 font-medium text-lg mb-6">Sign in</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs tracking-wide text-surface-400 mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-surface-50 transition-colors"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wide text-surface-400 mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-surface-50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 px-4 py-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-surface-400 mt-6">
            No account?{' '}
            <Link href="/auth/signup" className="text-brand-500 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
