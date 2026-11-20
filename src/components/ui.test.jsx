import { render } from '@testing-library/react'
import { Section } from './ui'

describe('Section', () => {
  it('renders nothing for an empty array', () => {
    const { container } = render(<Section label="X">{[]}</Section>)
    expect(container).toBeEmptyDOMElement()
  })
  it('renders nothing without children', () => {
    const { container } = render(<Section label="X" />)
    expect(container).toBeEmptyDOMElement()
  })
  it('renders label, title and children', () => {
    const { getByText } = render(<Section label="Lab" title="T"><p>body</p></Section>)
    expect(getByText('Lab')).toBeInTheDocument()
    expect(getByText('T')).toBeInTheDocument()
    expect(getByText('body')).toBeInTheDocument()
  })
})
