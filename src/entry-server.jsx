import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { AppShell } from './App'
import { getMeta, headHtml } from './lib/meta'

export { getRoutes } from './routes'
export { canonicalUrl } from './lib/meta'

export function render(url) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppShell />
      </StaticRouter>
    </StrictMode>,
  )
  return { html, head: headHtml(getMeta(url)) }
}
