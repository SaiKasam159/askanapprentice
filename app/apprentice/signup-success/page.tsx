'use client'

import Link from 'next/link'

export default function ApprenticeSignupSuccess() {
  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
        <div className="ac-card">
          <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>✓</p>
          <h1 className="ac-h1">Welcome to ApprentaCall!</h1>
          <p className="ac-lede ac-mt-4">Your mentor profile has been created. We'll review it and add you to the directory within 24 hours.</p>

          <div className="ac-stack ac-mt-6" style={{ '--gap': '12px' } as any}>
            <Link href="/apprentice/dashboard" className="ac-btn ac-btn--block ac-btn--lg">Go to your dashboard</Link>
            <Link href="/apprentice/profile" className="ac-btn ac-btn--secondary ac-btn--block">View your profile</Link>
          </div>

          <div className="ac-note ac-mt-6">
            <p className="ac-small ac-mt-0"><strong>What happens next?</strong> Our team will verify your application. Once approved, you'll start receiving booking requests from students. Set your availability from your dashboard and students book inside it.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
