'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CompanyLogo } from './CompanyLogo'

interface Mentor { id: string; name: string; company: string; sector: string; apprenticeship_name: string }

/** Real mentors on the homepage: the product is people, so show some. */
export function MentorStrip() {
  const [mentors, setMentors] = useState<Mentor[] | null>(null)

  useEffect(() => {
    fetch('/api/apprentices')
      .then(r => r.json())
      .then(d => setMentors(d.mentors ?? []))
      .catch(() => setMentors([]))
  }, [])

  // Nothing to show yet, and nothing gained by advertising that.
  if (!mentors || mentors.length === 0) return null

  return (
    <section style={{ marginTop: '96px' }}>
      <h2 className="ac-h3">Apprentices you can talk to right now</h2>

      <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'grid', gap: '1px', background: 'var(--ac-line-soft)' }}>
        {mentors.slice(0, 5).map(m => (
          <li key={m.id} style={{ background: 'var(--ac-navy-900, #08152A)' }}>
            <Link
              href={`/mentor/${m.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 4px', textDecoration: 'none', color: 'inherit' }}
            >
              <CompanyLogo company={m.company} size={28} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600 }}>{m.name}</span>
                <span className="ac-small ac-muted" style={{ display: 'block' }}>
                  {m.apprenticeship_name}, {m.company}
                </span>
              </span>
              <span className="ac-badge ac-badge--solid" style={{ flex: 'none' }}>{m.sector}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/directory" className="ac-link ac-small" style={{ display: 'inline-block', marginTop: '20px' }}>
        See everyone
      </Link>
    </section>
  )
}
