export const LEGACY_HASHES = {
  '#about': '/',
  '#contact': '/',
  '#work': '/experience',
  '#certifications': '/experience',
  '#projects': '/research',
  '#research': '/publications',
  '#advisory': '/service',
}

export function legacyRedirect(hash) {
  return LEGACY_HASHES[hash] ?? null
}
