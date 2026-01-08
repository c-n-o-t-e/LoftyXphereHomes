import { apartments, getApartmentById, getFeaturedApartments } from '@/lib/data/apartments'

describe('apartments data', () => {
  it('exports apartments array', () => {
    expect(Array.isArray(apartments)).toBe(true)
    expect(apartments.length).toBeGreaterThan(0)
  })

  it('each apartment has required fields', () => {
    apartments.forEach((apartment) => {
      expect(apartment).toHaveProperty('id')
      expect(apartment).toHaveProperty('name')
      expect(apartment).toHaveProperty('shortDescription')
      expect(apartment).toHaveProperty('location')
      expect(apartment).toHaveProperty('pricePerNight')
      expect(apartment).toHaveProperty('images')
      expect(apartment).toHaveProperty('amenities')
      expect(apartment).toHaveProperty('houseRules')
      expect(apartment).toHaveProperty('capacity')
      expect(apartment).toHaveProperty('beds')
      expect(apartment).toHaveProperty('baths')
      expect(apartment).toHaveProperty('rating')
      expect(apartment).toHaveProperty('reviews')
    })
  })

  it('apartment location has city and area', () => {
    apartments.forEach((apartment) => {
      expect(apartment.location).toHaveProperty('city')
      expect(apartment.location).toHaveProperty('area')
      expect(typeof apartment.location.city).toBe('string')
      expect(typeof apartment.location.area).toBe('string')
    })
  })

  it('apartment has at least one image', () => {
    apartments.forEach((apartment) => {
      expect(Array.isArray(apartment.images)).toBe(true)
      expect(apartment.images.length).toBeGreaterThan(0)
    })
  })

  it('apartment has valid rating between 0 and 5', () => {
    apartments.forEach((apartment) => {
      expect(apartment.rating).toBeGreaterThanOrEqual(0)
      expect(apartment.rating).toBeLessThanOrEqual(5)
    })
  })

  it('apartment has positive price', () => {
    apartments.forEach((apartment) => {
      expect(apartment.pricePerNight).toBeGreaterThan(0)
    })
  })

  it('apartment has positive capacity, beds, and baths', () => {
    apartments.forEach((apartment) => {
      expect(apartment.capacity).toBeGreaterThan(0)
      expect(apartment.beds).toBeGreaterThan(0)
      expect(apartment.baths).toBeGreaterThan(0)
    })
  })
})

describe('getApartmentById', () => {
  it('returns apartment when id exists', () => {
    const apartment = apartments[0]
    const result = getApartmentById(apartment.id)
    expect(result).toEqual(apartment)
  })

  it('returns undefined when id does not exist', () => {
    const result = getApartmentById('non-existent-id')
    expect(result).toBeUndefined()
  })
})

describe('getFeaturedApartments', () => {
  it('returns array of apartments', () => {
    const featured = getFeaturedApartments()
    expect(Array.isArray(featured)).toBe(true)
  })

  it('returns limited number of apartments', () => {
    const featured = getFeaturedApartments(3)
    expect(featured.length).toBeLessThanOrEqual(3)
  })

  it('returns apartments sorted by rating', () => {
    const featured = getFeaturedApartments(10)
    for (let i = 0; i < featured.length - 1; i++) {
      expect(featured[i].rating).toBeGreaterThanOrEqual(featured[i + 1].rating)
    }
  })

  it('returns all apartments when limit is greater than total', () => {
    const featured = getFeaturedApartments(100)
    expect(featured.length).toBeLessThanOrEqual(apartments.length)
  })
})

