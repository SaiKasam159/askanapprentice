'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Apprentice {
  id: string
  first_name: string
  sector: string
  company: string
  bio: string
  calendly_link: string
  average_rating: number
  verified: boolean
}

interface Rating {
  id: string
  rating: number
  comment: string
  created_at: string
}

export default function ApprenticeDashboard() {
  const [apprentice, setApprentice] = useState<Apprentice | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // TODO: Get apprentice ID from auth session
        // For now, this is a placeholder
        const response = await fetch('/api/apprentice/profile')

        if (!response.ok) {
          throw new Error('Failed to load profile')
        }

        const data = await response.json()
        setApprentice(data.apprentice)
        setRatings(data.ratings || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
        <Link href="/" className="text-blue-600 hover:underline ml-4">
          Back to home
        </Link>
      </div>
    )
  }

  if (!apprentice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No apprentice profile found</p>
        <Link href="/apprentice/signup" className="text-blue-600 hover:underline">
          Create a profile
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      {!apprentice.verified && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-8">
          ⏳ Your profile is pending review. You'll appear in the directory once approved.
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white border rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-2">{apprentice.first_name}</h2>
        <p className="text-gray-600 mb-4">
          {apprentice.sector}{apprentice.company ? ` • ${apprentice.company}` : ''}
        </p>

        {apprentice.bio && (
          <p className="text-gray-700 mb-6">{apprentice.bio}</p>
        )}

        {/* Rating Summary */}
        <div className="bg-gray-50 rounded p-4 mb-6">
          <h3 className="font-semibold mb-2">Your Rating</h3>
          <div className="flex items-center">
            <div className="flex text-yellow-400 text-2xl">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={i < Math.round(apprentice.average_rating) ? '★' : '☆'}
                >
                </span>
              ))}
            </div>
            <span className="ml-3 text-lg font-semibold">
              {apprentice.average_rating.toFixed(1)} ({ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        </div>

        <a
          href={apprentice.calendly_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          View Calendly Link →
        </a>
      </div>

      {/* Ratings Section */}
      <div className="bg-white border rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Student Feedback</h2>

        {ratings.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No ratings yet. Students will leave feedback after your calls.
          </p>
        ) : (
          <div className="space-y-4">
            {ratings.map(rating => (
              <div key={rating.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < rating.rating ? '★' : '☆'}>
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-gray-700">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
