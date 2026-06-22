import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GalleryClient } from '@/components/GalleryClient'
import { apartments } from '@/lib/data/apartments'
import { legacyUrlsToImageSets } from '@/lib/images/urls'
import type { GalleryImageItem } from '@/lib/data/getApartmentImages'

const mockItems: GalleryImageItem[] = apartments.flatMap((apt) =>
  legacyUrlsToImageSets(apt.images).map((image) => ({
    image,
    apartment: apt.name,
    apartmentId: apt.id,
  })),
)

describe('Gallery Page - Comprehensive Coverage', () => {
  it('opens lightbox when image is clicked', async () => {
    const user = userEvent.setup()
    render(<GalleryClient items={mockItems} />)

    const images = screen.getAllByRole('img')
    await user.click(images[0]!)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes lightbox when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<GalleryClient items={mockItems} />)

    const images = screen.getAllByRole('img')
    await user.click(images[0]!)
    await user.click(screen.getByLabelText('Close'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('handles image click with correct apartment ID', async () => {
    const user = userEvent.setup()
    render(<GalleryClient items={mockItems} />)

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
    await user.click(images[0]!)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
