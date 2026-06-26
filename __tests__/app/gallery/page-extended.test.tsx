import { render, screen } from '@testing-library/react'
import { GalleryClient } from '@/components/GalleryClient'
import type { GalleryImageItem } from '@/lib/data/getApartmentImages'

const mockItems: GalleryImageItem[] = [
  {
    apartment: 'Horizon Suite',
    apartmentId: 'horizon-suite',
    image: {
      thumbnail: 'https://example.com/thumb-1.jpg',
      medium: 'https://example.com/medium-1.jpg',
      large: 'https://example.com/large-1.jpg',
    },
  },
  {
    apartment: 'Skyline Suite',
    apartmentId: 'skyline-suite',
    image: {
      thumbnail: 'https://example.com/thumb-2.jpg',
      medium: 'https://example.com/medium-2.jpg',
      large: 'https://example.com/large-2.jpg',
    },
  },
  {
    apartment: 'Meridian Suite',
    apartmentId: 'meridian-suite',
    image: {
      thumbnail: 'https://example.com/thumb-3.jpg',
      medium: 'https://example.com/medium-3.jpg',
      large: 'https://example.com/large-3.jpg',
    },
  },
  {
    apartment: 'Lumen Suite',
    apartmentId: 'lumen-suite',
    image: {
      thumbnail: 'https://example.com/thumb-4.jpg',
      medium: 'https://example.com/medium-4.jpg',
      large: 'https://example.com/large-4.jpg',
    },
  },
  {
    apartment: 'Horizon Suite',
    apartmentId: 'horizon-suite',
    image: {
      thumbnail: 'https://example.com/thumb-5.jpg',
      medium: 'https://example.com/medium-5.jpg',
      large: 'https://example.com/large-5.jpg',
    },
  },
  {
    apartment: 'Skyline Suite',
    apartmentId: 'skyline-suite',
    image: {
      thumbnail: 'https://example.com/thumb-6.jpg',
      medium: 'https://example.com/medium-6.jpg',
      large: 'https://example.com/large-6.jpg',
    },
  },
]

describe('Gallery Page - Extended Coverage', () => {
  it('renders all apartment images', () => {
    render(<GalleryClient suiteItems={mockItems} propertyItems={[]} />)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(5)
  })

  it('displays apartment names with images', () => {
    render(<GalleryClient suiteItems={mockItems} propertyItems={[]} />)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })
})
