'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function ConfirmCall() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const apprenticeId = searchParams.get('apprenticeId')
  const apprenticeName = searchParams.get('name')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleConfirm = async () => {
    setError('')
    setLoading(true)

    try {
      if (!apprenticeId) {
        throw new Error('Apprentice ID is missing')
      }

      const response = await fetch('/api/call-confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apprenticeId,
          studentConfirmed: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to confirm call')
      }

      setSuccess(true)
      // Redirect to rating page after 2 seconds
      setTimeout(() => {
        router.push(`/rate-call?apprenticeId=${apprenticeId}&name=${encodeURIComponent(apprenticeName || 'the apprentice')}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!apprenticeId) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-gray-600 mb-4">No apprentice selected</p>
        <Link href="/directory" className="text-blue-600 hover:underline">
          Back to directory
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2 text-green-600">Call Confirmed!</h2>
          <p className="text-gray-700 mb-6">
            Thanks for confirming your call with {apprenticeName}
          </p>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Now you can rate your experience and leave feedback.
            </p>
            <Link
              href={`/rate-call?apprenticeId=${apprenticeId}&name=${encodeURIComponent(apprenticeName || 'the apprentice')}`}
              className="inline-block w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Rate This Call
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold mb-2">Confirm Your Call</h1>
      <p className="text-gray-600 mb-8">
        Did you complete your call with {apprenticeName}?
      </p>

      <div className="bg-white border rounded-lg p-8 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            ✓ Only confirm if you completed the full call
          </p>
          <p className="text-sm text-gray-600">
            Both you and the apprentice need to confirm before ratings are visible
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Confirming...' : 'Yes, I Completed the Call'}
          </button>

          <Link
            href="/directory"
            className="block text-center w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
          >
            Not Now
          </Link>
        </div>

        <p className="text-xs text-gray-600 text-center">
          You can also confirm and rate later from your profile.
        </p>
      </div>
    </div>
  )
}
