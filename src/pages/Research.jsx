import { Link } from 'react-router-dom'
import { allProjects, visibleThemes, primaryLink } from '../data/site'
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

export default function Research() {
  const n = allProjects().length
  const themes = visibleThemes()
  const lines = themes.length
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
    </div>
  )
}
