import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TopNav, { NAV_LINKS } from './TopNav'

const setup = (path = '/') =>
  render(<MemoryRouter initialEntries={[path]}><TopNav /></MemoryRouter>)

describe('TopNav', () => {
  it('has 5 page links plus CV and no Coverage with empty data', () => {
    setup()
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getAllByRole('link')).toHaveLength(5)
    expect(screen.queryByRole('link', { name: 'Coverage' })).toBeNull()
    expect(NAV_LINKS.map((l) => l.to)).toEqual(['/', '/research', '/publications', '/service', '/experience'])
    expect(within(nav).queryByRole('link', { name: /CV/ })).toBeNull()
  })
  it('keeps all links in the mobile menu while closed (works without JS)', () => {
    const { container } = setup()
    const details = container.querySelector('details')
    expect(details).not.toHaveAttribute('open')
    const mobile = screen.getByRole('navigation', { name: 'Mobile', hidden: true })
    expect(mobile.querySelectorAll('a')).toHaveLength(5)
  })
  it('opens on summary click and closes when a link is chosen', async () => {
    const { container } = setup()
    const details = container.querySelector('details')
    await userEvent.click(container.querySelector('summary'))
    expect(details).toHaveAttribute('open')
    await userEvent.click(within(details).getByText('Research', { selector: 'a' }))
    expect(details).not.toHaveAttribute('open')
  })
  it('marks the current route', () => {
    setup('/research')
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('link', { name: 'Research' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })
})
