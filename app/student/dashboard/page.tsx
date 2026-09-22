'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface StudentProfile {
  id: string
  name: string
  email: string
  sectors: string[]
}

export default function StudentDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
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

        const { data, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single()

        if (fetchError) throw fetchError
        setProfile(data)
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
        <button onClick={() => { localStorage.clear(); router.push('/'); }} className="ac-btn ac-btn--secondary">Log out</button>
      </div>

      <div className="ac-card">
        <p className="ac-overline">Your interests</p>
        <div className="ac-row ac-mt-4" style={{ gap: '8px', flexWrap: 'wrap' }}>
          {profile.sectors.map(s => <span key={s} className="ac-badge ac-badge--solid">{s}</span>)}
        </div>
      </div>

      <div className="ac-card ac-mt-6">
        <p className="ac-h3">Your bookings</p>
        <div className="ac-empty ac-mt-6">
          <p className="ac-h4">No bookings yet</p>
          <p className="ac-muted ac-small">Browse mentors to schedule your first call</p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/directory" className="ac-btn">Browse mentors</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
