'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ConfirmEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  const handleResendEmail = async () => {
    setResending(true)
    try {
      const response = await fetch('/api/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        alert('Confirmation email resent!')
      } else {
        alert('Failed to resend email. Try again later.')
      }
    } catch (error) {
      alert('Error resending email')
    } finally {
      setResending(false)
    }
  }

  if (!email) return null

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <p className="text-gray-700 mb-4">
          We've sent a confirmation link to:
        </p>
        <p className="font-semibold text-gray-900 mb-6">{email}</p>
        <p className="text-sm text-gray-600">
          Click the link in the email to verify your account and access the apprentice directory.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Didn't receive an email? Check your spam folder or
        </p>
        <button
          onClick={handleResendEmail}
          disabled={resending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {resending ? 'Resending...' : 'Resend Confirmation Email'}
        </button>
      </div>

      <div className="mt-8 pt-8 border-t">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          Back to home
        </Link>
      </div>
    </div>
  )
}
