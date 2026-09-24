import { getSupabaseAdmin } from '@/lib/supabase'
import { sendBookingEmails, sendCancellationEmails as send } from '@/lib/email'

/**
 * Loads everything a confirmation email needs and sends it.
 *
 * Swallows its own errors: the booking is already committed (and possibly
 * paid for) by the time this runs, so a mail problem must not fail the request.
 */
export async function sendConfirmationFor(bookingId: string): Promise<void> {
  try {
    const { data: booking, error } = await getSupabaseAdmin()
      .from('bookings')
      .select(`
        id, scheduled_at, call_duration, price, meeting_url, student_timezone,
        students:student_id(name, email),
        apprentices:apprentice_id(name, email, company, timezone)
      `)
      .eq('id', bookingId)
      .maybeSingle()

    if (error || !booking) {
      console.error('[email] could not load booking', bookingId, error)
      return
    }

    const student = booking.students as { name?: string; email?: string } | null
    const mentor = booking.apprentices as
      { name?: string; email?: string; company?: string; timezone?: string } | null

    if (!student?.email || !mentor?.email) {
      console.error('[email] booking', bookingId, 'is missing an address; not sending')
      return
    }

    await sendBookingEmails({
      bookingId: booking.id,
      scheduledAt: booking.scheduled_at,
      callDuration: booking.call_duration,
      price: Number(booking.price),
      meetingUrl: booking.meeting_url,
      studentName: student.name ?? 'A student',
      studentEmail: student.email,
      studentTimezone: booking.student_timezone,
      mentorName: mentor.name ?? 'your mentor',
      mentorEmail: mentor.email,
      mentorCompany: mentor.company ?? null,
      mentorTimezone: mentor.timezone ?? 'Europe/London',
    })
  } catch (err) {
    console.error('[email] confirmation for', bookingId, 'failed:', err)
  }
}

/** Same loading as the confirmation, then the cancellation notice. */
export async function sendCancellationEmails(
  bookingId: string,
  cancelledBy: 'student' | 'apprentice',
  refunded: boolean
): Promise<void> {
  try {
    const { data: booking, error } = await getSupabaseAdmin()
      .from('bookings')
      .select(`
        id, scheduled_at, call_duration, price, meeting_url, student_timezone,
        students:student_id(name, email),
        apprentices:apprentice_id(name, email, company, timezone)
      `)
      .eq('id', bookingId)
      .maybeSingle()

    if (error || !booking) {
      console.error('[email] could not load cancelled booking', bookingId, error)
      return
    }

    const student = booking.students as { name?: string; email?: string } | null
    const mentor = booking.apprentices as
      { name?: string; email?: string; company?: string; timezone?: string } | null

    if (!student?.email || !mentor?.email) {
      console.error('[email] cancelled booking', bookingId, 'is missing an address; not sending')
      return
    }

    await send({
      bookingId: booking.id,
      scheduledAt: booking.scheduled_at,
      callDuration: booking.call_duration,
      price: Number(booking.price),
      meetingUrl: booking.meeting_url,
      studentName: student.name ?? 'A student',
      studentEmail: student.email,
      studentTimezone: booking.student_timezone,
      mentorName: mentor.name ?? 'your mentor',
      mentorEmail: mentor.email,
      mentorCompany: mentor.company ?? null,
      mentorTimezone: mentor.timezone ?? 'Europe/London',
      cancelledBy,
      refunded,
    })
  } catch (err) {
    console.error('[email] cancellation for', bookingId, 'failed:', err)
  }
}
