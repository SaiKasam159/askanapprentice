'use client'

import { useState } from 'react'

/** Initials, used whenever no logo comes back. Reads as deliberate; a globe does not. */
function monogram(company: string): string {
  return company
    .split(/\s+/)
    .filter(w => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join('')
}

export function CompanyLogo({ company, size = 20 }: { company: string; size?: number }) {
  const [failed, setFailed] = useState(false)

  const shared = {
    width: size,
    height: size,
    borderRadius: '4px',
    flex: 'none' as const,
  }

  if (failed) {
    return (
      <span
        aria-hidden="true"
        style={{
          ...shared,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--ac-navy-700)',
          color: 'var(--ac-brass)',
          fontSize: size * 0.42,
          fontWeight: 600,
          letterSpacing: '.02em',
        }}
      >
        {monogram(company)}
      </span>
    )
  }

  return (
    <img
      src={`/api/company-logo?company=${encodeURIComponent(company)}`}
      alt=""
      aria-hidden="true"
      onError={() => setFailed(true)}
      style={{ ...shared, objectFit: 'contain', background: '#fff' }}
    />
  )
}
