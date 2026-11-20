import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../data/site', async (orig) => {
  const m = await orig()
  return { ...m, data: { ...m.data, coverage: [{ title: 'x' }] } }
})

it('adds Coverage when there is coverage', async () => {
  const { default: TopNav } = await import('./TopNav')
  render(<MemoryRouter><TopNav /></MemoryRouter>)
  expect(screen.getAllByRole('link', { name: 'Coverage' })[0]).toHaveAttribute('href', '/coverage')
})
