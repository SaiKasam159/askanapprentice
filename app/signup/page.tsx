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

export default function StudentSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUnder16, setIsUnder16] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    targetSector: '',
    targetCompany: '',
    ageVerified: false,
    guardianEmail: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isOver16 = e.target.checked
    setIsUnder16(!isOver16)
    setFormData(prev => ({
      ...prev,
      ageVerified: isOver16,
      guardianEmail: isOver16 ? '' : prev.guardianEmail
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate form
      if (!formData.email || !formData.firstName || !formData.targetSector) {
        throw new Error('Please fill in all required fields')
      }

      if (!formData.ageVerified) {
        throw new Error('You must be 16 or older to sign up')
      }

      if (isUnder16 && !formData.guardianEmail) {
        throw new Error('Guardian email is required for users under 16')
      }

      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Signup failed')
      }

      // Redirect to email confirmation page
      router.push(`/confirm-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h2 className="text-2xl font-bold mb-2">Join Us</h2>
      <p className="text-gray-600 mb-6">Get guidance from apprentices in your sector</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="you@school.ac.uk"
            required
          />
        </div>

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
          <label className="block text-sm font-medium mb-1">Target Sector *</label>
          <select
            name="targetSector"
            value={formData.targetSector}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">Select a sector</option>
            {SECTORS.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Company</label>
          <select
            name="targetCompany"
            value={formData.targetCompany}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a company (optional)</option>
            {COMPANIES.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ageVerified"
              checked={formData.ageVerified}
              onChange={handleAgeChange}
              className="w-4 h-4 rounded"
              required
            />
            <label htmlFor="ageVerified" className="ml-2 text-sm">
              I confirm I am 16 or older *
            </label>
          </div>

          {isUnder16 && (
            <div>
              <label className="block text-sm font-medium mb-1">Parent/Guardian Email *</label>
              <input
                type="email"
                name="guardianEmail"
                value={formData.guardianEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="parent@email.com"
                required={isUnder16}
              />
              <p className="text-xs text-gray-600 mt-1">
                We'll send a consent form to verify your parent/guardian's approval
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating account...' : 'Continue'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Are you an apprentice?{' '}
          <Link href="/apprentice/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}
