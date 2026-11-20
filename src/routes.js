import { allProjects, data } from './data/site'

export function getRoutes() {
  return [
    '/',
    '/research',
    ...allProjects().map((p) => `/research/${p.slug}`),
    '/publications',
    '/service',
    '/experience',
    ...(data.coverage.length > 0 ? ['/coverage'] : []),
  ]
}
