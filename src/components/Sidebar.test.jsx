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
  it('shows the profile photo in both headers, named for screen readers', () => {
    setup()
    const imgs = screen.getAllByRole('img', { name: data.person.name })
    expect(imgs).toHaveLength(2)
    for (const i of imgs) expect(i).toHaveAttribute('src', data.person.photo)
  })
  it('shows stat tiles and omits zero ones', () => {
    setup()
    expect(screen.getAllByText('Open frameworks').length).toBeGreaterThan(0)
    const papers = data.publications.filter((x) => x.type === 'paper' || x.type === 'preprint').length
    expect(screen.queryAllByText('Papers').length > 0).toBe(papers > 0)
  })
  it('shows the OpenAstra role', () => {
    setup()
    expect(screen.getByText(/Founder & Principal Author,/)).toBeInTheDocument()
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
