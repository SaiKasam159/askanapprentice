'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function GuardianConsent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyConsent = async () => {
      if (!token) {
        setStatus('error')
        setMessage('No consent token provided')
        return
      }

      try {
        const response = await fetch('/api/verify-guardian-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Thank you for providing consent!')
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Consent verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyConsent()
  }, [token, router])

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      {status === 'loading' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Verifying Consent...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {status === 'success' && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">Consent Confirmed!</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-600 mt-4">
              The student can now access Ask An Apprentice.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Consent Failed</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-600 mt-4">
              The link may have expired. Please contact support.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 pt-8 border-t">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          Back to home
        </Link>
      </div>
    </div>
  )
}
