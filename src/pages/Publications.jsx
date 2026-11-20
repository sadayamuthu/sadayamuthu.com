import { useState } from 'react'
import { Link } from 'react-router-dom'
import { publicationsByYear } from '../data/site'
import { Pill, Section } from '../components/ui'

const FILTERS = [
  ['paper', 'Papers'],
  ['preprint', 'Preprints'],
  ['software', 'Software'],
  ['patent', 'Patents'],
]

const has = (s) => typeof s === 'string' && s.trim() !== ''

function Entry({ e }) {
  const links = Object.entries(e.links || {}).filter(([, href]) => has(href))
  return (
    <li className="py-2 border-b border-rule/60 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <Pill>{e.type}</Pill>
        {e.type === 'software' && has(e.slug) ? (
          <Link to={`/research/${e.slug}`} className="font-serif text-lg hover:text-acc">{e.title}</Link>
        ) : (
          <span className="font-serif text-lg">{e.title}</span>
        )}
        {has(e.status) && <span className="text-xs font-mono text-ink-muted">{e.status}</span>}
      </div>
      {e.type === 'software' ? (
        has(e.doi) && <p className="text-sm text-ink-muted">Zenodo, {e.year}. doi:{e.doi}</p>
      ) : (
        <p className="text-sm text-ink-muted">{[e.authors, e.venue, e.year].filter((x) => x !== undefined && x !== null && String(x).trim() !== '').join(' · ')}</p>
      )}
      {links.length > 0 && (
        <p className="text-xs font-mono mt-1 flex gap-3">
          {links.map(([k, href]) => (
            <a key={k} href={href} target="_blank" rel="noreferrer" className="text-acc hover:underline">
              {k} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </p>
      )}
    </li>
  )
}

export default function Publications() {
  const [filter, setFilter] = useState('all')
  const years = publicationsByYear()
  const present = new Set(years.flatMap(([, list]) => list.map((e) => e.type)))
  const pills = FILTERS.filter(([t]) => present.has(t))
  const active = pills.some(([t]) => t === filter) ? filter : 'all'

  return (
    <div>
      <h1 className="font-serif text-3xl mb-3">Publications</h1>
      <div className="flex flex-wrap gap-2 mb-2">
        <Pill active={active === 'all'} onClick={() => setFilter('all')}>All</Pill>
        {pills.map(([t, label]) => (
          <Pill key={t} active={active === t} onClick={() => setFilter(t)}>{label}</Pill>
        ))}
      </div>
      {years.map(([year, list]) => {
        const shown = list.filter((e) => active === 'all' || e.type === active)
        return (
          <Section key={year} title={String(year)}>
            {shown.length > 0 && <ul>{shown.map((e) => <Entry key={`${e.type}-${e.slug || e.title}`} e={e} />)}</ul>}
          </Section>
        )
      })}
    </div>
  )
}
