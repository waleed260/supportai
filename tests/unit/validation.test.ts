import { describe, it, expect } from 'vitest'
import {
  sanitizeText,
  stripHtml,
  sanitizeInput,
  webchatSchema,
  registerSchema,
  authCallbackSchema,
  membershipsPostSchema,
  paginationSchema,
  metaOAuthStateSchema,
  conversationIdSchema,
} from '@/lib/validation'

describe('sanitizeText', () => {
  it('trims surrounding whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello')
  })

  it('caps length to maxLen', () => {
    expect(sanitizeText('abcdef', 3)).toBe('abc')
  })

  it('defaults to an 8000-char cap', () => {
    const long = 'x'.repeat(9000)
    expect(sanitizeText(long).length).toBe(8000)
  })
})

describe('stripHtml', () => {
  it('removes tags and stray angle brackets', () => {
    expect(stripHtml('<b>hi</b>')).toBe('hi')
    // Anything matching <...> is treated as a tag and dropped, including "< b >"
    expect(stripHtml('a < b > c')).toBe('a  c')
    // A lone unmatched bracket is scrubbed by the second pass
    expect(stripHtml('2 < 3')).toBe('2  3')
  })

  it('defuses script tags', () => {
    expect(stripHtml('<script>alert(1)</script>')).toBe('alert(1)')
    expect(stripHtml('<img src=x onerror=alert(1)>')).toBe('')
  })
})

describe('sanitizeInput', () => {
  it('strips html then trims and caps', () => {
    expect(sanitizeInput('  <i>hey</i>  ')).toBe('hey')
    expect(sanitizeInput('<b>abcdef</b>', 3)).toBe('abc')
  })
})

describe('webchatSchema', () => {
  it('defaults customer_name when omitted', () => {
    const parsed = webchatSchema.parse({ organization_id: 'org_1', message: 'hi' })
    expect(parsed.customer_name).toBe('Website Visitor')
  })

  it('rejects an empty message', () => {
    expect(webchatSchema.safeParse({ organization_id: 'org_1', message: '' }).success).toBe(false)
  })

  it('rejects a message over 8000 chars', () => {
    const res = webchatSchema.safeParse({ organization_id: 'org_1', message: 'x'.repeat(8001) })
    expect(res.success).toBe(false)
  })

  it('rejects a malformed email but accepts null', () => {
    expect(
      webchatSchema.safeParse({ organization_id: 'o', message: 'hi', customer_email: 'not-an-email' }).success,
    ).toBe(false)
    expect(
      webchatSchema.safeParse({ organization_id: 'o', message: 'hi', customer_email: null }).success,
    ).toBe(true)
  })
})

describe('registerSchema', () => {
  const base = { email: 'a@b.com', password: 'secret1', name: 'A', companyName: 'Co' }

  it('accepts a well-formed payload', () => {
    expect(registerSchema.safeParse(base).success).toBe(true)
  })

  it('rejects a password shorter than 6 chars', () => {
    expect(registerSchema.safeParse({ ...base, password: 'short' }).success).toBe(false)
  })

  it('requires a non-empty company name', () => {
    expect(registerSchema.safeParse({ ...base, companyName: '' }).success).toBe(false)
  })
})

describe('authCallbackSchema', () => {
  it('requires a valid email and a non-empty password', () => {
    expect(authCallbackSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
    expect(authCallbackSchema.safeParse({ email: 'bad', password: 'x' }).success).toBe(false)
    expect(authCallbackSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })
})

describe('membershipsPostSchema', () => {
  it('requires either user_id or email', () => {
    expect(membershipsPostSchema.safeParse({}).success).toBe(false)
    expect(membershipsPostSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
    expect(
      membershipsPostSchema.safeParse({ user_id: '550e8400-e29b-41d4-a716-446655440000' }).success,
    ).toBe(true)
  })

  it('rejects an unknown role', () => {
    expect(membershipsPostSchema.safeParse({ email: 'a@b.com', role: 'root' }).success).toBe(false)
  })
})

describe('paginationSchema', () => {
  it('applies defaults', () => {
    const p = paginationSchema.parse({})
    expect(p).toEqual({ page: 1, pageSize: 50 })
  })

  it('coerces numeric strings', () => {
    expect(paginationSchema.parse({ page: '2', pageSize: '10' })).toEqual({ page: 2, pageSize: 10 })
  })

  it('caps pageSize at 100', () => {
    expect(paginationSchema.safeParse({ pageSize: 101 }).success).toBe(false)
  })
})

describe('conversationIdSchema', () => {
  it('requires a uuid', () => {
    expect(conversationIdSchema.safeParse({ id: 'not-uuid' }).success).toBe(false)
    expect(
      conversationIdSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' }).success,
    ).toBe(true)
  })
})

describe('metaOAuthStateSchema', () => {
  it('accepts a whitelisted channel', () => {
    expect(
      metaOAuthStateSchema.safeParse({ org_id: 'o', channel: 'whatsapp', uid: 'u' }).success,
    ).toBe(true)
  })

  it('rejects an unsupported channel', () => {
    expect(
      metaOAuthStateSchema.safeParse({ org_id: 'o', channel: 'web_chat', uid: 'u' }).success,
    ).toBe(false)
  })
})
