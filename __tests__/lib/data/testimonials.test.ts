import { testimonials } from '@/lib/data/testimonials'

describe('testimonials data', () => {
  it('exports testimonials array', () => {
    expect(Array.isArray(testimonials)).toBe(true)
    expect(testimonials.length).toBeGreaterThan(0)
  })

  it('each testimonial has required fields', () => {
    testimonials.forEach((testimonial) => {
      expect(testimonial).toHaveProperty('id')
      expect(testimonial).toHaveProperty('name')
      expect(testimonial).toHaveProperty('location')
      expect(testimonial).toHaveProperty('rating')
      expect(testimonial).toHaveProperty('comment')
      expect(testimonial).toHaveProperty('date')
    })
  })

  it('testimonial rating is between 0 and 5', () => {
    testimonials.forEach((testimonial) => {
      expect(testimonial.rating).toBeGreaterThanOrEqual(0)
      expect(testimonial.rating).toBeLessThanOrEqual(5)
    })
  })

  it('testimonial has non-empty comment', () => {
    testimonials.forEach((testimonial) => {
      expect(typeof testimonial.comment).toBe('string')
      expect(testimonial.comment.length).toBeGreaterThan(0)
    })
  })

  it('testimonial has non-empty name and location', () => {
    testimonials.forEach((testimonial) => {
      expect(typeof testimonial.name).toBe('string')
      expect(testimonial.name.length).toBeGreaterThan(0)
      expect(typeof testimonial.location).toBe('string')
      expect(testimonial.location.length).toBeGreaterThan(0)
    })
  })
})

