// Scans the built site for content that must never ship.
// Extra patterns come from outside the repo: FORBIDDEN_TERMS_FILE (a path)
// or FORBIDDEN_TERMS (newline-separated), one regex source per line.
import { readFileSync, readdirSync, realpathSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateData } from '../src/data/validate.js'

export const BUILTIN_PATTERNS = [/"visibility"\s*:\s*"hidden"/i]
const SCANNED = /\.(html|js|json|xml|txt)$/

export function findViolations(files, patterns) {
  const out = []
  for (const { path, content } of files) {
    for (const re of patterns) {
      const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
      for (const m of content.matchAll(g)) out.push(`${path}: ${m[0]}`)
    }
  }
  return out
}

export function parsePatterns(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => new RegExp(l, 'i'))
}

export function loadExtraPatterns(env) {
  if (env.FORBIDDEN_TERMS_FILE) return parsePatterns(readFileSync(env.FORBIDDEN_TERMS_FILE, 'utf8'))
  if (env.FORBIDDEN_TERMS) return parsePatterns(env.FORBIDDEN_TERMS)
  return null
}

export function missingTermsIsFatal(env) {
  const ci = env.CI && !/^(false|0)$/i.test(env.CI)
  const configured = Boolean(env.FORBIDDEN_TERMS_FILE) || Boolean(env.FORBIDDEN_TERMS && env.FORBIDDEN_TERMS.trim())
  return Boolean(ci) && !configured
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  )
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const dist = join(root, 'dist')
  const files = walk(dist)
    .filter((f) => SCANNED.test(f))
    .map((f) => ({ path: relative(root, f), content: readFileSync(f, 'utf8') }))

  let extra = loadExtraPatterns(process.env)
  if (!extra || (extra.length === 0 && missingTermsIsFatal(process.env))) {
    if (missingTermsIsFatal(process.env)) {
      console.error('check-dist: error: no extra terms configured in CI (set FORBIDDEN_TERMS or FORBIDDEN_TERMS_FILE)')
      process.exit(1)
    }
    console.log('check-dist: warning: no extra terms configured')
    extra = []
  }
  const data = JSON.parse(readFileSync(join(root, 'src/data/research.json'), 'utf8'))
  const problems = [
    ...findViolations(files, [...BUILTIN_PATTERNS, ...extra]),
    ...validateData(data).map((e) => `research.json: ${e}`),
  ]
  if (problems.length > 0) {
    for (const p of problems) console.error(p)
    console.error(`check-dist: ${problems.length} problem(s)`)
    process.exit(1)
  }
  console.log(`check-dist: clean (${files.length} files)`)
}

const isEntry = (() => {
  try {
    return Boolean(process.argv[1]) && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])
  } catch {
    return false
  }
})()
if (isEntry) main()
