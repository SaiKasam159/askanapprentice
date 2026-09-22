'use client'

import Link from 'next/link'

/** Login was previously small text under the signup forms. This makes it a destination. */
export default function LoginChooser() {
  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="ac-h1">Log in</h1>
        <p className="ac-lede ac-mt-2">Which kind of account do you have?</p>

        <div className="ac-stack ac-mt-8" style={{ '--gap': '16px' } as any}>
          <Link href="/student/login" className="ac-card" style={{ textDecoration: 'none', display: 'block', textAlign: 'left' }}>
            <p className="ac-overline">Looking for advice</p>
            <p className="ac-h3 ac-mt-2">I'm a student</p>
            <p className="ac-body ac-muted ac-mt-2">See your bookings and book more calls.</p>
          </Link>

          <Link href="/apprentice/login" className="ac-card" style={{ textDecoration: 'none', display: 'block', textAlign: 'left' }}>
            <p className="ac-overline">Giving advice</p>
            <p className="ac-h3 ac-mt-2">I'm a mentor</p>
            <p className="ac-body ac-muted ac-mt-2">Manage your availability, bookings and earnings.</p>
          </Link>
        </div>

        <p className="ac-small ac-muted ac-mt-8">
          Don't have an account? <Link href="/signup" className="ac-link">Sign up as a student</Link>
          {' or '}<Link href="/apprentice/signup" className="ac-link">become a mentor</Link>.
        </p>
      </div>
    </div>
  )
}
