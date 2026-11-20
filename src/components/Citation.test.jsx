import { render, screen, fireEvent, act } from '@testing-library/react'
import Citation from './Citation'
import { getProject, citationText, bibtex } from '../data/site'

const p = getProject('mergelock')
const CITE = 'Copy citation for mergelock'
const BIB = 'Copy BibTeX for mergelock'

describe('Citation', () => {
  const original = navigator.clipboard
  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: original, configurable: true })
  })
  const mockClipboard = () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    return writeText
  }
  const click = async (name) => {
    await act(async () => { fireEvent.click(screen.getByRole('button', { name })) })
  }

  it('renders nothing without a DOI', () => {
    const { container } = render(<Citation project={{ ...p, doi: null }} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('links the DOI through doi.org', () => {
    render(<Citation project={p} />)
    const a = screen.getByRole('link', { name: /doi\.org/ })
    expect(a).toHaveAttribute('href', `https://doi.org/${p.doi}`)
  })

  it('copies the citation and confirms', async () => {
    const writeText = mockClipboard()
    render(<Citation project={p} />)
    await click(CITE)
    expect(writeText).toHaveBeenCalledWith(citationText(p))
    expect(screen.getByRole('button', { name: CITE })).toHaveTextContent('Copied')
    expect(screen.getByRole('status')).toHaveTextContent('Citation copied')
  })

  it('copies BibTeX', async () => {
    const writeText = mockClipboard()
    render(<Citation project={p} />)
    await click(BIB)
    expect(writeText).toHaveBeenCalledWith(bibtex(p))
  })

  it('reveals and selects the citation when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    render(<Citation project={p} />)
    await click(CITE)
    const box = screen.getByRole('textbox', { name: 'Citation' })
    expect(box).toHaveValue(citationText(p))
    expect(box.selectionEnd - box.selectionStart).toBe(citationText(p).length)
  })

  it('reveals and selects the BibTeX when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    render(<Citation project={p} />)
    await click(BIB)
    const box = screen.getByRole('textbox', { name: 'BibTeX' })
    expect(box).toHaveValue(bibtex(p))
    expect(box.selectionEnd - box.selectionStart).toBe(bibtex(p).length)
  })
})
