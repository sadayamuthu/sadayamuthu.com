import { data } from '../data/site'

export default function Footer() {
  const { lab, name } = data.person
  return (
    <footer className="border-t border-rule mt-8">
      <div className="max-w-page mx-auto px-4 lg:px-6 py-6 text-xs text-ink-muted flex flex-wrap justify-between gap-2">
        <p>
          © {__BUILD_YEAR__} {name} · Research lab:{' '}
          <a href={lab.url} target="_blank" rel="noreferrer" className="text-acc hover:underline">
            {lab.name} <span aria-hidden="true">↗</span>
          </a>
        </p>
        <p>Last updated {__BUILD_DATE__}</p>
      </div>
    </footer>
  )
}
