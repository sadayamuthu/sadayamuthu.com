import { useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { data } from '../data/site'

// eslint-disable-next-line react-refresh/only-export-components
export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Research', to: '/research' },
  { label: 'Publications', to: '/publications' },
  { label: 'Service', to: '/service' },
  { label: 'Experience', to: '/experience' },
  ...(data.coverage.length > 0 ? [{ label: 'Coverage', to: '/coverage' }] : []),
]

const linkCls = ({ isActive }) =>
  `text-sm py-1 border-b ${isActive ? 'border-acc text-acc' : 'border-transparent text-ink hover:text-acc'}`

function Links({ onNavigate }) {
  return (
    <>
      {NAV_LINKS.map((l) => (
        <li key={l.to}>
          <NavLink to={l.to} end={l.to === '/'} className={linkCls} onClick={onNavigate}>
            {l.label}
          </NavLink>
        </li>
      ))}
    </>
  )
}

export default function TopNav() {
  const detailsRef = useRef(null)
  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false
  }
  return (
    <header className="border-b border-rule bg-card">
      <div className="max-w-page mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-serif text-base">
          <span className="lg:hidden">K. Sadayamuthu</span>
          <span className="hidden lg:inline">{data.person.name}</span>
        </Link>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex gap-6">
            <Links />
          </ul>
        </nav>
        <nav aria-label="Mobile" className="lg:hidden relative">
          <details ref={detailsRef}>
            <summary aria-label="Menu" className="cursor-pointer list-none px-2 py-1 text-xl leading-none">
              ☰
            </summary>
            <ul className="absolute right-0 mt-2 z-10 flex flex-col gap-2 bg-card border border-rule rounded-sm p-4">
              <Links onNavigate={close} />
            </ul>
          </details>
        </nav>
      </div>
    </header>
  )
}
