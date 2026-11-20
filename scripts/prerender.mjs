// Writes a static HTML file per route from the SSR bundle in dist-server/.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { fillTemplate } from './template.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, 'dist')
const serverDir = join(root, 'dist-server')

const { render, getRoutes, canonicalUrl } = await import(
  pathToFileURL(join(serverDir, 'entry-server.js')).href
)
const template = readFileSync(join(dist, 'index.html'), 'utf8')

function page(url) {
  const { html, head } = render(url)
  return fillTemplate(template, { head, html })
}

function write(file, content) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}

const routes = getRoutes()
for (const route of routes) {
  write(join(dist, route, 'index.html'), page(route))
}
write(join(dist, '404.html'), page('/__404'))

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((r) => `  <url><loc>${canonicalUrl(r)}</loc></url>`),
  '</urlset>',
  '',
].join('\n')
writeFileSync(join(dist, 'sitemap.xml'), sitemap)

rmSync(serverDir, { recursive: true, force: true })
console.log(`prerender: prerendered ${routes.length} routes + 404.html, sitemap.xml`)
