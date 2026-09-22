'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ApprenticeLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType: 'apprentice' }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      localStorage.setItem('apprenticeId', data.user.profileId)
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('userType', 'apprentice')
      router.push('/apprentice/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <div className="ac-stack" style={{ '--gap': '12px', marginBottom: '32px' } as any}>
          <h1 className="ac-h1">Mentor login</h1>
          <p className="ac-lede">Access your mentor profile and booking requests</p>
        </div>

        <form onSubmit={handleSubmit} className="ac-card">
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-field">
              <label className="ac-label" htmlFor="email">Email address</label>
              <input className="ac-input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={loading} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="password">Password</label>
              <input className="ac-input" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} />
            </div>

            {error && <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}><p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p></div>}

            <button type="submit" disabled={loading} className="ac-btn ac-btn--block ac-btn--lg">{loading ? 'Logging in...' : 'Log in'}</button>

            <p className="ac-small ac-muted ac-center">Don't have an account? <Link href="/apprentice/signup" className="ac-link">Sign up as a mentor</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}
