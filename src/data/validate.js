const DOI = /^10\.\d+\//
const STATUSES = ['released', 'in-development']
const REVIEW_STATUSES = ['published', 'in-review']
const TYPES = ['paper', 'preprint', 'patent']

export function validateData(data) {
  const errors = []
  const err = (m) => errors.push(m)
  if (!data || typeof data !== 'object') return ['data must be an object']

  const person = data.person
  if (!person) err('person is missing')
  else {
    for (const k of ['name', 'given', 'family', 'url']) {
      if (!person[k]) err(`person.${k} is required`)
    }
  }

  const slugs = new Set()
  for (const theme of data.themes || []) {
    if (!theme.name || !theme.slug) err('theme needs name and slug')
    for (const p of theme.projects || []) {
      const id = p.slug || p.name || '(unnamed project)'
      if (!p.name) err(`project ${id}: name is required`)
      if ('fullName' in p && !(typeof p.fullName === 'string' && p.fullName.trim() !== '')) {
        err(`project ${id}: fullName must be a non-empty string`)
      }
      if (!p.slug) err(`project ${id}: slug is required`)
      else if (slugs.has(p.slug)) err(`duplicate slug: ${p.slug}`)
      else slugs.add(p.slug)
      if (!(p.doi === null || (typeof p.doi === 'string' && DOI.test(p.doi)))) {
        err(`project ${id}: doi must be null or match 10.<digits>/`)
      }
      if (!STATUSES.includes(p.status)) err(`project ${id}: status must be one of ${STATUSES.join(', ')}`)
      if (p.status === 'in-development') {
        if (p.doi !== null) err(`project ${id}: in-development project must have doi null`)
        if ((p.metrics || []).length > 0) err(`project ${id}: in-development project must have no metrics`)
        if ((p.usedBy || []).length > 0) err(`project ${id}: in-development project must have no usedBy`)
        if (p.featured) err(`project ${id}: in-development project must not be featured`)
      }
      for (const m of p.metrics || []) {
        for (const k of ['label', 'value', 'source', 'asOf']) {
          if (m[k] === undefined || m[k] === null || m[k] === '') err(`project ${id}: metric is missing ${k}`)
        }
      }
    }
  }

  for (const pub of data.publications || []) {
    const id = pub.title || '(untitled publication)'
    if (pub.visibility !== 'public') err(`publication "${id}": visibility must be "public"`)
    if (!TYPES.includes(pub.type)) err(`publication "${id}": type must be one of ${TYPES.join(', ')}`)
  }

  for (const r of data.peerReviews || []) {
    const id = r.title || ''
    if (!r.title) err('peerReview: title is required')
    if (!REVIEW_STATUSES.includes(r.status)) err(`peerReview "${id}": status must be one of ${REVIEW_STATUSES.join(', ')}`)
    if (r.status === 'published' && !r.url) err(`peerReview "${id}": a published review needs a url`)
  }
  for (const e of data.experience || []) {
    if (!e.org || !e.title) err('experience entry needs org and title')
  }
  return errors
}
