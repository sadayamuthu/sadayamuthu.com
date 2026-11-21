import { render, screen } from '@testing-library/react'
import Experience from './Experience'
import { data } from '../data/site'

it('lists every role as employer, title and dates only', () => {
  const { container } = render(<Experience />)
  for (const r of data.experience) {
    expect(screen.getByText(r.org)).toBeInTheDocument()
  }
  expect(screen.getByText('May 2022 – present')).toBeInTheDocument()
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
    expect(screen.queryByText(/present/)).toBeNull()
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

it('lists education with school and year', () => {
  render(<Experience />)
  const e = data.education[0]
  expect(screen.getByRole('heading', { level: 2, name: 'Education' })).toBeInTheDocument()
  expect(screen.getByText(e.degree)).toBeInTheDocument()
  expect(screen.getByText(e.year)).toBeInTheDocument()
})
