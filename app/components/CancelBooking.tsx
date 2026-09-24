'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/session-client'
import { toast } from '@/lib/toast'

/** Cancel control for either side of a booking. Confirms first, since it refunds. */
export function CancelBooking({
  bookingId,
  paid,
  onCancelled,
}: {
  bookingId: string
  paid: boolean
  onCancelled: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [working, setWorking] = useState(false)

  const cancel = async () => {
    setWorking(true)
    try {
      const { refunded } = await apiFetch('/api/bookings/cancel', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
      })
      toast.success(refunded ? 'Call cancelled and refunded' : 'Call cancelled')
      onCancelled()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel this call')
      setWorking(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="ac-btn ac-btn--secondary ac-btn--sm">
        Cancel
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span className="ac-small ac-muted">
        {paid ? 'Cancel and refund £10?' : 'Cancel this call?'}
      </span>
      <button onClick={cancel} disabled={working} className="ac-btn ac-btn--sm">
        {working ? 'Cancelling…' : 'Yes, cancel'}
      </button>
      <button onClick={() => setConfirming(false)} disabled={working} className="ac-btn ac-btn--secondary ac-btn--sm">
        Keep it
      </button>
    </div>
  )
}
