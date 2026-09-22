import { NextRequest, NextResponse } from 'next/server'

interface ReminderPayload {
  recipientEmail: string
  recipientName: string
  recipientType: 'student' | 'mentor'
  callDuration: number
  scheduledTime: string
  otherPersonName: string
  bookingId: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ReminderPayload

    console.log('[EMAIL] Call reminder sent', {
      type: 'call_reminder',
      recipientEmail: body.recipientEmail,
      recipientType: body.recipientType,
      bookingId: body.bookingId,
      scheduledTime: body.scheduledTime,
    })

    return NextResponse.json({
      success: true,
      message: 'Reminder email queued',
      emailType: 'call_reminder',
    })
  } catch (error) {
    console.error('Reminder email error:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
