import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProjectPage from './ProjectPage'
import NotFound from './NotFound'
import { data } from '../data/site'

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/research/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>,
  )

it('renders OpenGPL with its DOI link', () => {
  renderAt('/research/opengpl')
  expect(screen.getByRole('heading', { level: 1, name: 'OpenGPL' })).toBeInTheDocument()
  const links = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === 'https://doi.org/10.5281/zenodo.23844061')
  expect(links.length).toBeGreaterThan(0)
  expect(screen.getByRole('link', { name: 'Research' }).parentElement).toHaveTextContent('Research / Governing AI agents')
})

it('shows section names once, as headings', () => {
  const p = data.themes.flatMap((t) => t.projects).find((x) => x.slug === 'opengpl')
  const orig = { problem: p.problem, novelty: p.novelty, role: p.role }
  Object.assign(p, { problem: 'P.', novelty: 'N.', role: 'R.' })
  try {
    renderAt('/research/opengpl')
    check()
  } finally { Object.assign(p, orig) }
  function check() {
  for (const n of ['The problem', "What's new", 'My role', 'Cite this', 'Related']) {
    expect(screen.getAllByText(n)).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: n })).toBeInTheDocument()
  }
  }
})

it('hides a section whose text is empty or whitespace', () => {
  const p = data.themes.flatMap((t) => t.projects).find((x) => x.slug === 'opengpl')
  const orig = p.problem
  try {
    for (const v of ['', '   ']) {
      p.problem = v
      const { unmount } = renderAt('/research/opengpl')
      expect(screen.queryByRole('heading', { name: 'The problem' })).toBeNull()
      unmount()
    }
  } finally { p.problem = orig }
})

it('works with a trailing slash', () => {
  renderAt('/research/opengpl/')
  expect(screen.getByRole('heading', { level: 1, name: 'OpenGPL' })).toBeInTheDocument()
})

it('ExposureGate has its DOI, Cite this and PyPI', () => {
  renderAt('/research/exposuregate')
  expect(screen.getByRole('heading', { name: 'Cite this' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /PyPI/ })).toBeInTheDocument()
  expect(screen.getAllByRole('link').some((a) => a.getAttribute('href') === 'https://doi.org/10.5281/zenodo.24241823')).toBe(true)
})

it('OpenAPL (released, no DOI, private repo) has no DOI, Cite this or GitHub link', () => {
  renderAt('/research/openapl')
  expect(screen.getByRole('heading', { level: 1, name: 'OpenAPL' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Cite this' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'DOI' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'GitHub' })).toBeNull()
  expect(document.body.textContent).not.toMatch(/doi\.org\/(undefined|null)|undefined/)
})

it('in-development projects have no page', () => {
  for (const slug of ['intentlock', 'cyberlake', 'agentid']) {
    const { unmount } = renderAt(`/research/${slug}`)
    expect(screen.getByText('Page not found')).toBeInTheDocument()
    unmount()
  }
})

it('unknown slug is not found', () => {
  renderAt('/research/nope')
  expect(screen.getByText('Page not found')).toBeInTheDocument()
})

it('lists related projects in the same theme', () => {
  renderAt('/research/opengpl')
  expect(screen.getByRole('link', { name: 'mergelock' })).toHaveAttribute('href', '/research/mergelock')
  expect(screen.queryByRole('link', { name: 'ocbc' })).toBeNull()
})

describe('metrics', () => {
  const proj = () => data.themes.flatMap((t) => t.projects).find((p) => p.slug === 'opengpl')
  it('hides Impact when empty', () => {
    const orig = proj().metrics
    proj().metrics = []
    try {
      renderAt('/research/opengpl')
      expect(screen.queryByRole('heading', { name: 'Impact' })).toBeNull()
    } finally { proj().metrics = orig }
  })
  it('shows value, source and as-of, linking URL sources by host', () => {
    const p = proj()
    const orig = p.metrics
    p.metrics = [{ label: 'GitHub stars', value: '12', source: 'https://github.com/sadayamuthu/opengpl', asOf: '2026-11-01' }]
    try {
      renderAt('/research/opengpl')
      expect(screen.getByRole('heading', { name: 'Impact' })).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /github\.com/ })).toHaveAttribute('href', 'https://github.com/sadayamuthu/opengpl')
      expect(screen.getByText(/as of 2026-11-01/)).toBeInTheDocument()
    } finally { p.metrics = orig }
  })
})

it('OCBC page shows its full name under an abbr h1', () => {
  renderAt('/research/ocbc')
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1.querySelector('abbr')).toHaveAttribute('title', 'Open Controls Baseline Catalog')
  expect(screen.getByText('Open Controls Baseline Catalog')).toBeInTheDocument()
})

it('a project without fullName has no abbr in the heading', () => {
  renderAt('/research/opengpl')
  expect(screen.getByRole('heading', { level: 1 }).querySelector('abbr')).toBeNull()
})
