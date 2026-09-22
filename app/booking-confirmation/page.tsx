'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  scheduled_at: string
  call_duration: number
  price: number
  status: string
  meeting_url: string | null
  apprentices: { name: string; company: string } | null
}

export default function BookingConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('bookingId')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) {
      router.push('/student/dashboard')
      return
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings?bookingId=${bookingId}`)
        const data = await response.json()
        setBooking(data.booking)
      } catch (err) {
        console.error('Failed to load booking', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, router])

  if (loading) return <div className="ac-container ac-section"><p className="ac-muted">Loading...</p></div>

  const scheduledDate = booking?.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString() : ''
  const scheduledTime = booking?.scheduled_at ? new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
        <div className="ac-card">
          <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>✓</p>
          <h1 className="ac-h1">Booking confirmed!</h1>
          <p className="ac-lede ac-mt-4">Your call with {booking?.apprentices?.name} is booked.</p>

          {booking && (
            <div className="ac-kv ac-mt-6">
              <dt>Mentor</dt>
              <dd>{booking.apprentices?.name} • {booking.apprentices?.company}</dd>
              <dt>Date</dt>
              <dd>{scheduledDate}</dd>
              <dt>Time</dt>
              <dd>{scheduledTime}</dd>
              <dt>Duration</dt>
              <dd>{booking.call_duration} minutes</dd>
            </div>
          )}

          {booking?.status === 'confirmed' && booking.meeting_url && (
            <div className="ac-card ac-card--soft ac-mt-6" style={{ textAlign: 'left' }}>
              <p className="ac-overline">Join the call here</p>
              <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer" className="ac-link ac-small">
                {booking.meeting_url}
              </a>
              <p className="ac-hint ac-mt-2">
                Anyone with this link can join, so keep it to yourself. It opens in the browser, with no
                account needed.
              </p>
            </div>
          )}

          <div className="ac-stack ac-mt-6" style={{ '--gap': '12px' } as any}>
            {booking?.status === 'confirmed' && (
              <a href={`/api/bookings/ics?bookingId=${booking.id}`} className="ac-btn ac-btn--block">
                Add to calendar
              </a>
            )}
            <Link href="/student/dashboard" className="ac-btn ac-btn--block ac-btn--lg">Back to dashboard</Link>
            <Link href="/directory" className="ac-btn ac-btn--secondary ac-btn--block">Browse more mentors</Link>
          </div>

          <div className="ac-note ac-mt-6">
            <p className="ac-small ac-mt-0"><strong>Next steps:</strong> Check your email for the meeting link. The mentor will confirm receipt of your booking.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
