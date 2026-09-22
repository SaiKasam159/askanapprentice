'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/session-client'
import { toast } from '@/lib/toast'

interface Mentor { id: string; name: string; company: string; sector: string; accepts_45min_calls: boolean }

const PRICES: Record<number, string> = { 30: 'Free', 45: '£10' }

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mentorId = searchParams.get('mentorId')

  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [duration, setDuration] = useState<30 | 45>(30)
  const [slots, setSlots] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [loadingMentor, setLoadingMentor] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mentorId) { router.push('/directory'); return }
    fetch(`/api/apprentices?id=${mentorId}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setMentor(data.mentor)
      })
      .catch(() => router.push('/directory'))
      .finally(() => setLoadingMentor(false))
  }, [mentorId, router])

  useEffect(() => {
    if (!mentorId) return
    setLoadingSlots(true)
    setSelected('')
    fetch(`/api/slots?mentorId=${mentorId}&duration=${duration}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Could not load availability')
        setSlots(data.slots)
        setError('')
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingSlots(false))
  }, [mentorId, duration])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) { setError('Pick a time first'); return }

    if (!localStorage.getItem('studentId')) {
      router.push('/student/login')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const data = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ mentorId, callDuration: duration, scheduledTime: selected }),
      })

      if (data.requiresPayment) {
        router.push(`/checkout?bookingId=${data.booking.id}`)
        return
      }
      toast.success('Booking confirmed')
      router.push(`/booking-confirmation?bookingId=${data.booking.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking'
      setError(message)
      toast.error(message)
      // A taken slot disappears from the list, so refresh it.
      if (message.includes('available') || message.includes('booked')) {
        const res = await fetch(`/api/slots?mentorId=${mentorId}&duration=${duration}`)
        const refreshed = await res.json()
        if (res.ok) { setSlots(refreshed.slots); setSelected('') }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingMentor) return <div className="ac-container ac-section"><p className="ac-muted">Loading mentor…</p></div>
  if (!mentor) return <div className="ac-container ac-section"><p className="ac-muted">Mentor not found</p></div>

  // Slots arrive as UTC instants; group them by the student's own local date.
  const byDate = slots.reduce<Record<string, string[]>>((acc, iso) => {
    const key = new Date(iso).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
    ;(acc[key] ??= []).push(iso)
    return acc
  }, {})

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
        <Link href="/directory" className="ac-link" style={{ marginBottom: '16px', display: 'inline-block' }}>
          ← Back to mentors
        </Link>

        <h1 className="ac-h1">Book a call with {mentor.name}</h1>
        <p className="ac-lede ac-mt-2">{mentor.company} • {mentor.sector}</p>

        <form onSubmit={handleSubmit} className="ac-card ac-mt-6">
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-fieldset">
              <legend className="ac-legend">Call length</legend>
              <div className="ac-segmented ac-mt-3" role="group" aria-label="Call length">
                {([30, 45] as const)
                  .filter(d => d === 30 || mentor.accepts_45min_calls)
                  .map(d => (
                    <button
                      key={d} type="button" onClick={() => setDuration(d)}
                      aria-pressed={duration === d}
                      className={duration === d ? 'is-active' : ''}
                    >
                      {d} min • {PRICES[d]}
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <p className="ac-overline">Pick a time</p>
              <p className="ac-hint ac-mt-1">Shown in your local time.</p>

              {loadingSlots ? (
                <p className="ac-muted ac-small ac-mt-4">Loading available times…</p>
              ) : slots.length === 0 ? (
                <div className="ac-empty ac-mt-4">
                  <p className="ac-h4">No times available</p>
                  <p className="ac-small ac-muted">
                    This mentor has not opened any slots for {duration}-minute calls yet. Try the other
                    length, or check back soon.
                  </p>
                </div>
              ) : (
                <div className="ac-stack ac-mt-4" style={{ '--gap': '16px' } as any}>
                  {Object.entries(byDate).map(([date, times]) => (
                    <div key={date}>
                      <p className="ac-small" style={{ fontWeight: 600, marginBottom: '8px' }}>{date}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {times.map(iso => (
                          <button
                            key={iso} type="button" onClick={() => setSelected(iso)}
                            aria-pressed={selected === iso}
                            className={`ac-btn ac-btn--sm ${selected === iso ? '' : 'ac-btn--secondary'}`}
                          >
                            {new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}>
                <p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={submitting || !selected} className="ac-btn ac-btn--block ac-btn--lg">
              {submitting ? 'Booking…' : duration === 45 ? 'Continue to payment' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
