'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/session-client'
import { toast } from '@/lib/toast'

interface Window { day_of_week: number; start_minute: number; end_minute: number }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const ZONES = ['Europe/London', 'Europe/Dublin', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Asia/Singapore', 'Australia/Sydney']

const toTimeValue = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const toMinutes = (value: string) => {
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}

export default function Availability() {
  const router = useRouter()
  const [windows, setWindows] = useState<Window[]>([])
  const [timezone, setTimezone] = useState('Europe/London')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiFetch('/api/availability')
      .then(data => {
        setWindows(data.windows)
        setTimezone(data.timezone)
      })
      .catch(err => {
        if (/signed in/i.test(err.message)) router.push('/apprentice/login')
        else toast.error(err.message)
      })
      .finally(() => setLoading(false))
  }, [router])

  const addWindow = (day: number) =>
    setWindows(prev => [...prev, { day_of_week: day, start_minute: 18 * 60, end_minute: 21 * 60 }])

  const removeWindow = (index: number) =>
    setWindows(prev => prev.filter((_, i) => i !== index))

  const updateWindow = (index: number, field: 'start_minute' | 'end_minute', value: string) =>
    setWindows(prev => prev.map((w, i) => (i === index ? { ...w, [field]: toMinutes(value) } : w)))

  const save = async () => {
    const invalid = windows.find(w => w.end_minute <= w.start_minute)
    if (invalid) {
      toast.error(`${DAYS[invalid.day_of_week]}: the end time must be after the start time`)
      return
    }

    setSaving(true)
    try {
      await apiFetch('/api/availability', {
        method: 'PUT',
        body: JSON.stringify({ windows, timezone }),
      })
      toast.success('Availability saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save availability')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="ac-container ac-section"><p className="ac-muted ac-center">Loading…</p></div>
  }

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 className="ac-h1">Your availability</h1>
          <Link href="/apprentice/dashboard" className="ac-btn ac-btn--secondary ac-btn--sm">Back</Link>
        </div>
        <p className="ac-lede">Students can only book inside these windows. They repeat every week.</p>

        <div className="ac-card ac-mt-6">
          <div className="ac-field">
            <label className="ac-label" htmlFor="tz">Your timezone</label>
            <select className="ac-input" id="tz" value={timezone} onChange={e => setTimezone(e.target.value)}>
              {ZONES.map(z => <option key={z} value={z}>{z.replace('_', ' ')}</option>)}
            </select>
            <p className="ac-hint ac-mt-1">Times below are in this zone. Students see them converted to their own.</p>
          </div>
        </div>

        <div className="ac-stack ac-mt-6" style={{ '--gap': '12px' } as any}>
          {DAYS.map((day, dayIndex) => {
            const dayWindows = windows
              .map((w, i) => ({ ...w, index: i }))
              .filter(w => w.day_of_week === dayIndex)

            return (
              <div key={day} className="ac-card ac-card--soft">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="ac-h4" style={{ margin: 0 }}>{day}</p>
                  <button onClick={() => addWindow(dayIndex)} className="ac-btn ac-btn--secondary ac-btn--sm">
                    Add window
                  </button>
                </div>

                {dayWindows.length === 0 ? (
                  <p className="ac-small ac-muted" style={{ marginTop: '12px' }}>Unavailable</p>
                ) : (
                  <div className="ac-stack" style={{ '--gap': '8px', marginTop: '12px' } as any}>
                    {dayWindows.map(w => (
                      <div key={w.index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          className="ac-input" type="time" aria-label={`${day} start`}
                          value={toTimeValue(w.start_minute)}
                          onChange={e => updateWindow(w.index, 'start_minute', e.target.value)}
                        />
                        <span className="ac-small ac-muted">to</span>
                        <input
                          className="ac-input" type="time" aria-label={`${day} end`}
                          value={toTimeValue(w.end_minute)}
                          onChange={e => updateWindow(w.index, 'end_minute', e.target.value)}
                        />
                        <button
                          onClick={() => removeWindow(w.index)}
                          className="ac-btn ac-btn--secondary ac-btn--sm"
                          aria-label={`Remove ${day} window`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button onClick={save} disabled={saving} className="ac-btn ac-btn--block ac-btn--lg ac-mt-6">
          {saving ? 'Saving…' : 'Save availability'}
        </button>

        <div className="ac-note ac-mt-6">
          <p className="ac-small ac-mt-0">
            Bookings need at least 12 hours' notice, and students can book up to three weeks ahead.
            Nothing here syncs with your personal calendar yet, so leave gaps where you might be busy.
          </p>
        </div>
      </div>
    </div>
  )
}
