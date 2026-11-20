import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Research from './Research'
import { data, allProjects } from '../data/site'

const setup = () => render(<MemoryRouter><Research /></MemoryRouter>)
const devProjects = () => data.themes.flatMap((t) => t.projects).filter((p) => p.status === 'in-development')
const themesWithReleased = () => data.themes.filter((t) => t.projects.some((p) => p.status === 'released')).length

it('has the h1 and a lede counting released projects only', () => {
  setup()
  expect(screen.getByRole('heading', { level: 1, name: 'Research' })).toBeInTheDocument()
  expect(screen.getByText(`${allProjects().length} open frameworks in ${themesWithReleased()} lines of work. Releases are archived on Zenodo with versioned DOIs.`)).toBeInTheDocument()
  expect(document.body.textContent).not.toMatch(/in development/i)
})

it('shows one heading per theme with released projects and a card per released project', () => {
  setup()
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(themesWithReleased())
  expect(document.querySelectorAll('a[href^="/research/"]')).toHaveLength(allProjects().length)
})

it('never shows in-development projects or their themes', () => {
  setup()
  expect(devProjects().length).toBeGreaterThan(0)
  for (const p of devProjects()) expect(screen.queryByText(p.name)).toBeNull()
  expect(screen.queryByRole('heading', { name: 'Agent runtime security' })).toBeNull()
})

it('renders OpenAPL (released, no DOI, no repo link) without an external link', () => {
  setup()
  const card = screen.getByRole('link', { name: 'OpenAPL' }).closest('div')
  expect(within(card).getAllByRole('link')).toHaveLength(1)
  expect(card.textContent).not.toMatch(/undefined|null/)
})

it('files ExposureGate under Compliance as code', () => {
  setup()
  const section = screen.getByRole('heading', { name: 'Compliance as code' }).closest('section')
  expect(within(section).getByText('ExposureGate')).toBeInTheDocument()
})

it('expands OCBC and OEBC on their cards; other cards have no abbr', () => {
  setup()
  const card = screen.getByRole('link', { name: 'OCBC' }).closest('div')
  expect(within(card).getByText('Open Controls Baseline Catalog')).toBeInTheDocument()
  expect(card.querySelector('abbr')).toHaveAttribute('title', 'Open Controls Baseline Catalog')
  expect(screen.getByText('Open Exposure Baseline Catalog')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'OpenGPL' }).closest('div').querySelector('abbr')).toBeNull()
})
