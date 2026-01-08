import sitemap from '@/app/sitemap'

describe('Sitemap', () => {
  it('generates sitemap with all pages', () => {
    const result = sitemap()
    
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes homepage', () => {
    const result = sitemap()
    const homepage = result.find((item) => {
      const url = new URL(item.url)
      return url.pathname === '/' || url.pathname === ''
    })
    expect(homepage).toBeDefined()
    expect(homepage?.priority).toBe(1)
  })

  it('includes apartment pages', () => {
    const result = sitemap()
    const apartmentPages = result.filter((item) => item.url.includes('/apartments/'))
    expect(apartmentPages.length).toBeGreaterThan(0)
  })

  it('includes blog pages', () => {
    const result = sitemap()
    const blogPages = result.filter((item) => item.url.includes('/blog/'))
    expect(blogPages.length).toBeGreaterThan(0)
  })

  it('includes static pages', () => {
    const result = sitemap()
    const staticPages = ['/apartments', '/blog', '/booking', '/contact', '/about', '/gallery', '/terms', '/privacy']
    
    staticPages.forEach((path) => {
      const page = result.find((item) => item.url.includes(path) && !item.url.includes('/blog/') && !item.url.includes('/apartments/'))
      expect(page).toBeDefined()
    })
  })

  it('has correct structure for all entries', () => {
    const result = sitemap()
    result.forEach((entry) => {
      expect(entry).toHaveProperty('url')
      expect(entry).toHaveProperty('lastModified')
      expect(entry).toHaveProperty('changeFrequency')
      expect(entry).toHaveProperty('priority')
      expect(typeof entry.url).toBe('string')
      expect(entry.priority).toBeGreaterThanOrEqual(0)
      expect(entry.priority).toBeLessThanOrEqual(1)
    })
  })
})

