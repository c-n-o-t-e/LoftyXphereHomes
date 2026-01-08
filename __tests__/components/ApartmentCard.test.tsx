import { render, screen } from '@testing-library/react'
import ApartmentCard from '@/components/ApartmentCard'
import { Apartment } from '@/lib/types'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

const mockApartment: Apartment = {
  id: 'test-apartment-01',
  name: 'Test Apartment',
  shortDescription: 'A beautiful test apartment',
  location: {
    city: 'Lagos',
    area: 'Victoria Island',
  },
  pricePerNight: 50000,
  images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
  amenities: ['Wi-Fi', 'Air Conditioning'],
  houseRules: ['No smoking'],
  capacity: 2,
  beds: 1,
  baths: 1,
  rating: 4.5,
  reviews: 10,
}

describe('ApartmentCard', () => {
  it('renders apartment name', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    expect(screen.getByText('Test Apartment')).toBeInTheDocument()
  })

  it('renders apartment description', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    expect(screen.getByText('A beautiful test apartment')).toBeInTheDocument()
  })

  it('renders location information', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    expect(screen.getByText(/Victoria Island, Lagos/i)).toBeInTheDocument()
  })

  it('renders price per night', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    expect(screen.getByText(/₦50,000/i)).toBeInTheDocument()
    expect(screen.getByText(/per night/i)).toBeInTheDocument()
  })

  it('renders rating', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('renders capacity, beds, and baths', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    expect(screen.getByText('2')).toBeInTheDocument() // capacity
  })

  it('renders View Details button', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    expect(screen.getByText('View Details')).toBeInTheDocument()
  })

  it('links to apartment detail page', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    const link = screen.getByText('Test Apartment').closest('a')
    expect(link).toHaveAttribute('href', '/apartments/test-apartment-01')
  })

  it('renders apartment image', () => {
    render(<ApartmentCard apartment={mockApartment} />)
    const image = screen.getByAltText('Test Apartment')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('unsplash.com'))
  })
})

