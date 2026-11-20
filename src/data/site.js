import data from './research.json'

export { data }

const FEATURED_ORDER = ['opengpl', 'anysql', 'controlgate', 'exposuregate']
const TYPE_ORDER = { paper: 0, preprint: 1, software: 2, patent: 3 }

export function doiUrl(doi) {
  return `https://doi.org/${doi}`
}

// In-development projects stay in the data but are never shown on the site.
const isReleased = (p) => p.status === 'released'

export function allProjects() {
  return data.themes.flatMap((t) => t.projects.filter(isReleased).map((p) => ({ ...p, theme: t.name, themeSlug: t.slug })))
}

// Themes with their released projects only; themes left empty are dropped.
export function visibleThemes() {
  return data.themes.map((t) => ({ ...t, projects: t.projects.filter(isReleased) })).filter((t) => t.projects.length > 0)
}

export function homeProjects() {
  const featured = featuredProjects()
  const slugs = new Set(featured.map((p) => p.slug))
  return [...featured, ...allProjects().filter((p) => !slugs.has(p.slug))]
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

function dateRank(s) {
  const m = /^([A-Za-z]+)\.?\s+(\d{4})$/.exec((s || '').trim())
  const i = m ? MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) : -1
  return m && i >= 0 ? Number(m[2]) * 12 + i : -1
}

export function sortedPeerReviews() {
  const group = (r) => (r.status === 'published' ? 0 : 1)
  return [...data.peerReviews].sort((a, b) => group(a) - group(b) || dateRank(b.date) - dateRank(a.date))
}

export function featuredProjects() {
  const rank = (p) => {
    const i = FEATURED_ORDER.indexOf(p.slug)
    return i === -1 ? FEATURED_ORDER.length : i
  }
  return allProjects()
    .filter((p) => p.featured)
    .sort((a, b) => rank(a) - rank(b))
}

export function getProject(slug) {
  return allProjects().find((p) => p.slug === slug)
}

export function publicationsByYear() {
  const software = allProjects()
    .filter((p) => p.doi)
    .map((p) => ({
      title: p.title,
      authors: 'K. Sadayamuthu',
      venue: 'Zenodo',
      year: Number((p.date || '').slice(0, 4)),
      type: 'software',
      slug: p.slug,
      doi: p.doi,
      links: { doi: doiUrl(p.doi) },
    }))
    .filter((e) => e.year)
  const byYear = new Map()
  for (const e of [...data.publications, ...software]) {
    if (!byYear.has(e.year)) byYear.set(e.year, [])
    byYear.get(e.year).push(e)
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([y, list]) => [y, [...list].sort((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9))])
}

export function stats() {
  const papers = data.publications.filter((p) => p.type === 'paper' || p.type === 'preprint').length
  return [
    { label: 'Open frameworks', value: allProjects().length },
    { label: 'Zenodo DOIs', value: allProjects().filter((p) => p.doi).length },
    { label: 'Peer reviews', value: data.peerReviews.length },
    { label: 'Papers', value: papers },
  ].filter((s) => s.value > 0)
}

export function primaryLink(project) {
  if (project.doi) return { label: 'DOI', href: doiUrl(project.doi) }
  if (project.links?.pypi) return { label: 'PyPI', href: project.links.pypi }
  return { label: 'GitHub', href: project.links?.repo }
}

function citeParts(project) {
  const { family, given } = data.person
  const year = (project.date || '').slice(0, 4)
  return { family, given, year, url: doiUrl(project.doi) }
}

export function citationText(project) {
  const { family, given, year, url } = citeParts(project)
  return `${family}, ${given[0]}. (${year}). ${project.title} [Computer software]. Zenodo. ${url}`
}

export function bibtex(project) {
  const { family, given, year, url } = citeParts(project)
  const key = `${family.toLowerCase()}_${project.repo.toLowerCase().replace(/[^a-z0-9]/g, '')}_${year}`
  return [
    `@software{${key},`,
    `  author = {${family}, ${given}},`,
    `  title = {${project.title}},`,
    `  year = {${year}},`,
    `  publisher = {Zenodo},`,
    `  doi = {${project.doi}},`,
    `  url = {${url}}`,
    '}',
  ].join('\n')
}
