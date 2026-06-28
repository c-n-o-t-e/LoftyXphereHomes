import {
  apartments,
  getApartmentById,
  getFeaturedApartments,
  getActiveApartments,
  getComingSoonApartments,
} from '@/lib/data/apartments'

describe('apartments data', () => {
  it('exports nine apartments', () => {
    expect(apartments).toHaveLength(9)
  })

  it('has four active and five coming soon suites', () => {
    expect(getActiveApartments()).toHaveLength(4)
    expect(getComingSoonApartments()).toHaveLength(5)
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
      expect(apartment).toHaveProperty('status')
    })
  })

  it('active one-bedroom suites are priced at ₦100,000', () => {
    getActiveApartments()
      .filter((apt) => apt.beds === 1)
      .forEach((apt) => {
        expect(apt.pricePerNight).toBe(100_000)
      })
  })

  it('active two-bedroom suites are priced at ₦200,000', () => {
    getActiveApartments()
      .filter((apt) => apt.beds === 2)
      .forEach((apt) => {
        expect(apt.pricePerNight).toBe(200_000)
      })
  })

  it('one-bedroom and two-bedroom suites have distinct in-suite amenity lists', () => {
    const oneBed = getApartmentById('horizon-suite')
    const twoBed = getApartmentById('meridian-suite')
    expect(oneBed?.amenities).toContain('Cozy bedroom')
    expect(oneBed?.amenities).toContain('2 air conditioners on solar & inverter')
    expect(twoBed?.amenities).toContain('Cozy bedrooms')
    expect(twoBed?.amenities).toContain('4 air conditioners on solar & inverter')
  })

  it('apartment location has city and area', () => {
    apartments.forEach((apartment) => {
      expect(apartment.location).toHaveProperty('city')
      expect(apartment.location).toHaveProperty('area')
      expect(typeof apartment.location.city).toBe('string')
      expect(typeof apartment.location.area).toBe('string')
    })
  })

  it('apartment images is an array', () => {
    apartments.forEach((apartment) => {
      expect(Array.isArray(apartment.images)).toBe(true)
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

  it('returns Meridian and Lumen suites first by default', () => {
    const featured = getFeaturedApartments(2)
    expect(featured.map((apt) => apt.id)).toEqual(['meridian-suite', 'lumen-suite'])
  })

  it('returns only active apartments when limit is greater than active total', () => {
    const featured = getFeaturedApartments(100)
    expect(featured.length).toBeLessThanOrEqual(getActiveApartments().length)
  })

  it('featured apartments are all active', () => {
    getFeaturedApartments(10).forEach((apt) => {
      expect(apt.status).toBe('active')
    })
  })
})

