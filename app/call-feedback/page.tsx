'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/lib/toast'

export default function CallFeedback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const mentorName = searchParams.get('mentorName')

  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rating, feedback }),
      })

      if (!response.ok) throw new Error('Failed to submit feedback')

      toast.success('Thank you for your feedback!')
      router.push('/student/dashboard')
    } catch (err) {
      toast.error('Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
        <h1 className="ac-h1">How was your call?</h1>
        <p className="ac-lede ac-mt-2">Help us improve by sharing your feedback about your call with {mentorName}</p>

        <form onSubmit={handleSubmit} className="ac-card ac-mt-6">
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-field">
              <label className="ac-label">Rating</label>
              <div className="ac-row ac-mt-3" style={{ gap: '12px', justifyContent: 'space-around' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    style={{
                      fontSize: '32px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: n <= rating ? 1 : 0.3,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="feedback">What could be improved? (optional)</label>
              <textarea className="ac-textarea" id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Any suggestions or comments..." disabled={loading} />
            </div>

            <button type="submit" disabled={loading} className="ac-btn ac-btn--block ac-btn--lg">{loading ? 'Submitting...' : 'Submit feedback'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
