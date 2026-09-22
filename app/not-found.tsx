'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
        <div className="ac-card">
          <p className="ac-h1" style={{ fontSize: '72px', margin: 0 }}>404</p>
          <h1 className="ac-h1 ac-mt-2">Page not found</h1>
          <p className="ac-lede ac-mt-2">The page you're looking for doesn't exist or has been moved.</p>

          <div className="ac-stack ac-mt-6" style={{ '--gap': '12px' } as any}>
            <Link href="/" className="ac-btn ac-btn--block ac-btn--lg">Back to home</Link>
            <Link href="/directory" className="ac-btn ac-btn--secondary ac-btn--block">Browse mentors</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
