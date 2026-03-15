import {
  filterApartments,
  getUniqueCities,
  getUniqueAreas,
  getAreasByCity,
  areDatesValid,
  calculateNights,
} from '@/lib/utils/search'
import type { Apartment } from '@/lib/types'

const mockApartments: Apartment[] = [
  {
    id: '1',
    name: 'Apt Lagos VI',
    shortDescription: 'Luxury in VI',
    location: { city: 'Lagos', area: 'Victoria Island' },
    pricePerNight: 50000,
    images: ['img1.jpg'],
    amenities: [],
    houseRules: [],
    capacity: 4,
    beds: 2,
    baths: 2,
    rating: 4.9,
    reviews: 50,
  },
  {
    id: '2',
    name: 'Apt Abuja Wuse',
    shortDescription: 'Central Abuja',
    location: { city: 'Abuja', area: 'Wuse 2' },
    pricePerNight: 45000,
    images: ['img2.jpg'],
    amenities: [],
    houseRules: [],
    capacity: 2,
    beds: 1,
    baths: 1,
    rating: 4.8,
    reviews: 30,
  },
  {
    id: '3',
    name: 'Apt Lagos Lekki',
    shortDescription: 'Lekki view',
    location: { city: 'Lagos', area: 'Lekki' },
    pricePerNight: 60000,
    images: ['img3.jpg'],
    amenities: [],
    houseRules: [],
    capacity: 6,
    beds: 3,
    baths: 3,
    rating: 4.7,
    reviews: 20,
  },
]

describe('filterApartments', () => {
  it('returns all apartments when no filters', () => {
    const result = filterApartments(mockApartments, {})
    expect(result).toHaveLength(3)
  })

  it('filters by location (city)', () => {
    const result = filterApartments(mockApartments, { location: 'Lagos' })
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.location.city === 'Lagos')).toBe(true)
  })

  it('filters by location (area)', () => {
    const result = filterApartments(mockApartments, { location: 'Lekki' })
    expect(result).toHaveLength(1)
    expect(result[0].location.area).toBe('Lekki')
  })

  it('filters by location case-insensitively', () => {
    const result = filterApartments(mockApartments, { location: 'abuja' })
    expect(result).toHaveLength(1)
    expect(result[0].location.city).toBe('Abuja')
  })

  it('filters by guests (capacity)', () => {
    const result = filterApartments(mockApartments, { guests: 5 })
    expect(result).toHaveLength(1)
    expect(result[0].capacity).toBe(6)
  })

  it('returns empty when guests exceed all capacities', () => {
    const result = filterApartments(mockApartments, { guests: 10 })
    expect(result).toHaveLength(0)
  })

  it('combines location and guests', () => {
    const result = filterApartments(mockApartments, { location: 'Lagos', guests: 3 })
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.location.city === 'Lagos' && a.capacity >= 3)).toBe(true)
  })
})

describe('getUniqueCities', () => {
  it('returns sorted unique cities', () => {
    const result = getUniqueCities(mockApartments)
    expect(result).toEqual(['Abuja', 'Lagos'])
  })

  it('returns empty array for empty input', () => {
    expect(getUniqueCities([])).toEqual([])
  })
})

describe('getUniqueAreas', () => {
  it('returns sorted unique areas', () => {
    const result = getUniqueAreas(mockApartments)
    expect(result).toEqual(['Lekki', 'Victoria Island', 'Wuse 2'])
  })

  it('returns empty array for empty input', () => {
    expect(getUniqueAreas([])).toEqual([])
  })
})

describe('getAreasByCity', () => {
  it('returns areas for given city', () => {
    const result = getAreasByCity(mockApartments, 'Lagos')
    expect(result).toEqual(['Lekki', 'Victoria Island'])
  })

  it('is case-insensitive', () => {
    const result = getAreasByCity(mockApartments, 'lagos')
    expect(result).toEqual(['Lekki', 'Victoria Island'])
  })

  it('returns empty for unknown city', () => {
    expect(getAreasByCity(mockApartments, 'Unknown')).toEqual([])
  })
})

describe('areDatesValid', () => {
  it('returns true when no dates provided', () => {
    expect(areDatesValid('', '')).toBe(true)
    expect(areDatesValid('', '2025-02-01')).toBe(true)
    expect(areDatesValid('2025-01-01', '')).toBe(true)
  })

  it('returns false when check-in is in the past', () => {
    expect(areDatesValid('2020-01-01', '2025-06-01')).toBe(false)
  })

  it('returns false when check-out is before or equal to check-in', () => {
    expect(areDatesValid('2025-06-01', '2025-05-31')).toBe(false)
    expect(areDatesValid('2025-06-01', '2025-06-01')).toBe(false)
  })

  it('returns true when check-out is after check-in and check-in is in the future', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const checkIn = future.toISOString().split('T')[0]
    const checkOut = new Date(future.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    expect(areDatesValid(checkIn, checkOut)).toBe(true)
  })
})

describe('calculateNights', () => {
  it('returns 0 when dates missing', () => {
    expect(calculateNights('', '')).toBe(0)
    expect(calculateNights('2025-01-01', '')).toBe(0)
    expect(calculateNights('', '2025-01-02')).toBe(0)
  })

  it('returns 1 for consecutive days', () => {
    expect(calculateNights('2025-01-01', '2025-01-02')).toBe(1)
  })

  it('returns correct number for multiple nights', () => {
    expect(calculateNights('2025-01-01', '2025-01-05')).toBe(4)
  })

  it('returns 0 when check-out before check-in', () => {
    expect(calculateNights('2025-01-05', '2025-01-01')).toBe(0)
  })

  it('uses ceil for partial days (e.g. 2 calendar days = 2 nights)', () => {
    // 00:00 UTC Jan 1 to 23:59 UTC Jan 2 is ~2 days, so ceil gives 2 nights
    expect(calculateNights('2025-01-01T00:00:00Z', '2025-01-02T23:59:59Z')).toBe(2)
  })
})
