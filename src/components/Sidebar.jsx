import { data, stats } from '../data/site'
import { Eyebrow } from './ui'

const { person } = data

function idLinks() {
  const { ids } = person
  const out = [{ label: 'ORCID', text: ids.orcid, href: `https://orcid.org/${ids.orcid}` }]
  if (ids.scholar) out.push({ label: 'Google Scholar', text: 'Profile', href: ids.scholar })
  out.push({ label: 'GitHub', text: ids.github, href: `https://github.com/${ids.github}` })
  out.push({ label: 'LinkedIn', text: 'Profile', href: ids.linkedin })
  return out
}

function obfuscatedEmail() {
  const e = person.ids.email
  if (!e) return null
  return e.replace('@', ' [at] ')
}

function Affiliations() {
  return (
    <p className="text-sm leading-snug">
      Founder,{' '}
      <a href={person.lab.url} target="_blank" rel="noreferrer" className="text-acc hover:underline">
        {person.lab.name} <span aria-hidden="true">↗</span>
      </a>
      <br />
      {person.jobTitle}, {person.employer}
    </p>
  )
}

function Stats({ items }) {
  if (items.length === 0) return null
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((s) => (
        <div key={s.label} className="border border-rule bg-card rounded-sm px-2 py-2 text-xs text-ink-muted">
          <b className="block font-serif text-xl text-ink">{s.value}</b>
          {s.label}
        </div>
      ))}
    </div>
  )
}

export default function Sidebar() {
  const ids = idLinks()
  const email = obfuscatedEmail()
  const all = stats()
  return (
    <>
      {/* Compact header below lg */}
      <div className="lg:hidden px-4 py-4 border-b border-rule">
        <h2 className="font-serif text-[17px] leading-tight">{person.name}</h2>
        <p className="text-xs text-ink-muted mt-1">{person.headline}</p>
        <p className="font-mono text-xs mt-2 flex flex-wrap gap-x-2">
          {ids.map((i, n) => (
            <span key={i.label}>
              {n > 0 && <span aria-hidden="true">· </span>}
              <a href={i.href} target="_blank" rel="noreferrer" className="text-acc" aria-label={`${i.label}: ${i.text}`}>
                {i.label === 'Google Scholar' ? 'Scholar' : i.label}
              </a>
            </span>
          ))}
        </p>
        {all.length > 0 && <div className="mt-3"><Stats items={all.slice(0, 2)} /></div>}
      </div>

      {/* Full sidebar at lg and up */}
      <aside className="hidden lg:block border-r border-rule pr-5 py-6">
        <h2 className="font-serif text-xl leading-tight">{person.name}</h2>
        <p className="text-sm text-ink-muted my-2">{person.headline}</p>
        <Affiliations />
        <dl className="font-mono text-xs mt-4 space-y-1">
          {ids.map((i) => (
            <div key={i.label} className="flex justify-between gap-2">
              <dt className="text-ink-muted">{i.label}</dt>
              <dd>
                <a href={i.href} target="_blank" rel="noreferrer" className="text-acc hover:underline">
                  {i.text} <span aria-hidden="true">↗</span>
                </a>
              </dd>
            </div>
          ))}
          {email && (
            <div className="flex justify-between gap-2">
              <dt className="text-ink-muted">Email</dt>
              <dd>{email}</dd>
            </div>
          )}
        </dl>
        {all.length > 0 && (
          <>
            <Eyebrow className="mt-5 mb-2">At a glance</Eyebrow>
            <Stats items={all} />
          </>
        )}
        {person.interests.length > 0 && (
          <>
            <Eyebrow className="mt-5 mb-2">Research interests</Eyebrow>
            <p className="text-sm text-ink-muted">{person.interests.join(' · ')}</p>
          </>
        )}
      </aside>
    </>
  )
}
