'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/session-client'


interface Booking {
  id: string
  student_id: string
  call_duration: number
  price: number
  scheduled_at: string
  status: string
}

interface Apprentice {
  id: string
  name: string
  apprenticeship_name: string
  sector: string
  verified: boolean
  created_at: string
}

export default function ApprenticeDashboard() {
  const [apprentice, setApprentice] = useState<Apprentice | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [earnings, setEarnings] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apprenticeId = localStorage.getItem('apprenticeId')
    if (!apprenticeId) {
      window.location.href = '/apprentice/signup'
      return
    }

    const fetchData = async () => {
      try {
        const [{ profile }, { bookings: bookingsData }] = await Promise.all([
          apiFetch('/api/profile'),
          apiFetch('/api/bookings'),
        ])
        setApprentice(profile)
        setBookings(bookingsData)
        setEarnings(bookingsData.reduce((sum: number, b: Booking) => sum + Number(b.price) * 0.85, 0))
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

  if (!apprentice) {
    return (
      <div className="ac-container ac-section ac-center">
        <p className="ac-body ac-muted">Apprentice profile not found</p>
      </div>
    )
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ marginBottom: '48px' }}>
        <h1 className="ac-h1">{apprentice.name}</h1>
        <div className="ac-stack" style={{ '--gap': '8px', marginTop: '12px' } as any}>
          <p className="ac-body">{apprentice.apprenticeship_name}</p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="ac-badge ac-badge--solid">{apprentice.sector}</span>
            {apprentice.verified ? (
              <span className="ac-verified">✓ Verified</span>
            ) : (
              <span className="ac-badge ac-badge--brass">Pending review</span>
            )}
          </div>
        </div>
      </div>

      {apprentice.verified && bookings.length === 0 && (
        <div className="ac-note ac-mt-0 ac-mb-6">
          <p className="ac-small ac-mt-0">
            <strong>Set your availability</strong> so students can book you. Until you do, your profile
            shows no bookable times.
          </p>
        </div>
      )}

      {!apprentice.verified && (
        <div className="ac-note ac-mt-0 ac-mb-6">
          <p className="ac-small ac-mt-0"><strong>Your profile is pending review.</strong> We manually verify all mentors before they appear in the directory. This usually takes 24-48 hours.</p>
        </div>
      )}

      <div className="ac-grid ac-mt-6" style={{ '--cols': '3' } as any}>
        <div className="ac-card">
          <p className="ac-overline">Calls booked</p>
          <p className="ac-stat__value ac-mt-3">{bookings.length}</p>
        </div>
        <div className="ac-card">
          <p className="ac-overline">Total earnings</p>
          <p className="ac-stat__value ac-mt-3">£{earnings.toFixed(2)}</p>
        </div>
        <div className="ac-card">
          <p className="ac-overline">Status</p>
          <p className="ac-stat__value ac-mt-3" style={{ fontSize: '1.125rem' }}>
            {apprentice.verified ? '✓' : '⏳'}
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="ac-empty ac-mt-8">
          <p className="ac-h3">No bookings yet</p>
          <p className="ac-body ac-muted">Share your profile with students to start getting bookings</p>
        </div>
      ) : (
        <div className="ac-mt-8">
          <h2 className="ac-h2">Upcoming calls</h2>
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
                    <p className="ac-h4">£{(Number(booking.price) * 0.85).toFixed(2)}</p>
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

      <div className="ac-mt-8" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link href="/apprentice/availability" className="ac-btn">
          Set availability
        </Link>
        <Link href="/apprentice/bookings" className="ac-btn ac-btn--secondary">
          Your bookings
        </Link>
        <Link href="/apprentice/analytics" className="ac-btn ac-btn--secondary">
          View analytics
        </Link>
        <Link href="/apprentice/earnings" className="ac-btn ac-btn--secondary">
          View earnings
        </Link>
        <Link href="/apprentice/profile" className="ac-btn ac-btn--secondary">
          Edit profile
        </Link>
      </div>
    </div>
  )
}
