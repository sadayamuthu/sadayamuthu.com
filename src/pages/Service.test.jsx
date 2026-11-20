import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Service from './Service'
import { data } from '../data/site'

const r = () => render(<MemoryRouter><Service /></MemoryRouter>)

it('is titled Peer review & judging and lists all reviews as compact rows without summaries', () => {
  r()
  expect(screen.getByRole('heading', { level: 1, name: 'Peer review & judging' })).toBeInTheDocument()
  expect(screen.getAllByText(/^(Published|In review)$/)).toHaveLength(data.peerReviews.length)
  const published = data.peerReviews.filter((p) => p.url)
  for (const p of published) {
    expect(screen.getByRole('link', { name: new RegExp(p.title.slice(0, 20)) })).toHaveAttribute('href', p.url)
    if (p.summary) expect(screen.queryByText(p.summary)).toBeNull()
  }
  expect(screen.queryByRole('link', { name: /Acknowledgement/ })).toBeNull()
})

it('has no Talks or Judging headings when empty', () => {
  r()
  expect(screen.queryByRole('heading', { name: /Talks/ })).toBeNull()
  expect(screen.queryByRole('heading', { name: /Judging/ })).toBeNull()
})

it('shows acknowledgement link when proofUrl set', () => {
  const p = data.peerReviews[0]
  p.proofUrl = 'https://example.com/ack'
  try {
    r()
    expect(screen.getByRole('link', { name: /Acknowledgement/ })).toHaveAttribute('href', 'https://example.com/ack')
  } finally {
    delete p.proofUrl
  }
})

it('shows the event for a talk', () => {
  const orig = data.talks
  data.talks = [{ title: 'A Talk', event: 'ConfX 2026', date: 'Nov 2026' }]
  try {
    r()
    expect(screen.getByText('ConfX 2026 · Nov 2026')).toBeInTheDocument()
  } finally {
    data.talks = orig
  }
})
