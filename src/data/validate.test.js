import { describe, it, expect } from 'vitest'
import { data } from './site.js'
import { validateData } from './validate.js'

const clone = () => JSON.parse(JSON.stringify(data))

describe('validateData', () => {
  it('accepts the real file', () => {
    expect(validateData(data)).toEqual([])
  })
  it('rejects non-public publications', () => {
    const d = clone()
    d.publications = [{ title: 't', authors: 'a', venue: 'v', year: 2026, type: 'paper', status: 's', visibility: 'hidden', links: {} }]
    expect(validateData(d).join('\n')).toContain('visibility')
  })
  it('rejects duplicate slugs', () => {
    const d = clone()
    d.themes[0].projects[1].slug = d.themes[0].projects[0].slug
    expect(validateData(d).join('\n')).toContain('duplicate slug')
  })
  it('rejects bad DOI', () => {
    const d = clone()
    d.themes[0].projects[0].doi = ''
    expect(validateData(d).length).toBeGreaterThan(0)
  })
  it('requires a valid status on every project', () => {
    for (const bad of [undefined, '', 'planned']) {
      const d = clone()
      if (bad === undefined) delete d.themes[0].projects[0].status
      else d.themes[0].projects[0].status = bad
      expect(validateData(d).join('\n')).toContain('status must be')
    }
  })
  it('accepts released projects without a DOI', () => {
    const d = clone()
    d.themes[0].projects[0].doi = null
    expect(validateData(d)).toEqual([])
  })
  describe('in-development projects', () => {
    const dev = () => {
      const d = clone()
      const p = d.themes[0].projects[0]
      Object.assign(p, { status: 'in-development', doi: null, metrics: [], usedBy: [], featured: false })
      return [d, p]
    }
    it('are valid with no DOI, metrics, usedBy and featured false', () => {
      expect(validateData(dev()[0])).toEqual([])
    })
    it('must not have a DOI', () => {
      const [d, p] = dev()
      p.doi = '10.5281/zenodo.1'
      expect(validateData(d).join('\n')).toContain('in-development')
    })
    it('must not have metrics', () => {
      const [d, p] = dev()
      p.metrics = [{ label: 'l', value: '1', source: 's', asOf: 'x' }]
      expect(validateData(d).join('\n')).toContain('in-development')
    })
    it('must not have usedBy', () => {
      const [d, p] = dev()
      p.usedBy = [{ name: 'x' }]
      expect(validateData(d).join('\n')).toContain('in-development')
    })
    it('must not be featured', () => {
      const [d, p] = dev()
      p.featured = true
      expect(validateData(d).join('\n')).toContain('in-development')
    })
  })
  it('fullName, when present, must be a non-empty string', () => {
    for (const bad of ['', '  ', 5]) {
      const d = clone()
      d.themes[0].projects[0].fullName = bad
      expect(validateData(d).join('\n')).toContain('fullName')
    }
    const d = clone()
    d.themes[0].projects[0].fullName = 'Some Name'
    expect(validateData(d)).toEqual([])
  })
  describe('peer reviews', () => {
    const rev = (o) => ({ title: 't', url: 'https://example.com/t', status: 'published', ...o })
    it('requires status published or in-review', () => {
      for (const bad of [undefined, '', 'draft']) {
        const d = clone()
        d.peerReviews = [rev({ status: bad })]
        expect(validateData(d).join('\n')).toContain('status must be')
      }
    })
    it('a published review needs a url', () => {
      const d = clone()
      d.peerReviews = [rev({ url: undefined })]
      expect(validateData(d).join('\n')).toContain('published')
    })
    it('an in-review entry needs no url', () => {
      const d = clone()
      d.peerReviews = [rev({ url: undefined, status: 'in-review' })]
      expect(validateData(d)).toEqual([])
    })
  })
  it('rejects metric without source/asOf', () => {
    for (const miss of ['source', 'asOf']) {
      const d = clone()
      const m = { label: 'l', value: '1', source: 's', asOf: 'x' }
      delete m[miss]
      d.themes[0].projects[0].metrics = [m]
      expect(validateData(d).join('\n')).toContain(miss)
    }
  })
})
