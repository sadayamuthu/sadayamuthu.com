// @vitest-environment node
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
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

it('publishes no CV PDF and removes dist-server', () => {
  expect(readdirSync(dist('.')).filter((f) => f.toLowerCase().endsWith('.pdf'))).toEqual([])
  expect(existsSync(resolve(root, 'dist-server'))).toBe(false)
})
