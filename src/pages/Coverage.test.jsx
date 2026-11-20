import { render, screen } from '@testing-library/react'
import Coverage from './Coverage'
import { data } from '../data/site'

it('lists coverage items with links', () => {
  const orig = data.coverage
  data.coverage = [{ title: 'Story', outlet: 'Outlet', date: 'May 2026', url: 'https://example.com/s' }]
  try {
    render(<Coverage />)
    expect(screen.getByRole('link', { name: /Story/ })).toHaveAttribute('href', 'https://example.com/s')
    expect(screen.getByText(/Outlet/)).toBeInTheDocument()
  } finally {
    data.coverage = orig
  }
})

it('ignores blank url/outlet/date', () => {
  const orig = data.coverage
  data.coverage = [{ title: 'Story', outlet: ' ', date: '', url: '  ' }]
  try {
    const { container } = render(<Coverage />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(container.textContent).not.toMatch(/·/)
  } finally {
    data.coverage = orig
  }
})
