'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white border border-surface-200 rounded-2xl p-8">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✉️</span>
            </div>
            <h2 className="font-medium text-surface-900 mb-2">Check your email</h2>
            <p className="text-surface-400 text-sm">We sent a confirmation link to <strong>{email}</strong></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl tracking-widest text-surface-900 mb-2">HENNA</h1>
          <p className="text-surface-400 text-sm tracking-wide">Business Dashboard</p>
        </div>

        <div className="bg-white border border-surface-200 rounded-2xl p-8">
          <h2 className="text-surface-900 font-medium text-lg mb-6">Create account</h2>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs tracking-wide text-surface-400 mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-surface-50"
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
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border border-surface-200 text-sm focus:outline-none focus:border-brand-400 bg-surface-50"
                placeholder="Min 8 characters"
              />
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-surface-400 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-500 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
