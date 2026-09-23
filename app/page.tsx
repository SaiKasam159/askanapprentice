import Link from 'next/link'
import { MentorStrip } from './components/MentorStrip'

/** The questions sixth-formers actually ask, in their own words. */
const QUESTIONS = [
  'Is the money actually good, or does it just sound good?',
  'Do you get real work, or do they have you doing admin?',
  'Do you regret not going to uni?',
  'What was the assessment centre really like?',
]

const STEPS = [
  { title: 'Pick someone doing the job', body: 'Filter by sector and see where each mentor actually works.' },
  { title: 'Choose a time that suits you', body: 'Evenings and weekends, in your own timezone. No email back and forth.' },
  { title: 'Talk properly', body: 'Thirty minutes, one to one, on a link we send you. Ask the awkward things.' },
]

export default function Home() {
  return (
    <div className="ac-container ac-section">
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '64px',
          alignItems: 'start',
          paddingBlock: '24px 8px',
        }}
        className="ac-hero"
      >
        <div>
          <h1 className="ac-h1" style={{ maxWidth: '14ch' }}>
            Ask someone two years ahead of you.
          </h1>
          <p className="ac-lede" style={{ maxWidth: "38ch", marginTop: "20px" }}>
            Degree apprentices at the firms you are applying to, on a call, answering
            the things nobody else will.
          </p>

          <div className="ac-mt-6" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/directory" className="ac-btn ac-btn--lg">Find someone to talk to</Link>
            <span className="ac-small ac-muted">Your first call is free</span>
          </div>
        </div>

        {/* The questions are the hero. Quoted, because they are things people say. */}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '18px' }}>
          {QUESTIONS.map(q => (
            <li
              key={q}
              className="ac-h3"
              style={{
                margin: 0,
                fontWeight: 500,
                lineHeight: 1.35,
                paddingLeft: '18px',
                borderLeft: '2px solid var(--ac-brass)',
                color: 'var(--ac-text)',
              }}
            >
              {q}
            </li>
          ))}
        </ul>
      </section>

      <MentorStrip />

      <section style={{ marginTop: '96px' }}>
        <h2 className="ac-h3">How a call works</h2>
        <ol
          style={{
            listStyle: 'none', padding: 0, margin: '24px 0 0',
            display: 'grid', gap: '32px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            counterReset: 'step',
          }}
        >
          {STEPS.map(step => (
            <li key={step.title} style={{ counterIncrement: 'step' }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'block', fontSize: '0.8125rem', fontWeight: 600,
                  color: 'var(--ac-brass)', marginBottom: '10px',
                }}
              >
                Step {STEPS.indexOf(step) + 1}
              </span>
              <p className="ac-body" style={{ fontWeight: 600, margin: 0 }}>{step.title}</p>
              <p className="ac-body ac-muted ac-mt-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        style={{
          marginTop: '96px',
          borderTop: '1px solid var(--ac-line-soft)',
          paddingTop: '40px',
          display: 'flex',
          gap: '24px',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '46ch' }}>
          <p className="ac-body" style={{ fontWeight: 600, margin: 0 }}>Already doing an apprenticeship?</p>
          <p className="ac-body ac-muted ac-mt-2">
            Answer the questions you had two years ago, on your own hours, and get paid for
            the longer calls.
          </p>
        </div>
        <Link href="/apprentice/signup" className="ac-btn ac-btn--secondary">Mentor with us</Link>
      </section>
    </div>
  )
}
