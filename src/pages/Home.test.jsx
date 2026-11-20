import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import { data, allProjects } from '../data/site'

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experience" element={<p>experience page</p>} />
      </Routes>
    </MemoryRouter>,
  )

it('lists the featured projects in order', () => {
  renderAt('/')
  const names = screen.getAllByRole('link', { name: /^(OpenGPL|AnySQL|ControlGate|ExposureGate)/i })
  expect(names.slice(0, 4).map((a) => a.textContent.toLowerCase())).toEqual([
    expect.stringContaining('opengpl'),
    expect.stringContaining('anysql'),
    expect.stringContaining('controlgate'),
    expect.stringContaining('exposuregate'),
  ])
})

it('shows the DOI for ExposureGate', () => {
  renderAt('/')
  const row = screen.getByRole('link', { name: /exposuregate/i }).closest('div.flex')
  expect(within(row).getByRole('link', { name: /10\.5281\/zenodo\.24241823/ })).toBeInTheDocument()
  expect(row.textContent).not.toMatch(/undefined|null/)
})

it('lists every released project under "Research", featured four first, no in-development names', () => {
  renderAt('/')
  const section = screen.getByRole('heading', { level: 2, name: 'Research' }).closest('section')
  const links = within(section).getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/research/'))
  expect(links).toHaveLength(allProjects().length)
  expect(links.slice(0, 4).map((a) => a.getAttribute('href').split('/').pop())).toEqual(['opengpl', 'anysql', 'controlgate', 'exposuregate'])
  expect(within(section).getByRole('link', { name: 'Browse by line of work →' })).toHaveAttribute('href', '/research')
  for (const t of data.themes) for (const p of t.projects) {
    if (p.status === 'in-development') expect(screen.queryByText(p.name)).toBeNull()
  }
  expect(screen.queryByText('In development')).toBeNull()
})

it('expands OCBC on Home and leaves other names without abbr', () => {
  renderAt('/')
  const row = screen.getByRole('link', { name: 'OCBC' }).closest('div.flex')
  expect(within(row).getByText('Open Controls Baseline Catalog')).toBeInTheDocument()
  expect(row.querySelector('abbr')).toHaveAttribute('title', 'Open Controls Baseline Catalog')
  const other = screen.getByRole('link', { name: 'OpenGPL' }).closest('div.flex')
  expect(other.querySelector('abbr')).toBeNull()
})

it('shows all peer reviews in compact rows under "Peer review & judging"', () => {
  renderAt('/')
  const section = screen.getByRole('heading', { level: 2, name: 'Peer review & judging' }).closest('section')
  expect(within(section).getAllByText(/^(Published|In review)$/)).toHaveLength(data.peerReviews.length)
  expect(within(section).getAllByText('In review')).toHaveLength(data.peerReviews.filter((r) => r.status === 'in-review').length)
  expect(within(section).getByText('The Six Pillars of MCP Security')).toBeInTheDocument()
})

it('has an h1 and the emphasised statement', () => {
  renderAt('/')
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Karthikeyan Sadayamuthu')
  expect(screen.getByText('check their work before it ships').tagName).toBe('EM')
})

it('omits Publications while empty', () => {
  const orig = data.publications
  data.publications = []
  try {
    renderAt('/')
    expect(screen.queryByRole('heading', { name: 'Publications' })).toBeNull()
  } finally {
    data.publications = orig
  }
})

it('redirects legacy hashes', () => {
  renderAt('/#work')
  expect(screen.getByText('experience page')).toBeInTheDocument()
})

it('renders recent entries from text, linking when url is present', () => {
  const orig = data.recent
  data.recent = [
    { date: 'Nov 2026', text: 'Linked item', url: 'https://example.com/a' },
    { date: 'Oct 2026', text: 'Plain item' },
  ]
  try {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Linked item' })).toHaveAttribute('href', 'https://example.com/a')
    expect(screen.getByText('Plain item')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Plain item' })).toBeNull()
  } finally {
    data.recent = orig
  }
})

it('shows the Publications heading once when a paper exists', () => {
  const orig = data.publications
  data.publications = [{ title: 'A Paper', authors: 'X', venue: 'V', year: 2025, type: 'paper', links: {} }]
  try {
    renderAt('/')
    expect(screen.getAllByText('Publications')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { name: 'Publications' })).toHaveLength(1)
  } finally {
    data.publications = orig
  }
})
