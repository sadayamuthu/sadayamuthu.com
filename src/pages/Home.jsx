import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { data, homeProjects, sortedPeerReviews, primaryLink, publicationsByYear } from '../data/site'
import { FullName, ProjectName, Section, Row } from '../components/ui'
import ReviewRow from '../components/ReviewRow'
import { legacyRedirect } from '../lib/legacy'

const PHRASE = 'check their work before it ships'

function Statement({ text }) {
  const i = text.indexOf(PHRASE)
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <em className="text-acc">{PHRASE}</em>
      {text.slice(i + PHRASE.length)}
    </>
  )
}

function ProjectLink({ project }) {
  const { label, href } = primaryLink(project)
  if (!href) return null
  const text = project.doi ? project.doi : label
  return (
    <a href={href} target="_blank" rel="noreferrer" className="hover:underline">
      {text} <span aria-hidden="true">↗</span>
    </a>
  )
}

export default function Home() {
  const { person, recent = [] } = data
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const target = legacyRedirect(location.hash)
    if (target && target !== '/') navigate(target, { replace: true })
  }, [location.hash, navigate])

  const projects = homeProjects()
  const reviews = sortedPeerReviews()
  const pubs = publicationsByYear()
    .flatMap(([, list]) => list)
    .filter((e) => e.type !== 'software')
    .slice(0, 3)

  return (
    <div>
      <h1 className="sr-only">{person.name}</h1>
      <p className="font-serif text-2xl leading-snug mb-4">
        <Statement text={person.statement} />
      </p>
      {(person.bio || []).map((p, i) => (
        <p key={i} className="text-ink-muted mb-3">{p}</p>
      ))}

      <Section title="Research">
        {projects.length > 0 && (
          <>
            {projects.map((p) => (
              <Row key={p.slug} aside={<ProjectLink project={p} />}>
                <Link to={`/research/${p.slug}`} className="font-medium hover:text-acc"><ProjectName project={p} /></Link>
                <FullName project={p} />
                <p className="text-sm text-ink-muted">{p.summary}</p>
              </Row>
            ))}
            <p className="mt-3 text-sm">
              <Link to="/research" className="text-acc hover:underline">Browse by line of work →</Link>
            </p>
          </>
        )}
      </Section>

      <Section title="Publications">
        {pubs.length > 0 && (
          <>
            {pubs.map((e) => (
              <Row key={e.title} aside={String(e.year)}>
                <span className="font-medium">{e.title}</span>
                {e.venue && <p className="text-sm text-ink-muted">{e.venue}</p>}
              </Row>
            ))}
            <p className="mt-3 text-sm">
              <Link to="/publications" className="text-acc hover:underline">All publications →</Link>
            </p>
          </>
        )}
      </Section>

      <Section title="Peer review & judging">
        {reviews.map((r) => <ReviewRow key={r.title} review={r} />)}
      </Section>

      <Section label="Recent">
        {recent.map((r, i) => (
          <Row key={i} aside={r.date}>
            {r.url ? (
              <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-acc">{r.text}</a>
            ) : (
              r.text
            )}
          </Row>
        ))}
      </Section>
    </div>
  )
}
