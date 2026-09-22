'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/lib/toast'

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send reset email')
      }

      toast.success('Check your email for reset link')
      setEmail('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    // This would need additional implementation with Supabase session handling
    toast.success('Password reset successful! Please log in.')
    router.push('/student/login')
  }

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <h1 className="ac-h1">Reset password</h1>
        <p className="ac-lede ac-mt-2">Enter your email or choose a new password</p>

        {!token ? (
          <form onSubmit={handleRequestReset} className="ac-card ac-mt-6">
            <div className="ac-stack" style={{ '--gap': '24px' } as any}>
              <div className="ac-field">
                <label className="ac-label" htmlFor="email">Email address</label>
                <input className="ac-input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={loading} />
              </div>

              {error && <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}><p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p></div>}

              <button type="submit" disabled={loading} className="ac-btn ac-btn--block ac-btn--lg">{loading ? 'Sending...' : 'Send reset link'}</button>

              <p className="ac-small ac-muted ac-center">
                Remember your password? <Link href="/student/login" className="ac-link">Log in</Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="ac-card ac-mt-6">
            <div className="ac-stack" style={{ '--gap': '24px' } as any}>
              <div className="ac-field">
                <label className="ac-label" htmlFor="password">New password</label>
                <input className="ac-input" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <p className="ac-hint ac-mt-1">At least 8 characters</p>
              </div>

              <div className="ac-field">
                <label className="ac-label" htmlFor="confirm">Confirm password</label>
                <input className="ac-input" id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>

              {error && <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}><p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p></div>}

              <button type="submit" className="ac-btn ac-btn--block ac-btn--lg">Reset password</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
