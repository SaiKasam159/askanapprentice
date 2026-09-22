import Link from 'next/link'

export default function Home() {
  return (
    <div className="ac-container ac-section">
      <div
        className="ac-stack"
        style={{ maxWidth: '48rem', margin: '0 auto 64px', textAlign: 'center' }}
      >
        <p className="ac-eyebrow">Real advice from real apprentices</p>
        <h1 className="ac-h1">Get insider guidance from someone living the apprenticeship path.</h1>
        <p className="ac-lede" style={{ margin: '0 auto' }}>
          Talk to degree apprentices at your target firms. They've sat the same tests and
          interviews recently. Get the real story, not the recruiter version.
        </p>
      </div>

      <div className="ac-grid ac-mt-6" style={{ '--cols': '1', '--cols-sm': '2' } as any}>
        <div className="ac-card ac-card--accent">
          <div className="ac-stack" style={{ '--gap': '16px' } as any}>
            <div>
              <p className="ac-overline">Looking to learn?</p>
              <h3 className="ac-h2 ac-mt-2">Book a call</h3>
              <p className="ac-body ac-mt-2">Get advice from current apprentices in your target sectors. 30-minute calls are free on your first booking.</p>
            </div>
            <div className="ac-stack" style={{ '--gap': '8px' } as any}>
              <Link href="/signup" className="ac-btn ac-btn--lg ac-btn--block">
                Sign up as student
              </Link>
              <p className="ac-small ac-center ac-muted" style={{ margin: 0 }}>
                Already have an account? <Link href="/student/login" className="ac-link">Log in</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="ac-card">
          <div className="ac-stack" style={{ '--gap': '16px' } as any}>
            <div>
              <p className="ac-overline">Already an apprentice?</p>
              <h3 className="ac-h2 ac-mt-2">Become a mentor</h3>
              <p className="ac-body ac-mt-2">Share your apprenticeship experience and earn money helping the next generation. You set the hours you are free, and students book inside them.</p>
            </div>
            <div className="ac-stack" style={{ '--gap': '8px' } as any}>
              <Link href="/apprentice/signup" className="ac-btn ac-btn--secondary ac-btn--lg ac-btn--block">
                Sign up as mentor
              </Link>
              <p className="ac-small ac-center ac-muted" style={{ margin: 0 }}>
                Already have an account? <Link href="/apprentice/login" className="ac-link">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="ac-mt-8" style={{ maxWidth: '56rem' }}>
        <h2 className="ac-h2">Why ApprentaCall?</h2>
        <div className="ac-grid ac-mt-4" style={{ '--cols': '1', '--cols-sm': '3' } as any}>
          <div className="ac-card ac-card--sm">
            <p className="ac-overline">Real conversations</p>
            <p className="ac-small ac-mt-3">No corporate filter. Apprentices share actual interview questions, firm culture, and what they wish they'd known.</p>
          </div>
          <div className="ac-card ac-card--sm">
            <p className="ac-overline">First call free</p>
            <p className="ac-small ac-mt-3">30-minute calls are free on your first booking. No risk, just real advice from people who've been there.</p>
          </div>
          <div className="ac-card ac-card--sm">
            <p className="ac-overline">Verified mentors</p>
            <p className="ac-small ac-mt-3">All mentors are manually verified current apprentices. You know exactly who you're talking to.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
