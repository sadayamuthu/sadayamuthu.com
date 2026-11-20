import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Publications from './Publications'
import { data, allProjects } from '../data/site'

const softwareCount = allProjects().filter((p) => p.doi).length
const r = () => render(<MemoryRouter><Publications /></MemoryRouter>)

const paperCount = data.publications.filter((p) => p.type === 'paper').length

it('lists software entries, and a Papers pill only when there are papers', () => {
  r()
  expect(screen.getAllByText(/^Zenodo, \d{4}\. doi:/)).toHaveLength(softwareCount)
  expect(screen.queryAllByRole('button', { name: 'Papers' })).toHaveLength(paperCount > 0 ? 1 : 0)
  expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
})

it('Software filter keeps all entries and is pressed', () => {
  r()
  const b = screen.getByRole('button', { name: 'Software' })
  fireEvent.click(b)
  expect(b).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getAllByText(/^Zenodo, \d{4}\. doi:/)).toHaveLength(softwareCount)
})

it('filters out other types and shows papers pill when present', () => {
  const orig = data.publications
  data.publications = [{ title: 'A Paper', authors: 'X', venue: 'V', year: 2025, type: 'paper', links: {} }]
  try {
    r()
    fireEvent.click(screen.getByRole('button', { name: 'Papers' }))
    expect(screen.getByText('A Paper')).toBeInTheDocument()
    expect(screen.queryAllByText(/^Zenodo/)).toHaveLength(0)
  } finally {
    data.publications = orig
  }
})

it('software entry without doi never renders doi:undefined', () => {
  const p = data.themes[0].projects.find((x) => x.doi)
  const orig = p.doi
  p.doi = '  '
  try {
    r()
    expect(document.body.textContent).not.toMatch(/undefined/)
    expect(screen.getAllByText(/^Zenodo, \d{4}\. doi:/)).toHaveLength(softwareCount - 1)
  } finally {
    p.doi = orig
  }
})

it('shows a publication status such as "Accepted, to appear"', () => {
  const orig = data.publications
  data.publications = [{ title: 'Status Paper', authors: 'X', venue: 'V', year: 2026, type: 'paper', status: 'Accepted, to appear', visibility: 'public', links: {} }]
  try {
    r()
    expect(screen.getByText('Accepted, to appear')).toBeInTheDocument()
  } finally {
    data.publications = orig
  }
})
