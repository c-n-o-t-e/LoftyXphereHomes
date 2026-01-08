import ApartmentDetailPage, { generateMetadata } from '@/app/apartments/[id]/page'
import { getApartmentById } from '@/lib/data/apartments'

describe('Apartment Detail Page - generateMetadata', () => {
  it('returns metadata when apartment exists', async () => {
    const apartment = getApartmentById('lofty-abuja-01')
    const params = Promise.resolve({ id: 'lofty-abuja-01' })
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

