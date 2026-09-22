'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/lib/toast'

interface Mentor {
  id: string
  name: string
  company: string
  sector: string
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mentorId = searchParams.get('mentorId')

  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [callDuration, setCallDuration] = useState<30 | 45>(30)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMentor = async () => {
      if (!mentorId) {
        router.push('/directory')
        return
      }

      try {
        const response = await fetch(`/api/apprentices?id=${mentorId}`)
        const data = await response.json()
        setMentor(data.mentor)
      } catch (err) {
        console.error('Failed to load mentor', err)
        router.push('/directory')
      } finally {
        setLoading(false)
      }
    }

    fetchMentor()
  }, [mentorId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time')
      return
    }

    setSubmitting(true)
    try {
      const studentId = localStorage.getItem('studentId')
      if (!studentId) {
        router.push('/student/login')
        return
      }

      const scheduledTime = new Date(`${selectedDate}T${selectedTime}`).toISOString()

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          mentorId,
          callDuration,
          scheduledTime,
          isPaid: callDuration === 45,
        }),
      })

      if (!response.ok) throw new Error('Booking failed')

      const data = await response.json()
      toast.success('Booking confirmed!')
      router.push(`/booking-confirmation?bookingId=${data.booking.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
      toast.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="ac-container ac-section"><p className="ac-muted">Loading mentor...</p></div>
  if (!mentor) return <div className="ac-container ac-section"><p className="ac-muted">Mentor not found</p></div>

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
        <Link href="/directory" className="ac-link ac-mb-4" style={{ marginBottom: '16px', display: 'inline-block' }}>← Back to mentors</Link>

        <h1 className="ac-h1">Book a call with {mentor.name}</h1>
        <p className="ac-lede ac-mt-2">{mentor.company} • {mentor.sector}</p>

        <form onSubmit={handleSubmit} className="ac-card ac-mt-6">
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-fieldset">
              <legend className="ac-legend">Call duration</legend>
              <div className="ac-stack ac-mt-3" style={{ '--gap': '8px' } as any}>
                <label className="ac-check">
                  <input type="radio" name="duration" checked={callDuration === 30} onChange={() => setCallDuration(30)} />
                  <span><strong>30 minutes</strong> — Free intro call</span>
                </label>
                <label className="ac-check">
                  <input type="radio" name="duration" checked={callDuration === 45} onChange={() => setCallDuration(45)} />
                  <span><strong>45 minutes</strong> — £10</span>
                </label>
              </div>
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="date">Preferred date</label>
              <input className="ac-input" id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} disabled={submitting} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="time">Preferred time</label>
              <input className="ac-input" id="time" type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} disabled={submitting} />
            </div>

            {error && <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}><p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p></div>}

            <button type="submit" disabled={submitting} className="ac-btn ac-btn--block ac-btn--lg">{submitting ? 'Confirming...' : 'Confirm booking'}</button>
          </div>
        </form>

        <div className="ac-note ac-mt-6">
          <p className="ac-small ac-mt-0">You'll receive a confirmation email with the call details. The mentor will receive your booking request.</p>
        </div>
      </div>
    </div>
  )
}
