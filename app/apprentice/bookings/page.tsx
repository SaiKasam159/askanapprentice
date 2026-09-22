'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Booking {
  id: string
  scheduled_time: string
  call_duration: number
  status: string
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

        const { data, error } = await supabase
          .from('bookings')
          .select('*, students:student_id(name, email)')
          .eq('mentor_id', mentorId)
          .order('scheduled_time', { ascending: true })

        if (error) throw error
        setBookings(data || [])
      } catch (err) {
        console.error('Failed to load bookings', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [router])

  if (loading) return <div className="ac-container ac-section"><p className="ac-muted">Loading...</p></div>

  const upcomingBookings = bookings.filter(b => new Date(b.scheduled_time) > new Date())
  const completedBookings = bookings.filter(b => new Date(b.scheduled_time) <= new Date())

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
              <div className="ac-rows ac-mt-4">
                {upcomingBookings.map(booking => (
                  <li key={booking.id} className="ac-card ac-card--sm">
                    <div>
                      <p className="ac-h4">{booking.students.name}</p>
                      <p className="ac-small ac-muted ac-mt-1">{new Date(booking.scheduled_time).toLocaleString()} • {booking.call_duration} min</p>
                      <p className="ac-small ac-mt-2">{booking.students.email}</p>
                    </div>
                    <span className="ac-badge ac-badge--solid ac-mt-3">{booking.status}</span>
                  </li>
                ))}
              </div>
            </div>
          )}

          {completedBookings.length > 0 && (
            <div className="ac-mt-8">
              <h2 className="ac-h2">Completed calls</h2>
              <div className="ac-rows ac-mt-4">
                {completedBookings.map(booking => (
                  <li key={booking.id} className="ac-card ac-card--sm">
                    <div>
                      <p className="ac-h4">{booking.students.name}</p>
                      <p className="ac-small ac-muted ac-mt-1">{new Date(booking.scheduled_time).toLocaleString()} • {booking.call_duration} min</p>
                    </div>
                  </li>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
