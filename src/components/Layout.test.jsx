import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout'

it('wraps children with nav, sidebar and footer', () => {
  render(<MemoryRouter><Layout><p>page</p></Layout></MemoryRouter>)
  expect(screen.getByText('page')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})
