import { describe, it, expect } from 'vitest'
import config from '../tailwind.config.js'

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('design tokens', () => {
  it('accent text meets WCAG AA on paper', () => {
    expect(contrast('#2B4C7E', '#F6F3EC')).toBeGreaterThanOrEqual(4.5)
  })
  it('muted ink meets WCAG AA on paper', () => {
    expect(contrast('#5E5B55', '#F6F3EC')).toBeGreaterThanOrEqual(4.5)
  })
  it('tailwind config exposes the acc color', () => {
    expect(config.theme.extend.colors.acc).toBe('#2B4C7E')
  })
})
