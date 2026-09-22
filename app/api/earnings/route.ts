import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionFrom } from '@/lib/session'

/**
 * Share of each paid call ApprentaCall keeps. The mentor receives the rest.
 * Confirm this before taking real money: the dashboard previously paid the
 * mentor 15% and kept 85%, which is almost certainly backwards.
 */
const PLATFORM_FEE_RATE = 0.15

export async function GET(req: NextRequest) {
  const session = sessionFrom(req)
  if (!session || session.role !== 'apprentice') {
    return NextResponse.json({ error: 'Not signed in as a mentor' }, { status: 401 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('id, price, call_duration, scheduled_at, status, paid_at, students:student_id(name)')
    .eq('apprentice_id', session.userId)
    .gt('price', 0)
    .order('scheduled_at', { ascending: false })

  if (error) {
    console.error('Earnings lookup failed:', error)
    return NextResponse.json({ error: `Could not load earnings: ${error.message}` }, { status: 500 })
  }

  const rows = data ?? []
  const share = (price: number) => Number(price) * (1 - PLATFORM_FEE_RATE)
  const now = Date.now()

  const earnings = rows.map(b => ({
    id: b.id,
    studentName: (b.students as { name?: string } | null)?.name ?? 'A student',
    callDuration: b.call_duration,
    amount: share(b.price),
    // Paid once the call has happened; before that the money is held.
    status: b.status !== 'confirmed' ? 'pending'
      : new Date(b.scheduled_at).getTime() > now ? 'upcoming'
      : 'due',
    createdAt: b.paid_at ?? b.scheduled_at,
  }))

  const sum = (s: string) =>
    earnings.filter(e => e.status === s).reduce((total, e) => total + e.amount, 0)

  return NextResponse.json({
    platformFeeRate: PLATFORM_FEE_RATE,
    totalEarned: sum('due'),
    pendingPayout: sum('due') + sum('upcoming'),
    earnings,
  })
}
