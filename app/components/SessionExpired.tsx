'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Shown when a page cannot load the signed-in account. This used to be bare
 * text on an empty page with no way forward, which is where a stale session
 * left people.
 */
export function SessionExpired({ role, message }: { role: 'student' | 'apprentice'; message?: string }) {
  const router = useRouter()
  const loginPath = role === 'student' ? '/student/login' : '/apprentice/login'

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '32rem', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="ac-h1">We couldn't load your account</h1>
        <p className="ac-lede ac-mt-2">
          {message || 'Your session may have expired. Signing in again usually fixes it.'}
        </p>
        <div className="ac-stack ac-mt-6" style={{ '--gap': '12px' } as any}>
          <button
            onClick={() => { localStorage.clear(); router.push(loginPath) }}
            className="ac-btn ac-btn--block ac-btn--lg"
          >
            Sign in again
          </button>
          <Link href="/directory" className="ac-btn ac-btn--secondary ac-btn--block">Browse mentors</Link>
        </div>
      </div>
    </div>
  )
}
