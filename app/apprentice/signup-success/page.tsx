'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignupSuccess() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2 text-green-600">Account Created!</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            Your apprentice profile has been submitted for review.
          </p>

          {email && (
            <p className="text-sm text-gray-600">
              Confirmation sent to: <strong>{email}</strong>
            </p>
          )}

          <div className="bg-white rounded p-4 mt-6 text-left">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>1. Profile Review</strong>
                <p>Our team reviews your profile for completeness and authenticity</p>
              </li>
              <li>
                <strong>2. Approval</strong>
                <p>Once approved, you'll appear in the student directory</p>
              </li>
              <li>
                <strong>3. Book Calls</strong>
                <p>Students can book 30-minute calls with you via your Calendly link</p>
              </li>
            </ol>
          </div>

          <p className="text-sm text-gray-600 pt-4">
            You'll receive an email when your profile is approved. Typically within 24 hours.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Link href="/" className="block text-blue-600 hover:underline font-semibold">
          Back to home
        </Link>
      </div>
    </div>
  )
}
