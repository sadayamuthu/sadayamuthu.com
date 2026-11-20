import { useEffect, useRef, useState } from 'react'
import { bibtex, citationText, doiUrl } from '../data/site'

async function copy(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through: insecure context or permission denied
  }
  return false
}

function CopyButton({ label, text, onFail, onCopied, children }) {
  const [state, setState] = useState('idle')
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = async () => {
    const ok = await copy(text)
    if (!ok) {
      setState('idle')
      onFail(text)
      return
    }
    setState('copied')
    onCopied()
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2000)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="px-3 py-1 rounded-sm border border-ink/30 text-xs hover:border-ink transition-colors"
    >
      {state === 'copied' ? 'Copied' : children}
    </button>
  )
}

function Fallback({ label, text }) {
  const ref = useRef()
  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [text])
  return (
    <label className="flex flex-col gap-1 text-xs text-ink-muted">
      <span>{label} · press ⌘C / Ctrl+C to copy</span>
      <textarea
        ref={ref}
        readOnly
        aria-label={label}
        value={text}
        rows={label === 'BibTeX' ? 9 : 3}
        className="w-full font-mono text-xs text-ink bg-paper border border-rule rounded-sm p-2"
      />
    </label>
  )
}

export default function Citation({ project }) {
  const [fallback, setFallback] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  if (!project?.doi) return null
  const url = doiUrl(project.doi)
  return (
    <div className="flex flex-col gap-2">
      <p className="font-serif text-[15px] leading-snug select-all">{citationText(project)}</p>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-acc underline underline-offset-2 break-all hover:text-ink"
        >
          {url}
        </a>
        <div className="flex flex-wrap gap-2">
          <CopyButton
            label={`Copy citation for ${project.name}`}
            text={citationText(project)}
            onFail={(text) => setFallback({ label: 'Citation', text })}
            onCopied={() => setAnnouncement('Citation copied')}
          >
            Copy
          </CopyButton>
          <CopyButton
            label={`Copy BibTeX for ${project.name}`}
            text={bibtex(project)}
            onFail={(text) => setFallback({ label: 'BibTeX', text })}
            onCopied={() => setAnnouncement('BibTeX copied')}
          >
            BibTeX
          </CopyButton>
        </div>
      </div>
      {fallback && <Fallback label={fallback.label} text={fallback.text} />}
      <span role="status" aria-live="polite" className="sr-only">{announcement}</span>
    </div>
  )
}
