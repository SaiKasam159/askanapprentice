import type { Metadata } from 'next'
import Link from 'next/link'
import { ToastContainer } from './components/ToastContainer'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ApprentaCall',
  description: 'Book calls with current apprentices for guidance and advice',
}

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const navStyle = `
  .ac-nav {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 4px;
  }

  .ac-nav a {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 12px;
    border-radius: 10px;
    font-size: .875rem;
    font-weight: 500;
    color: var(--ac-text-soft);
    text-decoration: none;
    transition: background-color .15s, color .15s;
  }

  .ac-nav a:hover {
    background: var(--ac-navy-700);
    color: var(--ac-text);
  }
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500&display=swap" />
        <link rel="stylesheet" href="/apprentacall.css" />
        <style>{navStyle}</style>
      </head>
      <body className="ac">
        <a className="ac-skip" href="#main">Skip to content</a>
        <header className="ac-header">
          <div className="ac-header__inner">
            <Link href="/" className="ac-brand">
              <span className="ac-brand__mark"><Logo /></span>
              ApprentaCall
            </Link>
            <nav>
              <ul className="ac-nav">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/directory">Mentors</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        <main id="main">
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  )
}
