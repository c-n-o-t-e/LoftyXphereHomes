import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toContain('foo')
    expect(cn('foo', 'bar')).toContain('bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toContain('base')
    expect(cn('base', false && 'hidden', true && 'visible')).toContain('visible')
  })

  it('handles undefined and null', () => {
    expect(cn('a', undefined, null, 'b')).toContain('a')
    expect(cn('a', undefined, null, 'b')).toContain('b')
  })

  it('deduplicates and merges tailwind classes via twMerge', () => {
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })
})
