import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'
import { data } from '../data/site'

const setup = () => render(<MemoryRouter><Sidebar /></MemoryRouter>)

describe('Sidebar', () => {
  it('links ORCID', () => {
    setup()
    const links = screen.getAllByRole('link', { name: /0009-0008-3539-6048/ })
    expect(links.length).toBeGreaterThan(0)
    for (const l of links) expect(l).toHaveAttribute('href', 'https://orcid.org/0009-0008-3539-6048')
  })
  it('omits Google Scholar when unset', () => {
    setup()
    expect(screen.queryByText(/Google Scholar/)).toBeNull()
  })
  it('has no image', () => {
    const { container } = setup()
    expect(container.querySelector('img')).toBeNull()
  })
  it('shows stat tiles and omits zero ones', () => {
    setup()
    expect(screen.getAllByText('Open frameworks').length).toBeGreaterThan(0)
    const papers = data.publications.filter((x) => x.type === 'paper' || x.type === 'preprint').length
    expect(screen.queryAllByText('Papers').length > 0).toBe(papers > 0)
  })
  it('has no CV link', () => {
    setup()
    expect(screen.queryAllByRole('link', { name: /CV/ })).toHaveLength(0)
  })
  it('renders no mailto link', () => {
    const { container } = setup()
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull()
  })
})
