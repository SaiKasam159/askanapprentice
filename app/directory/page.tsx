'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Apprentice {
  id: string
  first_name: string
  sector: string
  company: string
  bio: string
  average_rating: number
  calendly_link: string
}

const SECTORS = [
  'Tech',
  'Finance',
  'Engineering',
  'Law',
  'Healthcare',
  'All'
]

export default function Directory() {
  const [apprentices, setApprentices] = useState<Apprentice[]>([])
  const [selectedSector, setSelectedSector] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApprentices = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/apprentices', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch apprentices')
        }

        const data = await response.json()
        setApprentices(data.apprentices || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchApprentices()
  }, [])

  const filteredApprentices = selectedSector === 'All'
    ? apprentices
    : apprentices.filter(a => a.sector === selectedSector)

  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold mb-2">Meet Our Apprentices</h1>
      <p className="text-gray-600 mb-8">
        Book a 30-minute call with apprentices in your field
      </p>

      {/* Sector Filter */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-3">Filter by Sector</label>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedSector === sector
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Apprentices Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading apprentices...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredApprentices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No apprentices found in this sector yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApprentices.map(apprentice => (
            <div
              key={apprentice.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{apprentice.first_name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {apprentice.sector} • {apprentice.company}
                </p>

                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < Math.round(apprentice.average_rating) ? '★' : '☆'}
                      >
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    ({apprentice.average_rating.toFixed(1)})
                  </span>
                </div>

                {apprentice.bio && (
                  <p className="text-gray-700 text-sm mb-6 line-clamp-3">
                    {apprentice.bio}
                  </p>
                )}

                {/* Book Call Button */}
                {apprentice.calendly_link ? (
                  <a
                    href={apprentice.calendly_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 text-center block"
                  >
                    Book Call
                  </a>
                ) : (
                  <button
                    className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg font-semibold cursor-not-allowed"
                    disabled
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
