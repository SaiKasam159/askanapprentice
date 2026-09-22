import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/** A calendar file for one booking. Nothing syncs automatically, so this is how a call reaches someone's calendar. */
const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

const escape = (text: string) => text.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId')
  if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })

  const { data: booking, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('id, scheduled_at, call_duration, status, meeting_url, apprentices:apprentice_id(name, company)')
    .eq('id', bookingId)
    .maybeSingle()

  if (error) {
    console.error('ICS lookup failed:', error)
    return NextResponse.json({ error: 'Could not load booking' }, { status: 500 })
  }
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.status !== 'confirmed') {
    return NextResponse.json({ error: 'This booking is not confirmed yet' }, { status: 409 })
  }

  const mentor = booking.apprentices as { name?: string; company?: string } | null
  const start = new Date(booking.scheduled_at)
  const end = new Date(start.getTime() + booking.call_duration * 60_000)
  const title = `ApprentaCall with ${mentor?.name ?? 'your mentor'}`
  const description = [
    `A ${booking.call_duration}-minute call with ${mentor?.name ?? 'your mentor'}` +
      (mentor?.company ? ` at ${mentor.company}.` : '.'),
    booking.meeting_url ? `\n\nJoin: ${booking.meeting_url}` : '',
  ].join('')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ApprentaCall//Booking//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@apprentacall`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    booking.meeting_url ? `URL:${booking.meeting_url}` : '',
    booking.meeting_url ? `LOCATION:${escape(booking.meeting_url)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="apprentacall-${booking.id.slice(0, 8)}.ics"`,
    },
  })
}
