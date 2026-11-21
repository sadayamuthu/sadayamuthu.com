// Advisory checklist of content still to fill in. Always exits 0.
import { readFileSync, realpathSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const blank = (v) => typeof v !== 'string' || v.trim() === ''

export function missingContent(data) {
  const out = []
  const person = data.person ?? {}
  if (!Array.isArray(person.bio) || person.bio.every(blank)) out.push('person.bio is empty')
  if (blank(person.ids?.scholar)) out.push('person.ids.scholar missing')

  for (const theme of data.themes ?? []) {
    for (const p of theme.projects ?? []) {
      if (p.status === 'in-development') continue
      if (blank(p.doi)) out.push(`${p.slug}: no DOI`)
      for (const f of ['problem', 'novelty', 'role']) {
        if (blank(p[f])) out.push(`${p.slug}: ${f} missing`)
      }
    }
  }

  for (const e of data.experience ?? []) {
    if (blank(e.start)) out.push(`experience ${e.org}: start date missing`)
    if (e.featured) {
      if (blank(e.scope)) out.push(`experience ${e.org}: scope missing`)
      if (!Array.isArray(e.outcomes) || e.outcomes.every(blank)) {
        out.push(`experience ${e.org}: outcomes missing`)
      }
    }
  }

  ;(data.peerReviews ?? []).forEach((r, i) => {
    if (r.status === 'in-review') return
    if (blank(r.date)) out.push(`peerReviews[${i}]: date missing`)
  })
  return out
}

function main() {
  const root = join(fileURLToPath(import.meta.url), '..', '..')
  const data = JSON.parse(readFileSync(join(root, 'src/data/research.json'), 'utf8'))
  const items = missingContent(data)
  console.log(`content-check: ${items.length} item(s) to fill`)
  for (const i of items) console.log(`- ${i}`)
}

if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) main()
