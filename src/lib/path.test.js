import { normalizeIndexPath } from './path'

it('strips a trailing index.html', () => {
  expect(normalizeIndexPath('/index.html')).toBe('/')
  expect(normalizeIndexPath('/research/opengpl/index.html')).toBe('/research/opengpl/')
})

it('leaves other paths unchanged', () => {
  expect(normalizeIndexPath('/research')).toBe('/research')
  expect(normalizeIndexPath('/')).toBe('/')
})
