'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
        <div className="ac-card">
          <p className="ac-h1" style={{ fontSize: '72px', margin: 0 }}>⚠️</p>
          <h1 className="ac-h1 ac-mt-2">Something went wrong</h1>
          <p className="ac-lede ac-mt-2">We encountered an error. Please try again or contact support if the problem persists.</p>

          <div className="ac-stack ac-mt-6" style={{ '--gap': '12px' } as any}>
            <button onClick={reset} className="ac-btn ac-btn--block ac-btn--lg">Try again</button>
            <Link href="/" className="ac-btn ac-btn--secondary ac-btn--block">Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
