import { describe, it, expect } from 'vitest'
import { featuredProjects, getProject, primaryLink, stats, bibtex, citationText, doiUrl, allProjects, publicationsByYear, visibleThemes, homeProjects, sortedPeerReviews, data } from './site.js'

describe('site selectors', () => {
  const released = () => data.themes.flatMap((t) => t.projects).filter((p) => p.status === 'released')

  it('lists featured projects in order', () => {
    expect(featuredProjects().map((p) => p.slug)).toEqual(['opengpl', 'anysql', 'controlgate', 'exposuregate'])
  })
  it('getProject', () => {
    expect(getProject('exposuregate').doi).toBe('10.5281/zenodo.24241823')
    expect(getProject('openapl').doi).toBeNull()
    expect(getProject('nope')).toBeUndefined()
  })
  it('primaryLink', () => {
    expect(primaryLink(getProject('exposuregate')).label).toBe('DOI')
    expect(primaryLink({ doi: null, links: { pypi: 'https://pypi.org/project/x/' } })).toEqual({ label: 'PyPI', href: 'https://pypi.org/project/x/' })
    expect(primaryLink(getProject('openapl')).href).toBeUndefined()
    expect(primaryLink(getProject('opengpl')).href).toBe('https://doi.org/10.5281/zenodo.23844061')
    expect(primaryLink(getProject('unasked')).label).toBe('DOI')
    expect(primaryLink({ links: { repo: 'r' } })).toEqual({ label: 'GitHub', href: 'r' })
  })
  it('stats', () => {
    const s = stats()
    expect(s).toContainEqual({ label: 'Open frameworks', value: released().length })
    expect(s).toContainEqual({ label: 'Zenodo DOIs', value: released().filter((x) => x.doi).length })
    const papers = data.publications.filter((x) => x.type === 'paper' || x.type === 'preprint').length
    if (papers > 0) expect(s).toContainEqual({ label: 'Papers', value: papers })
    else expect(s.find((x) => x.label === 'Papers')).toBeUndefined()
  })
  it('hides in-development projects from every selector', () => {
    const dev = data.themes.flatMap((t) => t.projects).filter((x) => x.status === 'in-development')
    expect(dev.length).toBeGreaterThan(0)
    expect(allProjects()).toHaveLength(released().length)
    expect(allProjects().every((x) => x.status === 'released')).toBe(true)
    for (const d of dev) expect(getProject(d.slug)).toBeUndefined()
    const s = stats()
    expect(s.find((x) => x.label === 'Open frameworks').value).toBe(released().length)
    expect(s.find((x) => x.label === 'Zenodo DOIs').value).toBe(released().filter((x) => x.doi).length)
  })
  it('adds Judging roles and Talks tiles only when they have entries', () => {
    const orig = { judging: data.judging, talks: data.talks }
    try {
      data.judging = []
      data.talks = []
      expect(stats().map((x) => x.label)).not.toContain('Judging roles')
      expect(stats().map((x) => x.label)).not.toContain('Talks')
      data.judging = [{ title: 'J' }, { title: 'K' }]
      data.talks = [{ title: 'T' }]
      expect(stats()).toContainEqual({ label: 'Judging roles', value: 2 })
      expect(stats()).toContainEqual({ label: 'Talks', value: 1 })
    } finally {
      Object.assign(data, orig)
    }
  })
  it('counts every peer review, published or in review', () => {
    expect(stats()).toContainEqual({ label: 'Peer reviews', value: data.peerReviews.length })
  })
  it('homeProjects is the released projects, featured four first', () => {
    const h = homeProjects()
    expect(h).toHaveLength(released().length)
    expect(h.slice(0, 4).map((x) => x.slug)).toEqual(['opengpl', 'anysql', 'controlgate', 'exposuregate'])
    expect(new Set(h.map((x) => x.slug)).size).toBe(released().length)
  })
  it('sortedPeerReviews puts published first and each group newest first', () => {
    const r = sortedPeerReviews()
    expect(r.map((x) => x.status)).toEqual(['published', 'published', 'in-review', 'in-review', 'in-review', 'in-review', 'in-review'])
    expect(r[0].title).toMatch(/Designing the AI-First/)
    expect(r[1].title).toMatch(/Navigating Identity/)
    expect(r.slice(2, 4).map((x) => x.date)).toEqual(['Nov 2026', 'Nov 2026'])
    expect(r.slice(4).map((x) => x.date)).toEqual(['Oct 2026', 'Oct 2026', 'Oct 2026'])
  })
  it('visibleThemes keeps only themes with released projects, and only those projects', () => {
    const v = visibleThemes()
    expect(v.length).toBeGreaterThan(0)
    expect(v.length).toBeLessThan(data.themes.length)
    expect(v.every((t) => t.projects.length > 0 && t.projects.every((p) => p.status === 'released'))).toBe(true)
    expect(v.flatMap((t) => t.projects).map((p) => p.slug)).toEqual(released().map((p) => p.slug))
  })
  it('citations', () => {
    expect(bibtex(getProject('opengpl')).startsWith('@software{sadayamuthu_opengpl_')).toBe(true)
    expect(citationText(getProject('opengpl'))).toContain('Sadayamuthu, K. (2026).')
    expect(doiUrl('10.1/x')).toBe('https://doi.org/10.1/x')
  })
  it('allProjects adds theme name and slug', () => {
    const p = allProjects()[0]
    expect(p.theme).toBe('Compliance as code')
    expect(p.themeSlug).toBe('compliance-as-code')
  })
  it('publicationsByYear includes software, descending', () => {
    const y = publicationsByYear()
    expect(y[0][0]).toBe(2026)
    const sw = y[0][1].filter((e) => e.type === 'software')
    expect(sw.length).toBe(released().filter((x) => x.doi).length)
    const firstSoftware = y[0][1].findIndex((e) => e.type === 'software')
    expect(y[0][1].slice(0, firstSoftware).every((e) => e.type === 'paper' || e.type === 'preprint')).toBe(true)
    expect(y[0][1].some((e) => e.slug === 'openapl')).toBe(false)
  })
})
