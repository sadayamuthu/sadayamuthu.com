import { render, screen } from '@testing-library/react'
import ReviewRow from './ReviewRow'

const base = { title: 'A Review', publisher: 'Cloud Security Alliance', group: 'AI Safety', role: 'Peer reviewer', date: 'Oct 2026' }

it('links the title with an arrow only when a url is present', () => {
  const { unmount } = render(<ReviewRow review={{ ...base, status: 'published', url: 'https://example.com/a' }} />)
  expect(screen.getByRole('link', { name: /A Review/ })).toHaveAttribute('href', 'https://example.com/a')
  unmount()
  render(<ReviewRow review={{ ...base, status: 'in-review' }} />)
  expect(screen.getByText('A Review')).toBeInTheDocument()
  expect(screen.queryByRole('link')).toBeNull()
})

it('shows the status tag', () => {
  const { unmount } = render(<ReviewRow review={{ ...base, status: 'published', url: 'https://example.com/a' }} />)
  expect(screen.getByText('Published')).toBeInTheDocument()
  unmount()
  render(<ReviewRow review={{ ...base, status: 'in-review' }} />)
  expect(screen.getByText('In review')).toHaveAttribute('title', 'Document not yet published')
})

it('spells out the publisher and joins only the present parts', () => {
  const { container, unmount } = render(<ReviewRow review={{ ...base, status: 'in-review' }} />)
  expect(container.querySelector('abbr')).toBeNull()
  expect(container.textContent).toContain('Cloud Security Alliance · AI Safety WG · Peer reviewer · Oct 2026')
  expect(container.textContent).not.toMatch(/\bCSA\b/)
  unmount()
  const r = render(<ReviewRow review={{ title: 'T', publisher: 'Cloud Security Alliance', role: 'Peer reviewer', status: 'in-review' }} />)
  expect(r.container.textContent).toContain('Cloud Security Alliance · Peer reviewer')
  expect(r.container.textContent).not.toMatch(/WG|undefined| · $/)
})

it('shows an Acknowledgement link only when proofUrl is set', () => {
  const { unmount } = render(<ReviewRow review={{ ...base, status: 'in-review' }} />)
  expect(screen.queryByRole('link', { name: /Acknowledgement/ })).toBeNull()
  unmount()
  render(<ReviewRow review={{ ...base, status: 'in-review', proofUrl: 'https://example.com/ack' }} />)
  expect(screen.getByRole('link', { name: /Acknowledgement/ })).toHaveAttribute('href', 'https://example.com/ack')
})
