import { data } from '../data/site'
import { Section } from '../components/ui'

export default function Coverage() {
  const has = (s) => typeof s === 'string' && s.trim() !== ''
  const items = data.coverage || []
  return (
    <div>
      <h1 className="font-serif text-3xl mb-3">Coverage</h1>
      <Section>
        {items.length > 0 && (
          <ul>
            {items.map((c, i) => {
              const meta = [c.outlet, c.date].filter(has).join(' · ')
              return (
                <li key={`${c.title}-${i}`} className="py-2 border-b border-rule/60 last:border-b-0">
                  {has(c.url) ? (
                    <a href={c.url} target="_blank" rel="noreferrer" className="font-serif text-lg hover:text-acc">
                      {c.title} <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className="font-serif text-lg">{c.title}</span>
                  )}
                  {meta && <span className="text-sm text-ink-muted"> · {meta}</span>}
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}
