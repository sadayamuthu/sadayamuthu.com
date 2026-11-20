import { Children } from 'react'
import { Link } from 'react-router-dom'

export function Eyebrow({ children, className = '' }) {
  return (
    <p className={`text-[11px] font-medium tracking-[0.14em] uppercase text-ink-muted ${className}`}>
      {children}
    </p>
  )
}

export function ProjectName({ project }) {
  if (!project.fullName) return project.name
  return <abbr title={project.fullName}>{project.name}</abbr>
}

export function FullName({ project, className = '' }) {
  if (!project.fullName) return null
  return <p className={`text-xs text-ink-muted ${className}`}>{project.fullName}</p>
}

export function Pill({ children, active = false, className = '', ...props }) {
  const tone = active
    ? 'bg-ink text-paper border-ink'
    : 'border-ink/25 text-ink hover:border-ink'
  const cls = `inline-flex items-center px-3 py-1 rounded-full border text-xs transition-colors ${tone} ${className}`
  if (props.onClick) {
    return <button type="button" className={cls} aria-pressed={active} {...props}>{children}</button>
  }
  return <span className={cls} {...props}>{children}</span>
}

const buttonBase =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border text-sm font-medium transition-colors'
const buttonTone = {
  solid: 'bg-ink text-paper border-ink hover:bg-acc hover:border-acc',
  outline: 'border-ink text-ink hover:bg-ink hover:text-paper',
}

export function Button({ to, href, variant = 'outline', children, className = '', ...props }) {
  const cls = `${buttonBase} ${buttonTone[variant]} ${className}`
  if (to) {
    return <Link to={to} className={cls} {...props}>{children}</Link>
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cls} {...props}>
      {children} <span aria-hidden="true">↗</span>
    </a>
  )
}

export function Section({ label, title, children }) {
  if (Children.toArray(children).length === 0) return null
  return (
    <section className="border-t border-rule py-6">
      {label && <Eyebrow className="mb-3">{label}</Eyebrow>}
      {title && <h2 className="font-serif text-2xl mb-3">{title}</h2>}
      {children}
    </section>
  )
}

export function Row({ children, aside }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2 border-b border-rule/60 last:border-b-0">
      <div className="min-w-0">{children}</div>
      {aside && <div className="font-mono text-xs text-acc">{aside}</div>}
    </div>
  )
}
