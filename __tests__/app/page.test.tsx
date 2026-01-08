import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock the apartment data to avoid map issues
jest.mock('@/lib/data/apartments', () => ({
  getFeaturedApartments: jest.fn(() => [
    {
      id: 'test-1',
      name: 'Test Apartment',
      shortDescription: 'Test description',
      location: { city: 'Lagos', area: 'VI' },
      pricePerNight: 50000,
      images: ['https://example.com/image.jpg'],
      amenities: ['Wi-Fi'],
      houseRules: ['No smoking'],
      capacity: 2,
      beds: 1,
      baths: 1,
      rating: 4.5,
      reviews: 10,
    },
  ]),
  apartments: [],
}))

// Mock components that use framer-motion or carousel
jest.mock('@/components/ApartmentCard', () => {
  return function MockApartmentCard({ apartment }: { apartment: any }) {
    return <div data-testid="apartment-card">{apartment.name}</div>
  }
})

jest.mock('@/components/TestimonialSlider', () => {
  return function MockTestimonialSlider() {
    return <div data-testid="testimonial-slider">Testimonials</div>
  }
})

describe('Home Page', () => {
  it('renders the hero section', () => {
    render(<Home />)
    expect(screen.getByText('Premium Shortlet')).toBeInTheDocument()
  })

  it('renders featured apartments section', () => {
    render(<Home />)
    expect(screen.getByText('Featured Apartments')).toBeInTheDocument()
  })

  it('renders trust signals section', () => {
    render(<Home />)
    expect(screen.getByText('Why Choose LoftyXphereHomes?')).toBeInTheDocument()
  })

  it('renders amenities section', () => {
    render(<Home />)
    expect(screen.getByText('Premium Amenities')).toBeInTheDocument()
  })

  it('renders location highlight section', () => {
    render(<Home />)
    expect(screen.getByText('Prime Locations')).toBeInTheDocument()
  })

  it('renders testimonials section', () => {
    render(<Home />)
    // TestimonialSlider is mocked, so check for the mock component
    expect(screen.getByTestId('testimonial-slider')).toBeInTheDocument()
  })

  it('renders CTA section', () => {
    render(<Home />)
    expect(screen.getByText(/Ready to Experience Premium Shortlet Living/i)).toBeInTheDocument()
  })

  it('renders view all apartments button', () => {
    render(<Home />)
    expect(screen.getByText('View All Apartments')).toBeInTheDocument()
  })
})

