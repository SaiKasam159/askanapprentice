'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/session-client'
import { CancelBooking } from '@/app/components/CancelBooking'


interface Booking {
  id: string
  scheduled_at: string
  call_duration: number
  price: number
  status: string
  meeting_url: string | null
  students: { name: string; email: string }
}

export default function MentorBookings() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const mentorId = localStorage.getItem('apprenticeId')
        if (!mentorId) {
          router.push('/apprentice/login')
          return
        }

        const { bookings } = await apiFetch('/api/bookings')
        setBookings(bookings)
      } catch (err) {
        console.error('Failed to load bookings', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [router])

  if (loading) return <div className="ac-container ac-section"><p className="ac-muted">Loading...</p></div>

  const upcomingBookings = bookings.filter(b => new Date(b.scheduled_at) > new Date() && b.status !== 'cancelled')
  const completedBookings = bookings.filter(b => new Date(b.scheduled_at) <= new Date() && b.status !== 'cancelled')

  return (
    <div className="ac-container ac-section">
      <h1 className="ac-h1">Your bookings</h1>
      <p className="ac-lede ac-mt-2">{upcomingBookings.length} upcoming, {completedBookings.length} completed</p>

      {upcomingBookings.length === 0 && completedBookings.length === 0 ? (
        <div className="ac-card ac-mt-6">
          <div className="ac-empty">
            <p className="ac-h4">No bookings yet</p>
            <p className="ac-muted ac-small">Your bookings will appear here once students book calls with you</p>
          </div>
        </div>
      ) : (
        <>
          {upcomingBookings.length > 0 && (
            <div className="ac-mt-6">
              <h2 className="ac-h2">Upcoming calls</h2>
              <ul className="ac-rows ac-mt-4" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {upcomingBookings.map(booking => (
                  <li key={booking.id} className="ac-card ac-card--sm">
                    <div>
                      <p className="ac-h4">{booking.students.name}</p>
                      <p className="ac-small ac-muted ac-mt-1">{new Date(booking.scheduled_at).toLocaleString()} • {booking.call_duration} min</p>
                      <p className="ac-small ac-mt-2">{booking.students.email}</p>
                    </div>
                    {booking.meeting_url && (
                      <a
                        href={booking.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ac-link ac-small ac-mt-2"
                        style={{ display: 'inline-block' }}
                      >
                        Join the call
                      </a>
                    )}
                    <div className="ac-mt-3" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="ac-badge ac-badge--solid">{booking.status}</span>
                      <CancelBooking
                        bookingId={booking.id}
                        paid={Number(booking.price) > 0}
                        onCancelled={() => setBookings(prev =>
                          prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b))}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {completedBookings.length > 0 && (
            <div className="ac-mt-8">
              <h2 className="ac-h2">Completed calls</h2>
              <ul className="ac-rows ac-mt-4" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {completedBookings.map(booking => (
                  <li key={booking.id} className="ac-card ac-card--sm">
                    <div>
                      <p className="ac-h4">{booking.students.name}</p>
                      <p className="ac-small ac-muted ac-mt-1">{new Date(booking.scheduled_at).toLocaleString()} • {booking.call_duration} min</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
