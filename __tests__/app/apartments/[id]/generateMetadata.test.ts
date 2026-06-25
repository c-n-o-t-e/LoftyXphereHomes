import { generateMetadata } from '@/app/apartments/[id]/page'
import { getApartmentById } from '@/lib/data/apartments'

jest.mock('@/lib/data/getApartmentImages', () => ({
  getApartmentImageSets: jest.fn(async () => [
    {
      thumbnail: 'https://example.com/thumb.jpg',
      medium: 'https://example.com/medium.jpg',
      large: 'https://example.com/large.jpg',
    },
  ]),
}))

describe('Apartment Detail Page - generateMetadata', () => {
  it('returns metadata when apartment exists', async () => {
    const apartment = getApartmentById('lofty-skyline-suite')
    const params = Promise.resolve({ id: 'lofty-skyline-suite' })
    const metadata = await generateMetadata({ params })
    
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe(apartment?.name)
    expect(metadata.description).toBe(apartment?.shortDescription)
    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph?.title).toBe(apartment?.name)
  })

  it('returns not found metadata when apartment does not exist', async () => {
    const params = Promise.resolve({ id: 'non-existent-apartment' })
    const metadata = await generateMetadata({ params })
    
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Apartment Not Found')
  })
})

