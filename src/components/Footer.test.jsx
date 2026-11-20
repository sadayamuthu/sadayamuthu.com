import { render } from '@testing-library/react'
import Footer from './Footer'

it('shows lab and update date', () => {
  const { container } = render(<Footer />)
  expect(container.textContent).toContain('Research lab: OpenAstra')
  expect(container.textContent).toMatch(/Last updated \d{4}-\d{2}-\d{2}/)
})
