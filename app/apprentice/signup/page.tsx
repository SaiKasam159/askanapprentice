'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SECTORS = [
  'Tech',
  'Finance',
  'Engineering',
  'Law',
  'Healthcare',
  'Other'
]

const COMPANIES = [
  'Goldman Sachs',
  'Barclays',
  'JPMorgan',
  'Microsoft',
  'Google',
  'Amazon',
  'Deloitte',
  'Other'
]

export default function ApprenticeSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    sector: '',
    company: '',
    bio: '',
    calendlyLink: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate form
      if (!formData.firstName || !formData.email || !formData.sector || !formData.calendlyLink) {
        throw new Error('Please fill in all required fields')
      }

      // Validate Calendly link
      if (!formData.calendlyLink.includes('calendly.com')) {
        throw new Error('Please enter a valid Calendly URL')
      }

      const response = await fetch('/api/apprentice/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Signup failed')
      }

      // Success - redirect to verification pending page
      router.push(`/apprentice/signup-success?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-2">Join as an Apprentice</h2>
      <p className="text-gray-600 mb-8">
        Share your experience and help guide the next generation of apprentices
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg border">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Your first name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Sector *</label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select your sector</option>
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select your company (optional)</option>
              {COMPANIES.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Calendly Link *</label>
          <input
            type="url"
            name="calendlyLink"
            value={formData.calendlyLink}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="https://calendly.com/yourname"
            required
          />
          <p className="text-xs text-gray-600 mt-1">
            Students will use this to book 30-minute calls with you
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Tell aspiring apprentices about your role, your journey, and what you love about your apprenticeship (200 characters)"
            rows={4}
            maxLength={200}
          />
          <p className="text-xs text-gray-600 mt-1">
            {formData.bio.length}/200 characters
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            ✓ Your profile will be manually reviewed before appearing in the directory
          </p>
          <p className="text-sm text-gray-700 mt-2">
            ✓ Only your first name and sector are visible to students
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating account...' : 'Create Apprentice Account'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Are you an aspiring apprentice?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}
