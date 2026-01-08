import robots from '@/app/robots'

describe('Robots', () => {
  it('generates robots.txt configuration', () => {
    const result = robots()
    
    expect(result).toHaveProperty('rules')
    expect(result).toHaveProperty('sitemap')
  })

  it('allows all user agents', () => {
    const result = robots()
    expect(result.rules).toHaveProperty('userAgent')
    expect(result.rules.userAgent).toBe('*')
  })

  it('allows root path', () => {
    const result = robots()
    expect(result.rules.allow).toBe('/')
  })

  it('disallows api and admin paths', () => {
    const result = robots()
    expect(Array.isArray(result.rules.disallow)).toBe(true)
    expect(result.rules.disallow).toContain('/api/')
    expect(result.rules.disallow).toContain('/admin/')
  })

  it('includes sitemap URL', () => {
    const result = robots()
    expect(result.sitemap).toBeTruthy()
    expect(result.sitemap).toContain('/sitemap.xml')
  })
})

