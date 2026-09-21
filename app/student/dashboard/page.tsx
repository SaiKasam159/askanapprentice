'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Booking {
  id: string
  apprentice_id: string
  call_duration: number
  price: number
  scheduled_at: string
  status: string
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const studentId = localStorage.getItem('studentId')
    if (!studentId) {
      window.location.href = '/signup'
      return
    }

    const fetchData = async () => {
      try {
        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single()

        setStudent(studentData)

        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('student_id', studentId)
          .order('scheduled_at', { ascending: false })

        setBookings(bookingsData || [])
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="ac-container ac-section ac-center">
        <p className="ac-body ac-muted">Loading...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="ac-container ac-section ac-center">
        <p className="ac-body ac-muted">Student not found</p>
      </div>
    )
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-row ac-row--between ac-mt-0" style={{ marginBottom: '48px' }}>
        <div>
          <h1 className="ac-h1">Welcome, {student.name}</h1>
          <p className="ac-lede ac-mt-2">Manage your calls and bookings</p>
        </div>
        <Link href="/pricing" className="ac-btn ac-btn--lg">
          Book a call
        </Link>
      </div>

      <div className="ac-grid ac-mt-6" style={{ '--cols': '2', '--cols-sm': '2' } as any}>
        <div className="ac-card">
          <p className="ac-overline">Calls booked</p>
          <p className="ac-stat__value ac-mt-3">{bookings.length}</p>
        </div>
        <div className="ac-card">
          <p className="ac-overline">Free call used</p>
          <p className="ac-stat__value ac-mt-3">{student.first_call_used ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="ac-empty ac-mt-8">
          <p className="ac-h3">No bookings yet</p>
          <p className="ac-body ac-muted">Book your first call with a mentor to get started</p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/pricing" className="ac-btn ac-btn--secondary">
              Browse mentors
            </Link>
          </div>
        </div>
      ) : (
        <div className="ac-mt-8">
          <h2 className="ac-h2">Your bookings</h2>
          <div className="ac-stack ac-mt-4" style={{ '--gap': '12px' } as any}>
            {bookings.map(booking => (
              <div key={booking.id} className="ac-card ac-card--sm">
                <div className="ac-row ac-row--between">
                  <div>
                    <p className="ac-h4">{booking.call_duration}m call</p>
                    <p className="ac-small ac-muted ac-mt-1">
                      {new Date(booking.scheduled_at).toLocaleDateString()} at {new Date(booking.scheduled_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="ac-right">
                    <p className="ac-h4">£{booking.price.toFixed(2)}</p>
                    <span className={`ac-badge ${booking.status === 'completed' ? 'ac-badge--solid' : 'ac-badge--brass'} ac-mt-1`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
