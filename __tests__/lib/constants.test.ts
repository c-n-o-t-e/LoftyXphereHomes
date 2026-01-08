import {
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  STANDARD_AMENITIES,
  STANDARD_HOUSE_RULES,
  SITE_NAME,
  SITE_DESCRIPTION,
} from '@/lib/constants'

describe('constants', () => {
  it('exports CHECK_IN_TIME', () => {
    expect(CHECK_IN_TIME).toBeDefined()
    expect(typeof CHECK_IN_TIME).toBe('string')
  })

  it('exports CHECK_OUT_TIME', () => {
    expect(CHECK_OUT_TIME).toBeDefined()
    expect(typeof CHECK_OUT_TIME).toBe('string')
  })

  it('exports STANDARD_AMENITIES array', () => {
    expect(Array.isArray(STANDARD_AMENITIES)).toBe(true)
    expect(STANDARD_AMENITIES.length).toBeGreaterThan(0)
  })

  it('STANDARD_AMENITIES contains expected items', () => {
    expect(STANDARD_AMENITIES).toContain('24/7 Power')
    expect(STANDARD_AMENITIES).toContain('High-speed Wi-Fi')
    expect(STANDARD_AMENITIES).toContain('Air Conditioning')
  })

  it('exports STANDARD_HOUSE_RULES array', () => {
    expect(Array.isArray(STANDARD_HOUSE_RULES)).toBe(true)
    expect(STANDARD_HOUSE_RULES.length).toBeGreaterThan(0)
  })

  it('STANDARD_HOUSE_RULES contains expected items', () => {
    expect(STANDARD_HOUSE_RULES).toContain('No smoking indoors')
    expect(STANDARD_HOUSE_RULES).toContain('Valid ID required')
  })

  it('exports SITE_NAME', () => {
    expect(SITE_NAME).toBeDefined()
    expect(typeof SITE_NAME).toBe('string')
    expect(SITE_NAME).toBe('LoftyXphereHomes')
  })

  it('exports SITE_DESCRIPTION', () => {
    expect(SITE_DESCRIPTION).toBeDefined()
    expect(typeof SITE_DESCRIPTION).toBe('string')
    expect(SITE_DESCRIPTION.length).toBeGreaterThan(0)
  })
})

