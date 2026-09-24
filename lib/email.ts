import crypto from 'crypto'
import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (resendInstance) {
    return resendInstance
  }
  const apiKey = process.env.RESEND_API_KEY || ''
  resendInstance = new Resend(apiKey)
  return resendInstance
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateVerificationLink(
  token: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
): string {
  return `${baseUrl}/verify-email?token=${token}`
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  studentName?: string
) {
  try {
    const verificationLink = generateVerificationLink(token)

    // In development, log the link
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Verification link for ${email}: ${verificationLink}`)
    }

    // Only send if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log(`[SKIP] Resend not configured. Email would go to: ${email}`)
      return { success: true, skipped: true }
    }

    const result = await getResend().emails.send({
      from: senderAddress(),
      to: email,
      subject: 'Verify your email - Ask An Apprentice',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Ask An Apprentice!</h1>
          <p style="color: #666;">Hi ${studentName || 'there'},</p>
          <p style="color: #666;">Click the link below to verify your email and access the apprentice directory:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 24 hours.</p>
          <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
            Ask An Apprentice | Connecting aspiring apprentices with current apprentices
          </p>
        </div>
      `,
    })

    return result
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw error
  }
}

export async function sendGuardianConsentEmail(
  guardianEmail: string,
  studentName: string,
  studentEmail: string,
  token: string
) {
  try {
    const consentLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/guardian-consent?token=${token}`

    // In development, log the link
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Guardian consent link for ${guardianEmail}: ${consentLink}`)
    }

    // Only send if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log(`[SKIP] Resend not configured. Email would go to: ${guardianEmail}`)
      return { success: true, skipped: true }
    }

    const result = await getResend().emails.send({
      from: senderAddress(),
      to: guardianEmail,
      subject: 'Parental Consent Required - Ask An Apprentice',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Parental Consent Required</h1>
          <p style="color: #666;">Hi,</p>
          <p style="color: #666;">
            <strong>${studentName}</strong> (${studentEmail}) has signed up for Ask An Apprentice, a mentorship platform
            connecting UK students with current apprentices.
          </p>
          <p style="color: #666;">To complete their signup, we need your consent as their parent/guardian.</p>
          <div style="margin: 30px 0;">
            <a href="${consentLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Provide Consent
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 7 days.</p>
          <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
            Ask An Apprentice | Connecting aspiring apprentices with current apprentices
          </p>
        </div>
      `,
    })

    return result
  } catch (error) {
    console.error('Failed to send guardian consent email:', error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// Booking emails
// ---------------------------------------------------------------------------

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

let warnedAboutSender = false

/**
 * Resend rejects a from-address on an unverified domain, so an unset EMAIL_FROM
 * falls back to their shared sender. That sender only reaches the address the
 * Resend account was registered with, which is fine for testing and useless in
 * production — hence the warning.
 */
export function senderAddress(): string {
  const configured = process.env.EMAIL_FROM
  if (configured) return configured

  if (!warnedAboutSender) {
    warnedAboutSender = true
    console.warn(
      '[email] EMAIL_FROM is not set, falling back to onboarding@resend.dev. ' +
      'That address only delivers to your own Resend account email. ' +
      'Verify a domain at resend.com/domains and set EMAIL_FROM to send to anyone else.'
    )
  }
  return 'ApprentaCall <onboarding@resend.dev>'
}

export interface BookingEmailDetails {
  bookingId: string
  scheduledAt: string
  callDuration: number
  price: number
  meetingUrl: string | null
  studentName: string
  studentEmail: string
  studentTimezone: string | null
  mentorName: string
  mentorEmail: string
  mentorCompany: string | null
  mentorTimezone: string
}

function formatWhen(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone, weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(iso))
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

/** Shared shell so both emails look the same without pulling in a template library. */
function layout(heading: string, intro: string, rows: [string, string][], meetingUrl: string | null, footer: string) {
  const cells = rows
    .map(([label, value]) =>
      `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;font-size:14px">${escapeHtml(label)}</td>` +
      `<td style="padding:6px 0;color:#08152A;font-size:14px;font-weight:500">${escapeHtml(value)}</td></tr>`)
    .join('')

  const button = meetingUrl
    ? `<p style="margin:24px 0"><a href="${meetingUrl}" style="background:#08152A;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">Join the call</a></p>
       <p style="color:#6b7280;font-size:13px;margin:0 0 8px">Or paste this link: ${meetingUrl}</p>`
    : ''

  return `<!doctype html><html><body style="margin:0;background:#f6f7f9;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#C99A4E;margin:0 0 8px;font-weight:600">ApprentaCall</p>
    <h1 style="font-size:22px;color:#08152A;margin:0 0 12px">${escapeHtml(heading)}</h1>
    <p style="color:#374151;font-size:15px;line-height:1.5;margin:0 0 20px">${escapeHtml(intro)}</p>
    <table style="border-collapse:collapse;margin:0 0 8px">${cells}</table>
    ${button}
    <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:16px">${escapeHtml(footer)}</p>
  </div></body></html>`
}

