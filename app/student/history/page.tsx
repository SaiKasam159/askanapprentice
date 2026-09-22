'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface CallHistory {
  id: string
  scheduled_time: string
  call_duration: number
  status: string
  mentors: { name: string; company: string }
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

        const { data, error } = await supabase
          .from('bookings')
          .select('*, mentors:mentor_id(name, company)')
          .eq('student_id', studentId)
          .lt('scheduled_time', new Date().toISOString())
          .order('scheduled_time', { ascending: false })

        if (error) throw error
        setCalls(data || [])
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
                <p className="ac-h4">{call.mentors.name}</p>
                <p className="ac-small ac-muted ac-mt-1">{call.mentors.company} • {call.call_duration} min</p>
                <p className="ac-small ac-muted ac-mt-2">{new Date(call.scheduled_time).toLocaleString()}</p>
              </div>
              <span className="ac-badge ac-badge--solid">{call.status}</span>
            </li>
          ))}
        </div>
      )}
    </div>
  )
}
