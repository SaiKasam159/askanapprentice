'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/session-client'


interface CallHistory {
  id: string
  scheduled_at: string
  call_duration: number
  status: string
  apprentices: { name: string; company: string } | null
}

export default function CallHistory() {
  const router = useRouter()
  const [calls, setCalls] = useState<CallHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const studentId = localStorage.getItem('studentId')
        if (!studentId) {
          router.push('/student/login')
          return
        }

        const { bookings } = await apiFetch('/api/bookings')
        const now = Date.now()
        setCalls(bookings.filter((b: CallHistory) => new Date(b.scheduled_at).getTime() < now))
      } catch (err) {
        console.error('Failed to load call history', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCalls()
  }, [router])

  if (loading) return <div className="ac-container ac-section"><p className="ac-muted">Loading...</p></div>

  return (
    <div className="ac-container ac-section">
      <h1 className="ac-h1">Your call history</h1>
      <p className="ac-lede ac-mt-2">{calls.length} completed calls</p>

      {calls.length === 0 ? (
        <div className="ac-card ac-mt-6">
          <div className="ac-empty">
            <p className="ac-h4">No completed calls yet</p>
            <p className="ac-muted ac-small">Your completed calls will appear here</p>
            <div style={{ marginTop: '16px' }}>
              <Link href="/directory" className="ac-btn">Browse mentors</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="ac-rows ac-mt-6">
          {calls.map(call => (
            <li key={call.id} className="ac-card ac-card--sm">
              <div>
                <p className="ac-h4">{call.apprentices?.name}</p>
                <p className="ac-small ac-muted ac-mt-1">{call.apprentices?.company} • {call.call_duration} min</p>
                <p className="ac-small ac-muted ac-mt-2">{new Date(call.scheduled_at).toLocaleString()}</p>
              </div>
              <span className="ac-badge ac-badge--solid">{call.status}</span>
            </li>
          ))}
        </div>
      )}
    </div>
  )
}
