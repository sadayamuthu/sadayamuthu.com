import { data } from '../data/site'
import { Section } from '../components/ui'

const has = (s) => typeof s === 'string' && s.trim() !== ''

function dates(r) {
  if (!has(r.start)) return ''
  if (r.end === null) return `${r.start} – present`
  if (has(r.end)) return `${r.start} – ${r.end}`
  return r.start
}

export default function Experience() {
  const roles = data.experience || []
  const skills = (data.skills || []).filter(has)
  const certs = (data.certifications || []).filter(has)
  const education = (data.education || []).filter((e) => has(e.degree))
  return (
    <div>
      <h1 className="font-serif text-3xl mb-3">Experience</h1>
      <Section>
        {roles.length > 0 && roles.map((r) => (
          <div key={`${r.org}-${r.title}`} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2 border-b border-rule/60 last:border-b-0">
            <span><span className="font-serif text-lg">{r.org}</span> · {r.title}</span>
            {has(r.start) && <span className="font-mono text-xs text-acc">{dates(r)}</span>}
          </div>
        ))}
      </Section>
      <Section title="Skills & certifications">
        {skills.length > 0 && <p className="text-ink-muted mb-2">{skills.join(' · ')}</p>}
        {certs.length > 0 && <p className="text-ink-muted">{certs.join(' · ')}</p>}
      </Section>
      <Section title="Education">
        {education.length > 0 && education.map((e) => (
          <div key={e.degree} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
            <span><span className="font-serif">{e.degree}</span>{has(e.school) && ` · ${e.school}`}</span>
            {has(e.year) && <span className="font-mono text-xs text-acc">{e.year}</span>}
          </div>
        ))}
      </Section>
    </div>
  )
}
