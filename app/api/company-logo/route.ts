import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'

/**
 * Company favicon, proxied.
 *
 * Fetching server-side keeps students' browsers from talking to Google on
 * every directory view. Google answers an unknown domain with a generic globe
 * rather than a 404, which would look broken beside a firm's name, so that one
 * image is fingerprinted and turned into a 404 for the caller to fall back on.
 */
const GENERIC_GLOBE_SHA256 =
  '59bfe9bc385ad69f50793ce4a53397316d7a875a7148a63c16df9b674c6cda64'

/** "J.P. Morgan" -> jpmorgan.com. Right for most firms, and wrong harmlessly. */
function guessDomain(company: string): string | null {
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, '')
  return slug.length >= 2 ? `${slug}.com` : null
}

export async function GET(req: NextRequest) {
  const company = req.nextUrl.searchParams.get('company')?.trim()
  if (!company) return NextResponse.json({ error: 'Missing company' }, { status: 400 })

  const domain = guessDomain(company)
  if (!domain) return NextResponse.json({ error: 'No logo' }, { status: 404 })

  try {
    const upstream = await fetch(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!upstream.ok) return NextResponse.json({ error: 'No logo' }, { status: 404 })

    const bytes = Buffer.from(await upstream.arrayBuffer())
    if (createHash('sha256').update(bytes).digest('hex') === GENERIC_GLOBE_SHA256) {
      return NextResponse.json({ error: 'No logo' }, { status: 404 })
    }

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'image/png',
        // Logos change rarely; a day of caching keeps the directory quick.
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'No logo' }, { status: 404 })
  }
}
