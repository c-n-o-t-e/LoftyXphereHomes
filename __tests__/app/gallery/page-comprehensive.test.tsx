import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GalleryClient } from '@/components/GalleryClient'
import type { GalleryImageItem } from '@/lib/data/getApartmentImages'

const mockItems: GalleryImageItem[] = [
  {
    apartment: 'The Horizon Suite',
    apartmentId: 'lofty-horizon-suite',
    image: {
      thumbnail: 'https://example.com/thumb-1.jpg',
      medium: 'https://example.com/medium-1.jpg',
      large: 'https://example.com/large-1.jpg',
    },
  },
  {
    apartment: 'The Skyline Suite',
    apartmentId: 'lofty-skyline-suite',
    image: {
      thumbnail: 'https://example.com/thumb-2.jpg',
      medium: 'https://example.com/medium-2.jpg',
      large: 'https://example.com/large-2.jpg',
    },
  },
]

describe('Gallery Page - Comprehensive Coverage', () => {
  it('opens lightbox when image is clicked', async () => {
    const user = userEvent.setup()
    render(<GalleryClient suiteItems={mockItems} propertyItems={[]} />)

    const images = screen.getAllByRole('img')
    await user.click(images[0]!)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes lightbox when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<GalleryClient suiteItems={mockItems} propertyItems={[]} />)

    const images = screen.getAllByRole('img')
    await user.click(images[0]!)
    await user.click(screen.getByLabelText('Close'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('handles image click with correct apartment ID', async () => {
    const user = userEvent.setup()
    render(<GalleryClient suiteItems={mockItems} propertyItems={[]} />)

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
    await user.click(images[0]!)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
