import { render, screen } from '@testing-library/react'
import Experience from './Experience'
import { data } from '../data/site'

it('lists every role as employer, title and dates only', () => {
  const { container } = render(<Experience />)
  for (const r of data.experience) {
    expect(screen.getByText(r.org)).toBeInTheDocument()
  }
  expect(screen.getByText('May 2022 – present')).toBeInTheDocument()
  const rows = [...container.querySelectorAll('section div')].map((d) => d.textContent)
  expect(rows[0]).toMatch(/^Autodesk/)
  expect(rows[1]).toBe('OpenAstra · Principal AuthorJan 2025 – present')
  expect(screen.getByText('May 2016 – May 2022')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Earlier' })).toBeNull()
  expect(screen.queryByText(/Scope:|Outcomes:/)).toBeNull()
  expect(container.querySelector('article, ul.list-disc')).toBeNull()
})

function withRole(idx, patch, fn) {
  const role = data.experience[idx]
  const orig = { ...role }
  Object.assign(role, patch)
  try { fn() } finally { Object.assign(role, orig) }
}

it('empty start: no date text', () => {
  withRole(0, { start: '', end: null }, () => {
    render(<Experience />)
    const row = screen.getByText('Autodesk').closest('div')
    expect(row.textContent).toBe('Autodesk · Principal Software Engineer')
  })
})

it('start with empty end shows just start', () => {
  withRole(1, { start: '2021', end: '' }, () => {
    render(<Experience />)
    expect(screen.getByText('2021')).toBeInTheDocument()
  })
})

function withSkills(skills, certifications, fn) {
  const orig = { skills: data.skills, certifications: data.certifications }
  Object.assign(data, { skills, certifications })
  try { fn() } finally { Object.assign(data, orig) }
}

it('groups skills by area and certifications by issuer', () => {
  render(<Experience />)
  const skills = screen.getByRole('heading', { level: 2, name: 'Skills' }).closest('section')
  const certs = screen.getByRole('heading', { level: 2, name: 'Certifications' }).closest('section')
  expect(skills.querySelectorAll('dt')).toHaveLength(data.skills.length)
  expect(certs.querySelectorAll('dt')).toHaveLength(data.certifications.length)
  const first = data.certifications[0]
  expect(certs.querySelector('dt').textContent).toBe(first.group)
  expect(certs.querySelector('dd').textContent).toBe(first.items.join(' · '))
})

it('hides both sections when empty', () => {
  withSkills([], [], () => {
    render(<Experience />)
    expect(screen.queryByRole('heading', { name: 'Skills' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Certifications' })).toBeNull()
  })
})

it('drops groups with no items', () => {
  withSkills([{ group: 'Go', items: ['  '] }, { group: 'Lang', items: ['Rust'] }], [], () => {
    render(<Experience />)
    expect(screen.queryByText('Go')).toBeNull()
    expect(screen.getByText('Rust')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Certifications' })).toBeNull()
  })
})

it('lists education with school and year', () => {
  render(<Experience />)
  const e = data.education[0]
  expect(screen.getByRole('heading', { level: 2, name: 'Education' })).toBeInTheDocument()
  expect(screen.getByText(e.degree)).toBeInTheDocument()
  expect(screen.getByText(e.year)).toBeInTheDocument()
})
