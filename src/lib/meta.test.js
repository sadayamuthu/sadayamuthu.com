import { getMeta, headHtml } from './meta'
import { getRoutes } from '../routes'
import { allProjects, getProject } from '../data/site'

it('home title is the display name', () => {
  expect(getMeta('/').title).toBe('Karthikeyan Sadayamuthu')
  expect(getMeta('/').canonical).toBe('https://sadayamuthu.com/')
  expect(getMeta('/').jsonLd['@type']).toBe('Person')
})

it('project page has SoftwareSourceCode JSON-LD with DOI identifier', () => {
  const m = getMeta('/research/opengpl')
  expect(m.title).toBe('OpenGPL · Karthikeyan Sadayamuthu')
  expect(m.canonical).toBe('https://sadayamuthu.com/research/opengpl/')
  expect(m.jsonLd['@type']).toBe('SoftwareSourceCode')
  expect(m.jsonLd.identifier).toBe('https://doi.org/10.5281/zenodo.23844061')
})

it('project without DOI has no identifier', () => {
  expect(getMeta('/research/openapl').jsonLd).not.toHaveProperty('identifier')
})

it('OCBC title is unchanged and its description starts with the full name', () => {
  const m = getMeta('/research/ocbc')
  expect(m.title).toBe('OCBC · Karthikeyan Sadayamuthu')
  expect(m.description.startsWith('Open Controls Baseline Catalog: ')).toBe(true)
  expect(getMeta('/research/opengpl').description).toBe(getProject('opengpl').summary)
})

it('publications has no JSON-LD and a page title', () => {
  const m = getMeta('/publications')
  expect(m.jsonLd).toBeNull()
  expect(m.title).toBe('Publications · Karthikeyan Sadayamuthu')
  expect(m.canonical).toBe('https://sadayamuthu.com/publications/')
})

it('unknown paths get the not-found meta with noindex', () => {
  const m = getMeta('/__404')
  expect(m.title).toBe('Page not found · Karthikeyan Sadayamuthu')
  expect(m.robots).toBe('noindex')
  expect(getMeta('/coverage').robots).toBe('noindex')
  expect(getMeta('/research/nope').robots).toBe('noindex')
})

it('headHtml escapes and includes tags', () => {
  const h = headHtml({ title: 'a<b', description: 'd"e', canonical: 'https://x/', jsonLd: { a: '</script>' } })
  expect(h).toContain('<title>a&lt;b</title>')
  expect(h).not.toContain('a<b')
  expect(h).toContain('content="d&quot;e"')
  expect(h).toContain('<link rel="canonical" href="https://x/">')
  expect(h).toContain('property="og:type"')
  expect(h).toContain('<script type="application/ld+json">')
  expect(h).not.toContain('</script>"')
})

it('headHtml omits JSON-LD when null and adds robots when set', () => {
  const h = headHtml({ title: 't', description: 'd', canonical: 'c', jsonLd: null, robots: 'noindex' })
  expect(h).not.toContain('ld+json')
  expect(h).toContain('<meta name="robots" content="noindex">')
})

it('getRoutes has a route per project plus 5 pages, and no /coverage while coverage is empty', () => {
  const r = getRoutes()
  expect(r).toHaveLength(5 + allProjects().length)
  expect(r).not.toContain('/research/intentlock')
  expect(r).not.toContain('/coverage')
  expect(r).toContain('/research/opengpl')
})
