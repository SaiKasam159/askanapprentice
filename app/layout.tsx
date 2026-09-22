import type { Metadata } from 'next'
import { ToastContainer } from './components/ToastContainer'
import { SiteHeader } from './components/SiteHeader'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ApprentaCall',
  description: 'Book calls with current apprentices for guidance and advice',
}

const navStyle = `
  /* Line the header up with the page content, which is a centred 72rem column. */
  .ac-header__inner {
    width: 100%;
    max-width: var(--ac-container);
    margin-inline: auto;
  }

  .ac-nav {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ac-nav a,
  .ac-nav__button {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 12px;
    border: 0;
    border-radius: 10px;
    background: none;
    font: inherit;
    font-size: .875rem;
    font-weight: 500;
    color: var(--ac-text-soft);
    text-decoration: none;
    cursor: pointer;
    transition: background-color .15s, color .15s;
  }

  .ac-nav a:hover,
  .ac-nav__button:hover {
    background: var(--ac-navy-700);
    color: var(--ac-text);
  }

  .ac-nav a[aria-current="page"] {
    color: var(--ac-text);
    background: var(--ac-navy-700);
  }

  .ac-nav a.ac-nav__cta {
    background: var(--ac-brass);
    color: var(--ac-navy-900);
    font-weight: 600;
  }

  .ac-nav a.ac-nav__cta:hover {
    background: var(--ac-brass-strong, #C99A4E);
    color: var(--ac-navy-900);
  }

  @media (max-width: 560px) {
    .ac-nav a,
    .ac-nav__button { padding: 0 8px; font-size: .8125rem; }
  }
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <SiteHeader />
        <main id="main">{children}</main>
        <ToastContainer />
      </body>
    </html>
  )
}
