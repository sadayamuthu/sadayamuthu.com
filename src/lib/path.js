export function normalizeIndexPath(pathname) {
  return pathname.endsWith('/index.html') ? pathname.slice(0, -'index.html'.length) : pathname
}
