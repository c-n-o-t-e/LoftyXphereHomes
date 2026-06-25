import { render, screen } from '@testing-library/react'
import ApartmentCard from '@/components/ApartmentCard'
import { Apartment } from '@/lib/types'
import type { ApartmentImageSet } from '@/lib/images/types'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

const mockImageSet: ApartmentImageSet = {
  thumbnail: 'https://example.com/thumb.jpg',
  medium: 'https://example.com/medium.jpg',
  large: 'https://example.com/large.jpg',
}

const mockApartment: Apartment = {
  id: 'test-apartment-01',
  name: 'Test Apartment',
  shortDescription: 'A beautiful test apartment',
  location: {
    city: 'Lagos',
    area: 'Victoria Island',
  },
  pricePerNight: 50000,
  images: [],
  amenities: ['Wi-Fi', 'Air Conditioning'],
  houseRules: ['No smoking'],
  capacity: 2,
  beds: 1,
  baths: 1,
  rating: 4.5,
  reviews: 10,
  status: 'active',
}

describe('ApartmentCard', () => {
  it('renders apartment name', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    expect(screen.getByText('Test Apartment')).toBeInTheDocument()
  })

  it('renders apartment description', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    expect(screen.getByText('A beautiful test apartment')).toBeInTheDocument()
  })

  it('renders location information', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    expect(screen.getByText(/Victoria Island, Lagos/i)).toBeInTheDocument()
  })

  it('renders price per night', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    expect(screen.getByText(/₦50,000/i)).toBeInTheDocument()
    expect(screen.getByText(/per night/i)).toBeInTheDocument()
  })

  it('does not render rating badge', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    expect(screen.queryByText('4.5')).not.toBeInTheDocument()
  })

  it('renders capacity, beds, and baths', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders View Details button', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    expect(screen.getByText('View Details')).toBeInTheDocument()
  })

  it('links to apartment detail page', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    const link = screen.getByText('Test Apartment').closest('a')
    expect(link).toHaveAttribute('href', '/apartments/test-apartment-01')
  })

  it('renders uploaded apartment image', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[mockImageSet]} />,
    )
    const image = screen.getByAltText(/Test Apartment - Image 1/)
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', expect.stringContaining('example.com'))
  })

  it('shows placeholder when apartment has no uploaded images', () => {
    render(<ApartmentCard apartment={mockApartment} imageSets={[]} />)
    expect(screen.queryByAltText(/Test Apartment - Image 1/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Photo coming soon')).toBeInTheDocument()
  })

  it('shows loading placeholder while images are loading', () => {
    render(
      <ApartmentCard apartment={mockApartment} imageSets={[]} imagesLoading />,
    )
    expect(screen.queryByAltText(/Test Apartment - Image 1/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Photo coming soon')).not.toBeInTheDocument()
  })
})
