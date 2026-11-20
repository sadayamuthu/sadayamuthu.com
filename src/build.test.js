// @vitest-environment node
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = (p) => resolve(root, 'dist', p)

let output = ''
beforeAll(() => {
  // Extra leak-check terms come only from FORBIDDEN_TERMS_FILE / FORBIDDEN_TERMS in the environment.
  output = execSync('npm run build', { cwd: root, env: { ...process.env, NODE_ENV: 'production', CI: '' }, encoding: 'utf8', stdio: 'pipe' })
}, 120_000)

it('prints a route count and a clean check', () => {
  expect(output).toMatch(/prerendered \d+ routes/)
  expect(output).toContain('check-dist: clean')
})

it('project page has content in raw HTML', () => {
  const html = readFileSync(dist('research/opengpl/index.html'), 'utf8')
  expect(html).toContain('<h1')
  expect(html).toContain('OpenGPL')
  expect(html).toContain('10.5281/zenodo.23844061')
  expect(html).toContain('<link rel="canonical" href="https://sadayamuthu.com/research/opengpl/">')
})

it('builds pages for released projects only', () => {
  expect(existsSync(dist('research/openapl/index.html'))).toBe(true)
  expect(existsSync(dist('research/intentlock/index.html'))).toBe(false)
  expect(existsSync(dist('research/cyberlake/index.html'))).toBe(false)
  expect(readFileSync(dist('sitemap.xml'), 'utf8')).not.toContain('/research/intentlock')
})

it('404 page is rendered and not indexed', () => {
  const html = readFileSync(dist('404.html'), 'utf8')
  expect(html).toContain('Page not found')
  expect(html).toContain('<meta name="robots" content="noindex">')
})

it('sitemap lists canonical URLs', () => {
  expect(readFileSync(dist('sitemap.xml'), 'utf8')).toContain('https://sadayamuthu.com/research/exposuregate/')
})

it('CV is copied and dist-server is removed', () => {
  expect(existsSync(dist('Karthikeyan_Sadayamuthu.pdf'))).toBe(true)
  // Probe after the build: case-insensitive file systems (macOS default) resolve the other case too.
  const caseSensitive = !existsSync(dist('KARTHIKEYAN_SADAYAMUTHU.PDF'))
  if (caseSensitive) expect(existsSync(dist('karthikeyan_sadayamuthu.pdf'))).toBe(false)
  expect(existsSync(resolve(root, 'dist-server'))).toBe(false)
})
