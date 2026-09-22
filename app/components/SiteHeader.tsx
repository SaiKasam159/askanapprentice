'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearSession } from '@/lib/session-client'

type Role = 'student' | 'apprentice' | null

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="ac-brass-mark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E3B872" />
        <stop offset="1" stopColor="#C99A4E" />
      </linearGradient>
    </defs>
    <rect width="28" height="28" rx="8" fill="url(#ac-brass-mark)" />
    <path d="M8 20 L14 7 L20 20" stroke="#08152A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="14" cy="16.5" r="1.7" fill="#08152A" />
  </svg>
)

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState<Role>(null)
  // The session lives in localStorage, which the server cannot see. Render the
  // signed-out header first and fill in the real state once mounted, otherwise
  // the markup will not match on hydration.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('userType')
    setRole(stored === 'student' || stored === 'apprentice' ? stored : null)
    setReady(true)
  }, [pathname])

  const logOut = () => {
    clearSession()
    setRole(null)
    router.push('/')
  }

  const dashboard = role === 'apprentice' ? '/apprentice/dashboard' : '/student/dashboard'

  return (
    <header className="ac-header">
      <div className="ac-header__inner">
        <Link href="/" className="ac-brand">
          <span className="ac-brand__mark"><Logo /></span>
          ApprentaCall
        </Link>

        <nav aria-label="Main">
          <ul className="ac-nav">
            {/* Kept visible when signed in too: mentors are the product. */}
            <li>
              <Link href="/directory" aria-current={pathname === '/directory' ? 'page' : undefined}>
                Browse mentors
              </Link>
            </li>

            {ready && role ? (
              <>
                <li>
                  <Link href={dashboard} aria-current={pathname === dashboard ? 'page' : undefined}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button type="button" onClick={logOut} className="ac-nav__button">Log out</button>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/login">Log in</Link></li>
                <li>
                  <Link href="/signup" className="ac-nav__cta">Get started</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
