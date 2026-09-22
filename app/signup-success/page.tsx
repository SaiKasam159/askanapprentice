'use client'

import Link from 'next/link'

export default function SignupSuccess() {
  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
        <div className="ac-card">
          <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>✓</p>
          <h1 className="ac-h1">Account created!</h1>
          <p className="ac-lede ac-mt-4">Welcome to ApprentaCall. You're all set to start booking mentors.</p>

          <div className="ac-stack ac-mt-6" style={{ '--gap': '12px' } as any}>
            <Link href="/directory" className="ac-btn ac-btn--block ac-btn--lg">Browse mentors</Link>
            <Link href="/student/dashboard" className="ac-btn ac-btn--secondary ac-btn--block">Go to your dashboard</Link>
          </div>

          <div className="ac-note ac-mt-6">
            <p className="ac-small ac-mt-0"><strong>Your first call is free!</strong> You get one complimentary 30-minute intro call with your first mentor.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
