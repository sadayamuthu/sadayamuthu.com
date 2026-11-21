import { data, doiUrl, getProject } from '../data/site'
import { getRoutes } from '../routes'

export const SITE_URL = 'https://sadayamuthu.com'
const NAME = 'Karthikeyan Sadayamuthu'

const PAGES = {
  '/research': { page: 'Research', description: `Open-source frameworks by ${NAME}, with releases, DOIs and citations.` },
  '/publications': { page: 'Publications', description: `Papers, preprints, patents and archived software releases by ${NAME}.` },
  '/service': { page: 'Service', description: `Working groups, peer review and course review by ${NAME}.` },
  '/experience': { page: 'Experience', description: `Professional experience of ${NAME}.` },
  '/coverage': { page: 'Coverage', description: `Articles and mentions covering the work of ${NAME}.` },
}

export function canonicalUrl(path) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path.replace(/\/+$/, '')}/`
}

function personLd() {
  const { person } = data
  const ids = person.ids || {}
  const sameAs = [
    ids.orcid && `https://orcid.org/${ids.orcid}`,
    ids.github && `https://github.com/${ids.github}`,
    ids.linkedin,
    ids.scholar,
  ].filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.jobTitle,
    url: person.url,
    ...(sameAs.length > 0 && { sameAs }),
  }
}

function description(p) {
  if (!p.fullName || p.summary.includes(p.fullName)) return p.summary
  return `${p.fullName}: ${p.summary}`
}

function projectLd(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: p.name,
    description: p.summary,
    codeRepository: p.links?.repo,
    programmingLanguage: p.language,
    author: { '@type': 'Person', name: data.person.name, url: data.person.url },
    ...(p.doi && { identifier: doiUrl(p.doi) }),
  }
}

const title = (page) => `${page} · ${NAME}`

export function getMeta(pathname) {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const known = getRoutes().includes(path)
  if (path === '/') {
    return { title: NAME, description: data.person.statement, canonical: canonicalUrl('/'), jsonLd: personLd() }
  }
  const slug = known && path.startsWith('/research/') ? path.slice('/research/'.length) : null
  const project = slug && getProject(slug)
  if (project) {
    return { title: title(project.name), description: description(project), canonical: canonicalUrl(path), jsonLd: projectLd(project) }
  }
  if (known && PAGES[path]) {
    return { title: title(PAGES[path].page), description: PAGES[path].description, canonical: canonicalUrl(path), jsonLd: null }
  }
  return {
    title: title('Page not found'),
    description: 'There is nothing at this address.',
    canonical: canonicalUrl('/'),
    jsonLd: null,
    robots: 'noindex',
  }
}

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function headHtml(meta) {
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    meta.robots && `<meta name="robots" content="${esc(meta.robots)}">`,
    !meta.robots && `<link rel="canonical" href="${esc(meta.canonical)}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    !meta.robots && `<meta property="og:url" content="${esc(meta.canonical)}">`,
    `<meta property="og:type" content="${meta.jsonLd?.['@type'] === 'Person' ? 'profile' : 'website'}">`,
    meta.jsonLd &&
      `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`,
  ]
  return tags.filter(Boolean).join('\n    ')
}

