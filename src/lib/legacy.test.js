import { legacyRedirect } from './legacy'

it('maps legacy hashes', () => {
  expect(legacyRedirect('#work')).toBe('/experience')
  expect(legacyRedirect('#research')).toBe('/publications')
  expect(legacyRedirect('#nope')).toBeNull()
  expect(legacyRedirect('')).toBeNull()
})
