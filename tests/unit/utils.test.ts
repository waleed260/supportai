import { describe, it, expect } from 'vitest'
import {
  generateSlug,
  truncate,
  formatCurrency,
  getSentimentColor,
  getStatusColor,
} from '@/lib/utils'

describe('generateSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(generateSlug('Acme Corp')).toBe('acme-corp')
  })

  it('collapses runs of non-alphanumerics into a single hyphen', () => {
    expect(generateSlug('Hello   World!!!Foo')).toBe('hello-world-foo')
  })

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('  !Acme!  ')).toBe('acme')
  })

  it('drops accented and symbol characters', () => {
    expect(generateSlug('Café & Bar')).toBe('caf-bar')
  })
})

describe('truncate', () => {
  it('leaves short strings untouched', () => {
    expect(truncate('hi', 10)).toBe('hi')
  })

  it('appends an ellipsis when over the limit', () => {
    expect(truncate('abcdef', 3)).toBe('abc...')
  })

  it('treats the boundary length as not truncated', () => {
    expect(truncate('abc', 3)).toBe('abc')
  })
})

describe('formatCurrency', () => {
  it('renders cents as USD', () => {
    expect(formatCurrency(1999)).toBe('$19.99')
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('color helpers', () => {
  it('maps known sentiments and falls back to gray', () => {
    expect(getSentimentColor('positive')).toBe('text-green-500')
    expect(getSentimentColor('high_risk')).toBe('text-red-600')
    expect(getSentimentColor('unknown')).toBe('text-gray-500')
  })

  it('maps known statuses and falls back', () => {
    expect(getStatusColor('escalated')).toBe('bg-red-100 text-red-800')
    expect(getStatusColor('mystery')).toBe('bg-gray-100 text-gray-800')
  })
})
