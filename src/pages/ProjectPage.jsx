import { Link, useParams } from 'react-router-dom'
import { allProjects, doiUrl, getProject } from '../data/site'
import { Button, FullName, Pill, ProjectName, Row, Section } from '../components/ui'
import Citation from '../components/Citation'
import NotFound from './NotFound'

function host(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function Source({ source, asOf }) {
  const h = host(source)
  const label = h ? (
    <a href={source} target="_blank" rel="noreferrer" className="hover:underline">{h}</a>
  ) : (
    source
  )
  return (
    <span className="font-mono text-[11px] text-ink-muted">
      {label} · as of {asOf}
    </span>
  )
}

function Text({ title, children }) {
  const text = typeof children === 'string' ? children.trim() : ''
  return (
    <Section title={title}>
      {text ? <p className="text-ink-muted">{text}</p> : null}
    </Section>
  )
}

export default function ProjectPage() {
  const { slug } = useParams()
  const p = getProject(slug)
  if (!p) return <NotFound />

  const links = p.links || {}
  const metrics = p.metrics || []
  const usedBy = p.usedBy || []
  const related = allProjects().filter((o) => o.themeSlug === p.themeSlug && o.slug !== p.slug)
  const buttons = [
    ['GitHub', links.repo],
    ['PyPI', links.pypi],
    ['Paper', links.paper],
    ['Site', links.site],
  ].filter(([, href]) => href)

  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">
        <Link to="/research" className="hover:text-acc">Research</Link>
        {' / '}{p.theme}
      </p>
      <h1 className="font-serif text-3xl mt-1"><ProjectName project={p} /></h1>
      <FullName project={p} className="mb-1" />
      <p className="font-serif text-lg mt-1 mb-3">{p.summary}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {p.version && <Pill>Version {p.version}</Pill>}
        {p.date && <Pill>Released {p.date}</Pill>}
        {p.language && <Pill>{p.language}</Pill>}
        {p.license && <Pill>{p.license}</Pill>}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {p.doi && <Button href={doiUrl(p.doi)} variant="solid">DOI</Button>}
        {buttons.map(([label, href]) => <Button key={label} href={href}>{label}</Button>)}
      </div>

      <Text title="The problem">{p.problem}</Text>
      <Text title="What's new">{p.novelty}</Text>
      <Text title="My role">{p.role}</Text>

      <Section title="Impact">
        {metrics.length > 0 && (
          <div className="border border-rule bg-card rounded-sm px-4 py-2">
            {metrics.map((m) => (
              <Row key={m.label} aside={<Source source={m.source} asOf={m.asOf} />}>
                <span className="text-sm">{m.label}</span>{' '}
                <span className="font-medium">{m.value}</span>
              </Row>
            ))}
          </div>
        )}
      </Section>

      <Section title="Used by">
        {usedBy.map((u) => (
          <Row key={u.name} aside={u.proof && (
            <a href={u.proof} target="_blank" rel="noreferrer" className="hover:underline">
              proof <span aria-hidden="true">↗</span>
            </a>
          )}>
            {u.name}
          </Row>
        ))}
      </Section>

      {p.doi && (
        <Section title="Cite this">
          <Citation project={p} />
        </Section>
      )}

      <Section title="Related">
        {related.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {related.map((o) => (
              <Link key={o.slug} to={`/research/${o.slug}`}>
                <Pill><ProjectName project={o} /></Pill>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
