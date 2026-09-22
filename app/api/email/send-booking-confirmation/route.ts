import { NextRequest, NextResponse } from 'next/server'

interface BookingConfirmationPayload {
  studentEmail: string
  studentName: string
  mentorName: string
  mentorEmail: string
  callDuration: number
  scheduledTime: string
  isPaid: boolean
  bookingId: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BookingConfirmationPayload

    // Log the email event (replace with actual email service later)
    console.log('[EMAIL] Booking confirmation', {
      type: 'booking_confirmation',
      studentEmail: body.studentEmail,
      mentorEmail: body.mentorEmail,
      bookingId: body.bookingId,
      callDuration: body.callDuration,
      scheduledTime: body.scheduledTime,
      isPaid: body.isPaid,
    })

    // This would be replaced with actual email service
    // Example providers:
    // - Resend: await resend.emails.send(...)
    // - SendGrid: await sgMail.send(...)
    // - Postmark: await client.sendEmail(...)
    // - AWS SES: await ses.sendEmail(...)

    return NextResponse.json({
      success: true,
      message: 'Email queued for sending',
      emailType: 'booking_confirmation',
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
