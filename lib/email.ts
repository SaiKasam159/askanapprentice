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
      from: 'noreply@askanapprentice.com',
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
      from: 'noreply@askanapprentice.com',
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
