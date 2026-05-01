'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (email !== 'mkt@oemporio.pt') {
      setError('Unauthorized access.')
      setIsLoading(false)
      return
    }

    try {
      // Execute reCAPTCHA Enterprise
      const token = await new Promise<string>((resolve, reject) => {
        if (typeof window === 'undefined' || !window.grecaptcha) {
          reject(new Error('reCAPTCHA not loaded'))
          return
        }

        window.grecaptcha.enterprise.ready(async () => {
          try {
            const token = await window.grecaptcha.enterprise.execute(
              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '', 
              { action: 'LOGIN' }
            )
            resolve(token)
          } catch (err) {
            reject(err)
          }
        })
      })

      // Note: You can send 'token' to your backend or Supabase if configured
      console.log('reCAPTCHA token:', token)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: token
        }
      })

      if (authError) throw authError

      if (data.session) {
        router.push('/admin')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-black border border-white/20 p-8">
        <h1 className="font-bourton text-3xl mb-8 text-center tracking-wider">Admin Login</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/30 px-4 py-3 text-white placeholder-white/30 focus:border-white focus:ring-1 focus:ring-white outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/30 px-4 py-3 text-white placeholder-white/30 focus:border-white focus:ring-1 focus:ring-white outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bourton py-4 text-xl tracking-wider hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
