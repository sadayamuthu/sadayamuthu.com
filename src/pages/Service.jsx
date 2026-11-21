import { data, sortedPeerReviews } from '../data/site'
import { Section } from '../components/ui'
import ReviewRow from '../components/ReviewRow'

const has = (s) => typeof s === 'string' && s.trim() !== ''

function ExtLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-acc hover:underline">
      {children} <span aria-hidden="true">↗</span>
    </a>
  )
}

function Items({ list }) {
  return (
    <ul>
      {list.map((x, i) => {
        const meta = [x.venue, x.event, x.outlet, x.publisher, x.role, x.date].filter(has).join(' · ')
        return (
          <li key={`${x.title}-${i}`} className="py-2 border-b border-rule/60 last:border-b-0">
            <span className="font-serif text-lg">{x.title}</span>
            {meta && <p className="text-sm text-ink-muted">{meta}</p>}
            {has(x.summary) && <p className="text-ink-muted">{x.summary}</p>}
            {has(x.url) && <p className="text-xs font-mono mt-1"><ExtLink href={x.url}>Link</ExtLink></p>}
          </li>
        )
      })}
    </ul>
  )
}

function WorkingGroups({ list }) {
  const orgs = [...new Set(list.map((g) => g.org))]
  return orgs.map((org) => {
    const orgUrl = list.find((g) => g.org === org && has(g.orgUrl))?.orgUrl
    return (
      <div key={org} className="mb-4 last:mb-0">
        <h3 className="text-sm text-ink-muted mb-1">{orgUrl ? <ExtLink href={orgUrl}>{org}</ExtLink> : org}</h3>
        <ul>
          {list.filter((g) => g.org === org).map((g) => (
            <li key={g.name} className="flex justify-between gap-4 py-2 border-b border-rule/60 last:border-b-0">
              <span className="font-serif text-lg leading-snug">
                {has(g.url) ? <ExtLink href={g.url}>{g.name}</ExtLink> : g.name}
              </span>
              {has(g.role) && <span className="text-sm text-ink-muted whitespace-nowrap pt-1">{g.role}</span>}
            </li>
          ))}
        </ul>
      </div>
    )
  })
}

export default function Service() {
  const reviews = sortedPeerReviews()
  const judging = data.judging || []
  const talks = data.talks || []
  const groups = data.workingGroups || []
  return (
    <div>
      <h1 className="font-serif text-3xl mb-3">Professional Service</h1>
      <Section title="Working groups">{groups.length > 0 && <WorkingGroups list={groups} />}</Section>
      <Section title="Peer review">
        {reviews.length > 0 && (
          <div>
            {reviews.map((p) => <ReviewRow key={p.title} review={p} />)}
          </div>
        )}
      </Section>
      <Section title="Judging & editorial">{judging.length > 0 && <Items list={judging} />}</Section>
      <Section title="Talks">{talks.length > 0 && <Items list={talks} />}</Section>
    </div>
  )
}
