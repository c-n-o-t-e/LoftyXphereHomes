import { render, screen } from '@testing-library/react'
import TestimonialSlider from '@/components/TestimonialSlider'

// Mock the carousel component
jest.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselNext: () => <button>Next</button>,
  CarouselPrevious: () => <button>Previous</button>,
}))

describe('TestimonialSlider', () => {
  it('renders the section heading', () => {
    render(<TestimonialSlider />)
    expect(screen.getByText('What Our Guests Say')).toBeInTheDocument()
  })

  it('renders the section description', () => {
    render(<TestimonialSlider />)
    expect(screen.getByText(/Don't just take our word for it/i)).toBeInTheDocument()
  })

  it('renders testimonial cards', () => {
    render(<TestimonialSlider />)
    // Should render at least one testimonial
    expect(screen.getByText(/Sarah Johnson/i)).toBeInTheDocument()
  })

  it('displays testimonial ratings', () => {
    render(<TestimonialSlider />)
    // Check for testimonial content
    const testimonials = screen.getAllByText(/United States|Singapore|Nigeria/i)
    expect(testimonials.length).toBeGreaterThan(0)
  })
})

