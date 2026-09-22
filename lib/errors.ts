import { NextResponse } from 'next/server'

/**
 * Turns an unexpected exception into a response safe to show a user.
 *
 * Route handlers used to return `error.message` straight from the catch block,
 * which surfaced internals: a deployment missing NEXTAUTH_SECRET told every
 * visitor "NEXTAUTH_SECRET is not set; sessions cannot be signed". Validation
 * failures are still returned verbatim — those are written for the reader and
 * raised deliberately, not caught.
 */
export function serverError(context: string, error: unknown) {
  console.error(`[${context}]`, error)
  return NextResponse.json(
    { error: 'Something went wrong on our end. Please try again in a moment.' },
    { status: 500 }
  )
}
