const has = (s) => typeof s === 'string' && s.trim() !== ''

const STATUS_LABEL = { published: 'Published', 'in-review': 'In review' }

export default function ReviewRow({ review: r }) {
  const parts = [
    has(r.publisher) && r.publisher,
    has(r.group) && `${r.group} WG`,
    has(r.role) && r.role,
    has(r.date) && r.date,
  ].filter(Boolean)
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2 border-b border-rule/60 last:border-b-0">
      <div className="min-w-0">
        <p>
          {has(r.url) ? (
            <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-acc">
              {r.title} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            r.title
          )}
        </p>
        <p className="text-xs text-ink-muted">
          {parts.map((x, i) => (
            <span key={i}>{i > 0 && ' · '}{x}</span>
          ))}
          {has(r.proofUrl) && (
            <>
              {parts.length > 0 && ' · '}
              <a href={r.proofUrl} target="_blank" rel="noreferrer" className="text-acc hover:underline">
                Acknowledgement <span aria-hidden="true">↗</span>
              </a>
            </>
          )}
        </p>
      </div>
      <span
        className="font-mono text-[11px] text-ink-muted"
        title={r.status === 'in-review' ? 'Document not yet published' : undefined}
      >
        {STATUS_LABEL[r.status]}
      </span>
    </div>
  )
}
