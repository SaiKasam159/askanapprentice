'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function RateCall() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const apprenticeId = searchParams.get('apprenticeId')
  const apprenticeName = searchParams.get('name')

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!apprenticeId) {
        throw new Error('Apprentice ID is missing')
      }

      if (rating === 0) {
        throw new Error('Please select a rating')
      }

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apprenticeId,
          rating,
          comment: comment || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit rating')
      }

      setSuccess(true)
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/directory')
      }, 3000)
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
          <h2 className="text-2xl font-bold mb-2 text-green-600">Thank You!</h2>
          <p className="text-gray-700 mb-4">
            Your feedback has been submitted and will help other students.
          </p>
          <p className="text-sm text-gray-600">
            Redirecting you back to the directory...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-2">Rate Your Call</h1>
      <p className="text-gray-600 mb-8">
        Help us improve by sharing your feedback about {apprenticeName}
      </p>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-8 space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Star Rating */}
        <div>
          <label className="block text-lg font-semibold mb-4">
            How would you rate this call? *
          </label>
          <div className="flex gap-4 text-6xl">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={`transition cursor-pointer ${
                  (hoveredRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-lg font-semibold mb-2">
            Optional: Share your feedback
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="What did you learn? What could they improve? Be specific."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-600 mt-1">
            {comment.length}/500 characters (anonymous to the apprentice)
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            ✓ Your rating and comment help {apprenticeName} improve
          </p>
          <p className="text-sm text-gray-700 mt-2">
            ✓ Comments are anonymized and only visible to the apprentice
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/directory" className="text-gray-600 hover:text-gray-900">
          Skip for now
        </Link>
      </div>
    </div>
  )
}
