import { data } from '../data/site'
import { Section } from '../components/ui'

const has = (s) => typeof s === 'string' && s.trim() !== ''

function dates(r) {
  if (!has(r.start)) return ''
  if (r.end === null) return `${r.start} – present`
  if (has(r.end)) return `${r.start} – ${r.end}`
  return r.start
}

const item = (i) => (typeof i === 'string' ? { name: i } : i || {})

const groups = (list) =>
  (list || [])
    .map((g) => ({ group: g.group, items: (g.items || []).map(item).filter((i) => has(i.name)) }))
    .filter((g) => has(g.group) && g.items.length > 0)

function GroupList({ list, stacked = false }) {
  return (
    <dl className="text-sm">
      {list.map((g) => (
        <div key={g.group} className="py-2 border-b border-rule/60 last:border-b-0 sm:grid sm:grid-cols-[12rem_1fr] sm:gap-4">
          <dt className="font-medium">{g.group}</dt>
          {stacked ? (
            <dd className="text-ink-muted">
              <ul>
                {g.items.map((i) => (
                  <li key={i.name}>
                    {has(i.url) ? (
                      <a href={i.url} target="_blank" rel="noreferrer" className="text-acc hover:underline" aria-label={`${i.name}, ${g.group} (Credly badge)`}>
                        {i.name} <span aria-hidden="true">↗</span>
                      </a>
                    ) : i.name}
                  </li>
                ))}
              </ul>
            </dd>
          ) : (
            <dd className="text-ink-muted">{g.items.map((i) => i.name).join(' · ')}</dd>
          )}
        </div>
      ))}
    </dl>
  )
}

export default function Experience() {
  const roles = data.experience || []
  const skills = groups(data.skills)
  const certs = groups(data.certifications)
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
      <Section title="Skills">{skills.length > 0 && <GroupList list={skills} />}</Section>
      <Section title="Certifications">{certs.length > 0 && <GroupList list={certs} stacked />}</Section>
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
