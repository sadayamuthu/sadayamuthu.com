import { render, screen, within } from '@testing-library/react'
import Experience from './Experience'
import { data } from '../data/site'

it('shows featured roles and BNY Mellon under Earlier', () => {
  render(<Experience />)
  expect(screen.getByText('Autodesk')).toBeInTheDocument()
  expect(screen.getByText('Comcast Cable Communications')).toBeInTheDocument()
  const earlier = screen.getByRole('heading', { name: 'Earlier' }).closest('section')
  expect(within(earlier).getByText(/BNY Mellon/)).toBeInTheDocument()
  const withScope = data.experience.filter((r) => r.featured && r.scope?.trim()).length
  const withOutcomes = data.experience.filter((r) => r.featured && r.outcomes?.length).length
  expect(screen.queryAllByText('Scope:')).toHaveLength(withScope)
  expect(screen.queryAllByText('Outcomes:')).toHaveLength(withOutcomes)
})

it('renders only Scope and Outcomes labels; ownership unlabeled', () => {
  const role = data.experience[0]
  const orig = { ...role }
  Object.assign(role, {
    start: '2022',
    end: null,
    scope: 'Platform security.',
    outcomes: ['Did a thing.'],
    ownership: 'Owns the platform.',
  })
  try {
    const { container } = render(<Experience />)
    const own = screen.getByText('Owns the platform.')
    const article = own.closest('article')
    expect(within(article).getByText('Scope:')).toBeInTheDocument()
    expect(within(article).getByText('Outcomes:')).toBeInTheDocument()
    expect(within(article).getByText('2022 – present')).toBeInTheDocument()
    expect(own.tagName).toBe('P')
    expect(own.previousElementSibling?.textContent ?? '').not.toMatch(/:$/)
    expect(own.children).toHaveLength(0)
    const block = own.closest('article')
    const labels = [...block.querySelectorAll('*')]
      .filter((e) => e.children.length === 0 && /:\s*$/.test(e.textContent))
      .map((e) => e.textContent.trim())
    expect(labels.sort()).toEqual(['Outcomes:', 'Scope:'])
    expect(container).toBeTruthy()
  } finally {
    Object.assign(role, orig)
  }
})

function withRole(idx, patch, fn) {
  const role = data.experience[idx]
  const orig = { ...role }
  Object.assign(role, patch)
  try { fn() } finally { Object.assign(role, orig) }
}

it('empty start: no date text and no date column', () => {
  withRole(0, { start: '', end: null }, () => {
    const { container } = render(<Experience />)
    const art = container.querySelectorAll('article')[0]
    expect(art.textContent).not.toMatch(/present/)
    expect(art.className).not.toMatch(/grid-cols/)
    expect(art.children).toHaveLength(1)
  })
})

it('start with empty end shows just start', () => {
  withRole(1, { start: '2021', end: '' }, () => {
    render(<Experience />)
    expect(screen.getByText('2021')).toBeInTheDocument()
  })
})

it('null end shows present', () => {
  withRole(0, { start: '2020', end: null }, () => {
    render(<Experience />)
    expect(screen.getByText('2020 – present')).toBeInTheDocument()
  })
})

function withSkills(skills, certifications, fn) {
  const orig = { skills: data.skills, certifications: data.certifications }
  Object.assign(data, { skills, certifications })
  try { fn() } finally { Object.assign(data, orig) }
}

it('hides skills section when both empty', () => {
  withSkills([], [], () => {
    render(<Experience />)
    expect(screen.queryByRole('heading', { name: 'Skills & certifications' })).toBeNull()
  })
})

it('only certifications: certs line, no skills line', () => {
  withSkills([], ['Cert A', 'Cert B'], () => {
    render(<Experience />)
    expect(screen.getByText('Cert A · Cert B')).toBeInTheDocument()
    expect(screen.getAllByText(/ · /).filter((e) => e.closest('section')?.querySelector('h2')?.textContent === 'Skills & certifications')).toHaveLength(1)
  })
})

it('only skills: skills line only', () => {
  withSkills(['Go', 'Rust'], [], () => {
    render(<Experience />)
    expect(screen.getByText('Go · Rust')).toBeInTheDocument()
    expect(screen.queryByText(/Cert/)).toBeNull()
  })
})
