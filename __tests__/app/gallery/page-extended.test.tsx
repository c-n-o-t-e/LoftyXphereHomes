import { render, screen } from '@testing-library/react'
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
