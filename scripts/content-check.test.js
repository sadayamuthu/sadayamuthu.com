// @vitest-environment node
import { readFileSync } from 'node:fs'
import { missingContent } from './content-check.mjs'

const data = JSON.parse(readFileSync(new URL('../src/data/research.json', import.meta.url), 'utf8'))

it('lists known gaps', () => {
  const out = missingContent(data)
  expect(out).toContain('openapl: no DOI')
  expect(out.some((l) => l.startsWith('intentlock:'))).toBe(false)
  expect(out).toContain('person.bio is empty')
})

it('does not flag in-review peer reviews for missing proof or date', () => {
  const out = missingContent({ person: { bio: ['x'], ids: { scholar: 'x' } }, peerReviews: [{ title: 't', status: 'in-review' }] })
  expect(out).toEqual([])
})

it('drops the bio line once bio is filled', () => {
  const copy = { ...data, person: { ...data.person, bio: ['x'] } }
  expect(missingContent(copy)).not.toContain('person.bio is empty')
})

it('treats whitespace as missing and flags featured-role gaps', () => {
  const d = {
    person: { bio: ['  '], ids: { scholar: ' ' } },
    themes: [{ projects: [{ slug: 'p', doi: null, problem: ' ', novelty: 'ok', role: '' }] }],
    experience: [
      { org: 'A', start: '', featured: true, scope: '', outcomes: [] },
      { org: 'B', start: '2020', featured: false },
    ],
    peerReviews: [{ title: 't', proofUrl: '', date: '' }],
  }
  expect(missingContent(d)).toEqual([
    'person.bio is empty',
    'person.ids.scholar missing',
    'p: no DOI',
    'p: problem missing',
    'p: role missing',
    'experience A: start date missing',
    'experience A: scope missing',
    'experience A: outcomes missing',
    'peerReviews[0]: proofUrl missing',
    'peerReviews[0]: date missing',
  ])
})
