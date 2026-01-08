import {
  blogPosts,
  getBlogPostById,
  getFeaturedBlogPosts,
  getBlogPostsByCategory,
} from '@/lib/data/blog'

describe('blog data', () => {
  it('exports blogPosts array', () => {
    expect(Array.isArray(blogPosts)).toBe(true)
    expect(blogPosts.length).toBeGreaterThan(0)
  })

  it('each blog post has required fields', () => {
    blogPosts.forEach((post) => {
      expect(post).toHaveProperty('id')
      expect(post).toHaveProperty('title')
      expect(post).toHaveProperty('excerpt')
      expect(post).toHaveProperty('content')
      expect(post).toHaveProperty('author')
      expect(post).toHaveProperty('authorRole')
      expect(post).toHaveProperty('publishedDate')
      expect(post).toHaveProperty('image')
      expect(post).toHaveProperty('category')
      expect(post).toHaveProperty('readTime')
      expect(post).toHaveProperty('tags')
    })
  })

  it('blog post has valid read time', () => {
    blogPosts.forEach((post) => {
      expect(post.readTime).toBeGreaterThan(0)
      expect(typeof post.readTime).toBe('number')
    })
  })

  it('blog post has non-empty tags array', () => {
    blogPosts.forEach((post) => {
      expect(Array.isArray(post.tags)).toBe(true)
      expect(post.tags.length).toBeGreaterThan(0)
    })
  })

  it('blog post has valid published date format', () => {
    blogPosts.forEach((post) => {
      const date = new Date(post.publishedDate)
      expect(date.toString()).not.toBe('Invalid Date')
    })
  })
})

describe('getBlogPostById', () => {
  it('returns blog post when id exists', () => {
    const post = blogPosts[0]
    const result = getBlogPostById(post.id)
    expect(result).toEqual(post)
  })

  it('returns undefined when id does not exist', () => {
    const result = getBlogPostById('non-existent-id')
    expect(result).toBeUndefined()
  })
})

describe('getFeaturedBlogPosts', () => {
  it('returns array of blog posts', () => {
    const featured = getFeaturedBlogPosts()
    expect(Array.isArray(featured)).toBe(true)
  })

  it('returns limited number of posts', () => {
    const featured = getFeaturedBlogPosts(3)
    expect(featured.length).toBeLessThanOrEqual(3)
  })

  it('returns all posts when limit is greater than total', () => {
    const featured = getFeaturedBlogPosts(100)
    expect(featured.length).toBeLessThanOrEqual(blogPosts.length)
  })
})

describe('getBlogPostsByCategory', () => {
  it('returns posts for a specific category', () => {
    const amenitiesPosts = getBlogPostsByCategory('Amenities')
    expect(amenitiesPosts.length).toBeGreaterThan(0)
    amenitiesPosts.forEach((post) => {
      expect(post.category).toBe('Amenities')
    })
  })

  it('returns empty array for non-existent category', () => {
    const result = getBlogPostsByCategory('NonExistent')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })
})

