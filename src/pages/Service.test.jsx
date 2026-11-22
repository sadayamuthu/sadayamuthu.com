import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Service from './Service'
import { data } from '../data/site'

const r = () => render(<MemoryRouter><Service /></MemoryRouter>)

it('is titled Professional Service and lists all reviews as compact rows without summaries', () => {
  r()
  expect(screen.getByRole('heading', { level: 1, name: 'Professional Service' })).toBeInTheDocument()
  const peerSection = screen.getByRole('heading', { level: 2, name: 'Peer review' }).closest('section')
  expect(within(peerSection).getAllByText(/^(Published|In review)$/)).toHaveLength(data.peerReviews.length)
  const published = data.peerReviews.filter((p) => p.url)
  for (const p of published) {
    expect(screen.getByRole('link', { name: new RegExp(p.title.slice(0, 20)) })).toHaveAttribute('href', p.url)
    if (p.summary) expect(screen.queryByText(p.summary)).toBeNull()
  }
  for (const p of data.peerReviews.filter((x) => x.proofUrl)) {
    expect(screen.getByRole('link', { name: new RegExp(`Named as reviewer, p\\. ${p.proofPage}`) })).toHaveAttribute('href', p.proofUrl)
  }
})

it('has no Talks or Judging headings when empty', () => {
  r()
  expect(screen.queryByRole('heading', { name: /Talks/ })).toBeNull()
  expect(screen.queryByRole('heading', { name: /Judging/ })).toBeNull()
})

it('shows acknowledgement link when proofUrl set', () => {
  const p = data.peerReviews.find((x) => !x.proofUrl)
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

it('lists working groups with links and roles, before peer review', () => {
  r()
  const h = screen.getByRole('heading', { level: 2, name: 'Research Working Groups' })
  const section = h.closest('section')
  for (const g of data.workingGroups) {
    expect(screen.getByRole('link', { name: new RegExp(g.name.replace(/[()]/g, '.')) })).toHaveAttribute('href', g.url)
  }
  expect(section.querySelectorAll('li')).toHaveLength(data.workingGroups.length)
  expect(within(section).getByRole('link', { name: /Cloud Security Alliance/ })).toHaveAttribute('href', 'https://cloudsecurityalliance.org/research/working-groups/')
  const org = within(section).getByRole('heading', { level: 3, name: /Cloud Security Alliance/ })
  const list = org.nextElementSibling
  expect(list.tagName).toBe('UL')
  expect(list.querySelectorAll('li')).toHaveLength(data.workingGroups.length)
  const peer = screen.getByRole('heading', { level: 2, name: 'Peer review' })
  expect(h.compareDocumentPosition(peer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

it('has no Research Working Groups heading when empty', () => {
  const orig = data.workingGroups
  data.workingGroups = []
  try {
    r()
    expect(screen.queryByRole('heading', { name: 'Research Working Groups' })).toBeNull()
  } finally {
    data.workingGroups = orig
  }
})

it('lists course reviews as in-review rows with publisher and units, after peer review', () => {
  r()
  const h = screen.getByRole('heading', { level: 2, name: 'Course review' })
  const section = h.closest('section')
  expect(within(section).getAllByText(/^(Published|In review)$/)).toHaveLength(data.courseReviews.length)
  for (const c of data.courseReviews) {
    const li = within(section).getByText(c.title).closest('div.flex')
    expect(li.textContent).toContain(`Course reviewer · ${c.units} units`)
    expect(within(li).getByText('In review')).toBeInTheDocument()
    expect(li.textContent).toContain('Cloud Security Alliance · Course reviewer')
  }
  const peer = screen.getByRole('heading', { level: 2, name: 'Peer review' })
  expect(peer.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

it('has no Course review heading when empty', () => {
  const orig = data.courseReviews
  data.courseReviews = []
  try {
    r()
    expect(screen.queryByRole('heading', { name: 'Course review' })).toBeNull()
  } finally {
    data.courseReviews = orig
  }
})
