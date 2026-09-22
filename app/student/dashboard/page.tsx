'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/session-client'


interface StudentProfile {
  id: string
  name: string
  email: string
  sectors: string[]
}

interface Booking {
  id: string
  apprentice_id: string
  call_duration: number
  price: number
  scheduled_at: string
  status: string
  apprentices: { name: string } | null
}

export default function StudentDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const studentId = localStorage.getItem('studentId')
        if (!studentId) {
          router.push('/student/login')
          return
        }

        const [{ profile }, { bookings }] = await Promise.all([
          apiFetch('/api/profile'),
          apiFetch('/api/bookings'),
        ])
        setProfile(profile)
        setBookings(bookings)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  if (loading) {
    return (
      <div className="ac-container ac-section">
        <div className="ac-center">
          <p className="ac-body ac-muted">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="ac-container ac-section">
        <div className="ac-center">
          <p className="ac-body ac-muted">{error || 'Profile not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-row ac-row--between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="ac-h1">Welcome back, {profile.name}!</h1>
          <p className="ac-lede ac-mt-2">Book calls with mentors in your target sectors</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/student/history" className="ac-btn ac-btn--secondary ac-btn--sm">Past calls</Link>
          <Link href="/student/profile" className="ac-btn ac-btn--secondary ac-btn--sm">Profile</Link>
          <button onClick={() => { localStorage.clear(); router.push('/'); }} className="ac-btn ac-btn--secondary ac-btn--sm">Log out</button>
        </div>
      </div>

      <div className="ac-card">
        <p className="ac-overline">Your interests</p>
        <div className="ac-row ac-mt-4" style={{ gap: '8px', flexWrap: 'wrap' }}>
          {profile.sectors.map(s => <span key={s} className="ac-badge ac-badge--solid">{s}</span>)}
        </div>
      </div>

      <div className="ac-card ac-mt-6">
        <p className="ac-h3">Your bookings</p>
        {bookings.length === 0 ? (
          <div className="ac-empty ac-mt-6">
            <p className="ac-h4">No bookings yet</p>
            <p className="ac-muted ac-small">Browse mentors to schedule your first call</p>
            <div style={{ marginTop: '16px' }}>
              <Link href="/directory" className="ac-btn">Browse mentors</Link>
            </div>
          </div>
        ) : (
          <div className="ac-stack ac-mt-6" style={{ '--gap': '12px' } as any}>
            {bookings.map(booking => {
              const scheduledDate = new Date(booking.scheduled_at)
              const isUpcoming = scheduledDate > new Date()
              return (
                <div key={booking.id} className="ac-card ac-card--soft">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <p className="ac-body" style={{ fontWeight: 500, margin: 0 }}>{booking.apprentices?.name ?? 'Mentor'}</p>
                      <p className="ac-small ac-muted" style={{ marginTop: '4px' }}>
                        {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="ac-small ac-muted">{booking.call_duration} minutes • {Number(booking.price) > 0 ? `£${Number(booking.price).toFixed(2)}` : 'Free'}</p>
                    </div>
                    <div>
                      <span className={`ac-badge ${isUpcoming ? 'ac-badge--solid' : 'ac-badge--brass'}`}>
                        {isUpcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
