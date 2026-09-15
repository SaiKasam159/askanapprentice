'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Email verified successfully!')
          // Redirect to directory after 3 seconds
          setTimeout(() => {
            router.push('/directory')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      {status === 'loading' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Verifying Email...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {status === 'success' && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">Email Verified!</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-600 mt-4">
              Redirecting you to the apprentice directory...
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Verification Failed</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700">{message}</p>
            <p className="text-sm text-gray-600 mt-4">
              The link may have expired. Please sign up again.
            </p>
          </div>
          <Link href="/signup" className="text-blue-600 hover:underline font-semibold">
            Back to Signup
          </Link>
        </div>
      )}
    </div>
  )
}
