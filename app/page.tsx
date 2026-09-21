import Link from 'next/link'

export default function Home() {
  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '64px' }}>
        <p className="ac-eyebrow">Book a call with a current apprentice</p>
        <h1 className="ac-h1">Get insider guidance from someone who's living the apprenticeship path.</h1>
        <p className="ac-lede">Talk to degree apprentices at your target firms. They've sat the same tests and interviews recently. Get the real story, not the recruiter version.</p>
      </div>

      <div className="ac-grid" style={{ '--cols': '2', '--cols-sm': '3' } as any}>
        <div className="ac-card">
          <p className="ac-overline">15 Minutes</p>
          <p className="ac-h3 ac-mt-3">Quick Questions</p>
          <p className="ac-small ac-muted ac-mt-2">One or two specific questions about your target firm or the application process.</p>
          <div className="ac-mt-4"><span className="ac-badge ac-badge--brass">Free intro</span></div>
        </div>

        <div className="ac-card ac-card--accent">
          <p className="ac-overline">30 Minutes</p>
          <p className="ac-h3 ac-mt-3">Deep Dive</p>
          <p className="ac-small ac-muted ac-mt-2">Your application, interview prep, or any part of the process that matters.</p>
          <div className="ac-mt-4 ac-row"><span className="ac-badge">Most popular</span></div>
        </div>

        <div className="ac-card">
          <p className="ac-overline">45 Minutes</p>
          <p className="ac-h3 ac-mt-3">Extended Session</p>
          <p className="ac-small ac-muted ac-mt-2">Deep dive plus follow-up. Covers multiple aspects of your journey.</p>
          <div className="ac-mt-4"></div>
        </div>
      </div>

      <div className="ac-mt-6" style={{ maxWidth: '56rem' }}>
        <h2 className="ac-h2 ac-mt-6">How it works</h2>
        <div className="ac-stack" style={{ '--gap': '24px', marginTop: '24px' } as any}>
          <div>
            <p className="ac-overline">1. Choose a call length</p>
            <p className="ac-body ac-mt-2">15 minutes (free intro), 30 minutes (£10), or 45 minutes (£15).</p>
          </div>
          <div>
            <p className="ac-overline">2. Pick a mentor</p>
            <p className="ac-body ac-mt-2">Browse apprentices from your target sectors. See their firm, year, and what they specialise in.</p>
          </div>
          <div>
            <p className="ac-overline">3. Choose your time</p>
            <p className="ac-body ac-mt-2">Pick a slot that works. Calls happen on Zoom or a platform you choose.</p>
          </div>
          <div>
            <p className="ac-overline">4. Talk</p>
            <p className="ac-body ac-mt-2">Get honest answers. Apprentices talk about their own experience—no corporate filter.</p>
          </div>
        </div>
      </div>

      <div className="ac-mt-8">
        <Link href="/pricing" className="ac-btn ac-btn--lg">Book a call</Link>
      </div>
    </div>
  )
}
