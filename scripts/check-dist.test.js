// @vitest-environment node
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BUILTIN_PATTERNS, findViolations, loadExtraPatterns, missingTermsIsFatal, parsePatterns } from './check-dist.mjs'

const fixture = [/forbiddenword/i]

it('flags a fixture term', () => {
  const v = findViolations([{ path: 'a.js', content: 'x ForbiddenWord y' }], fixture)
  expect(v).toEqual(['a.js: ForbiddenWord'])
})

it('built-in rule flags hidden visibility', () => {
  expect(findViolations([{ path: 'b.json', content: '{"visibility":"hidden"}' }], BUILTIN_PATTERNS)).toHaveLength(1)
  expect(findViolations([{ path: 'b.json', content: '{"visibility" : "Hidden"}' }], BUILTIN_PATTERNS)).toHaveLength(1)
})

it('clean content returns []', () => {
  expect(findViolations([{ path: 'c.html', content: '<p>hello "visibility":"public"</p>' }], [...BUILTIN_PATTERNS, ...fixture])).toEqual([])
})

it('parsePatterns ignores blanks and comments and is case-insensitive', () => {
  const p = parsePatterns('# comment\n\nalpha-?word\n  beta  \n')
  expect(p).toHaveLength(2)
  expect(p[0].test('ALPHAWORD')).toBe(true)
  expect(p[1].test('Beta')).toBe(true)
})

it('loads extra patterns from FORBIDDEN_TERMS_FILE', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cd-'))
  const f = join(dir, 'terms.txt')
  writeFileSync(f, '# x\nforbiddenword\n')
  const p = loadExtraPatterns({ FORBIDDEN_TERMS_FILE: f, FORBIDDEN_TERMS: 'other' })
  expect(p).toHaveLength(1)
  expect(p[0].test('FORBIDDENWORD')).toBe(true)
})

it('loads extra patterns from FORBIDDEN_TERMS when no file is set', () => {
  const p = loadExtraPatterns({ FORBIDDEN_TERMS: 'one\ntwo' })
  expect(p.map((r) => r.source)).toEqual(['one', 'two'])
})

it('returns null when nothing is configured', () => {
  expect(loadExtraPatterns({})).toBeNull()
})

it('missing terms is fatal only in CI without configured terms', () => {
  expect(missingTermsIsFatal({ CI: 'true' })).toBe(true)
  expect(missingTermsIsFatal({ CI: 'true', FORBIDDEN_TERMS: '  ' })).toBe(true)
  expect(missingTermsIsFatal({ CI: 'true', FORBIDDEN_TERMS: 'x' })).toBe(false)
  expect(missingTermsIsFatal({ CI: 'true', FORBIDDEN_TERMS_FILE: '/f' })).toBe(false)
  expect(missingTermsIsFatal({})).toBe(false)
  expect(missingTermsIsFatal({ CI: 'false' })).toBe(false)
})
