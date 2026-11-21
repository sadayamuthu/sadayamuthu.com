import { Link } from 'react-router-dom'
import { data, allProjects, visibleThemes, primaryLink } from '../data/site'
import { FullName, ProjectName, Section } from '../components/ui'

function Card({ project }) {
  const { label, href } = primaryLink(project)
  const metrics = project.metrics || []
  return (
    <div className="relative border border-rule bg-card rounded-sm p-4 flex flex-col gap-2 hover:border-ink focus-within:border-ink transition-colors">
      <Link to={`/research/${project.slug}`} className="font-medium after:absolute after:inset-0">
        <ProjectName project={project} />
      </Link>
      <FullName project={project} />
      <p className="text-sm text-ink-muted">{project.summary}</p>
      <p className="relative font-mono text-xs text-acc mt-auto">
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className="hover:underline">
            {project.doi ? project.doi : label} <span aria-hidden="true">↗</span>
          </a>
        )}
        {href && project.language && <span className="text-ink-muted"> · </span>}
        {project.language && <span className="text-ink-muted">{project.language}</span>}
      </p>
      {metrics.length > 0 && (
        <p className="font-mono text-xs text-ink-muted">
          {metrics.map((m) => `${m.label} ${m.value}`).join(' · ')}
        </p>
      )}
    </div>
  )
}

const has = (v) => typeof v === 'string' && v.trim() !== ''

function Earlier({ item }) {
  const links = (item.links || []).filter((l) => has(l.href))
  const metrics = (item.metrics || []).filter((m) => has(m.value))
  const meta = [item.role, (item.languages || []).join(', ')].filter(has).join(' · ')
  return (
    <div className="py-2 border-b border-rule/60 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="font-medium">{item.name}</span>
        {has(item.years) && <span className="font-mono text-xs text-acc">{item.years}</span>}
      </div>
      {has(item.summary) && <p className="text-sm text-ink-muted">{item.summary}</p>}
      <p className="font-mono text-xs text-ink-muted mt-1">
        {meta}
        {links.map((l) => (
          <span key={l.href}>
            {meta || links.indexOf(l) > 0 ? ' · ' : ''}
            <a href={l.href} target="_blank" rel="noreferrer" className="text-acc hover:underline">
              {l.label} <span aria-hidden="true">↗</span>
            </a>
          </span>
        ))}
      </p>
      {metrics.map((m) => (
        <p key={m.label} className="font-mono text-xs text-ink-muted">
          {m.value} {m.label}
          {has(m.source) && (
            <>
              {' '}(<a href={m.source} target="_blank" rel="noreferrer" className="text-acc hover:underline">source</a>
              {has(m.asOf) && `, ${m.asOf}`})
            </>
          )}
        </p>
      ))}
    </div>
  )
}

export default function Research() {
  const n = allProjects().length
  const themes = visibleThemes()
  const lines = themes.length
  const earlier = (data.earlierOpenSource || []).filter((e) => has(e.name))
  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Research</h1>
      <p className="text-ink-muted mb-4">
        {`${n} open frameworks in ${lines} lines of work. Releases are archived on Zenodo with versioned DOIs.`}
      </p>
      {themes.map((t) => (
        <Section key={t.slug} label="Line of work" title={t.name}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.projects.map((p) => <Card key={p.slug} project={p} />)}
          </div>
        </Section>
      ))}
      <Section title="Earlier open source">
        {earlier.length > 0 && earlier.map((e) => <Earlier key={e.name} item={e} />)}
      </Section>
    </div>
  )
}
