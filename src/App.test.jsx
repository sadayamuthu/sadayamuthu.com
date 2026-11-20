import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './App'

const at = (p) => render(<MemoryRouter initialEntries={[p]}><AppRoutes /></MemoryRouter>)

it('/coverage is Page not found when coverage is empty', () => {
  at('/coverage')
  expect(screen.getByText(/Page not found/)).toBeInTheDocument()
})

it.each(['/publications', '/service', '/experience'])('%s renders a page', (p) => {
  at(p)
  expect(screen.queryByText(/Page not found/)).toBeNull()
})
