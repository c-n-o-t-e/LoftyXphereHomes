import { render, screen } from '@testing-library/react'
import { GalleryClient } from '@/components/GalleryClient'
import type { GalleryImageItem } from '@/lib/data/getApartmentImages'

const mockItems: GalleryImageItem[] = [
  {
    apartment: 'Test Apartment',
    apartmentId: 'test-1',
    image: {
      thumbnail: 'https://example.com/thumb.jpg',
      medium: 'https://example.com/medium.jpg',
      large: 'https://example.com/large.jpg',
    },
  },
]

describe('Gallery Page', () => {
  it('renders gallery images via client component', () => {
    render(<GalleryClient items={mockItems} />)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('renders apartment name on hover overlay target', () => {
    render(<GalleryClient items={mockItems} />)
    expect(screen.getByText('Test Apartment')).toBeInTheDocument()
  })
})