/**
 * Tells both people a call is booked.
 *
 * Never throws. A booking is already paid for and committed by the time this
 * runs, so a mail outage must not surface as a failed booking.
 */
export async function sendBookingEmails(details: BookingEmailDetails): Promise<void> {
  const studentZone = details.studentTimezone || 'Europe/London'
  const calendarLink = `${APP_URL()}/api/bookings/ics?bookingId=${details.bookingId}`
  const cost = details.price > 0 ? `£${Number(details.price).toFixed(2)}` : 'Free'

  const messages = [
    {
      to: details.studentEmail,
      subject: `Your call with ${details.mentorName} is booked`,
      html: layout(
        'Your call is booked',
        `You're speaking with ${details.mentorName}${details.mentorCompany ? ` at ${details.mentorCompany}` : ''}.`,
        [
          ['When', formatWhen(details.scheduledAt, studentZone)],
          ['Length', `${details.callDuration} minutes`],
          ['Cost', cost],
        ],
        details.meetingUrl,
        `Add it to your calendar: ${calendarLink} — nothing syncs automatically, so this is worth doing now.`
      ),
    },
    {
      to: details.mentorEmail,
      subject: `New booking: ${details.studentName}, ${details.callDuration} minutes`,
      html: layout(
        'You have a new booking',
        `${details.studentName} booked a ${details.callDuration}-minute call with you.`,
        [
          ['When', formatWhen(details.scheduledAt, details.mentorTimezone)],
          ['Student', `${details.studentName} (${details.studentEmail})`],
          ['Length', `${details.callDuration} minutes`],
        ],
        details.meetingUrl,
        `Add it to your calendar: ${calendarLink} — this does not appear in your calendar on its own.`
      ),
    },
  ]

  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set; skipping booking emails for', details.bookingId)
    return
  }

  const resend = getResend()
  await Promise.all(messages.map(async message => {
    try {
      const { error } = await resend.emails.send({ from: senderAddress(), ...message })
      if (error) console.error(`[email] send to ${message.to} failed:`, error)
    } catch (err) {
      console.error(`[email] send to ${message.to} threw:`, err)
    }
  }))
}

export interface CancellationDetails extends BookingEmailDetails {
  cancelledBy: 'student' | 'apprentice'
  refunded: boolean
}

/** Tells the other party a call is off. Never throws, for the same reason as the confirmation. */
export async function sendCancellationEmails(details: CancellationDetails): Promise<void> {
  const studentZone = details.studentTimezone || 'Europe/London'
  const byMentor = details.cancelledBy === 'apprentice'

  const refundLine = details.refunded
    ? 'Your £10 has been refunded. It usually reaches your account within five to ten working days.'
    : 'Nothing was charged for this call.'

  const messages = [
    {
      to: details.studentEmail,
      subject: `Cancelled: your call with ${details.mentorName}`,
      html: layout(
        'Your call has been cancelled',
        byMentor
          ? `${details.mentorName} can no longer make this call. You can book someone else whenever suits you.`
          : 'You cancelled this call.',
        [
          ['Was', formatWhen(details.scheduledAt, studentZone)],
          ['Mentor', details.mentorName],
        ],
        null,
        `${refundLine} Browse other mentors at ${APP_URL()}/directory`
      ),
    },
    {
      to: details.mentorEmail,
      subject: `Cancelled: your call with ${details.studentName}`,
      html: layout(
        'A call has been cancelled',
        byMentor
          ? 'You cancelled this call. The slot is free again.'
          : `${details.studentName} cancelled. The slot is free again for someone else to book.`,
        [
          ['Was', formatWhen(details.scheduledAt, details.mentorTimezone)],
          ['Student', details.studentName],
        ],
        null,
        `Your availability is unchanged. Adjust it at ${APP_URL()}/apprentice/availability`
      ),
    },
  ]

  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set; skipping cancellation emails for', details.bookingId)
    return
  }

  const resend = getResend()
  await Promise.all(messages.map(async message => {
    try {
      const { error } = await resend.emails.send({ from: senderAddress(), ...message })
      if (error) console.error(`[email] cancellation to ${message.to} failed:`, error)
    } catch (err) {
      console.error(`[email] cancellation to ${message.to} threw:`, err)
    }
  }))
}
