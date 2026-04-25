import {
  CHECK_IN_TIME,
  CHECK_OUT_TIME,
  STANDARD_AMENITIES,
  STANDARD_HOUSE_RULES,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  DISCOUNT_PER_NIGHT_3_6,
  DISCOUNT_PER_NIGHT_1_WEEK_TO_3_WEEKS,
  DISCOUNT_PER_NIGHT_1_MONTH_PLUS,
  getStayDiscountPerNight,
  getStayDiscountAmount,
  PAYSTACK_FEE,
  WHATSAPP_DEFAULT_MESSAGE,
  getWhatsAppChatUrl,
  normalizeWhatsAppPhoneDigits,
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

  it('exports SITE_URL', () => {
    expect(SITE_URL).toBeDefined()
    expect(typeof SITE_URL).toBe('string')
    expect(SITE_URL.length).toBeGreaterThan(0)
  })

  it('exports discount constants', () => {
    expect(DISCOUNT_PER_NIGHT_3_6).toBe(10_000)
    expect(DISCOUNT_PER_NIGHT_1_WEEK_TO_3_WEEKS).toBe(20_000)
    expect(DISCOUNT_PER_NIGHT_1_MONTH_PLUS).toBe(30_000)
  })

  it('exports PAYSTACK_FEE', () => {
    expect(PAYSTACK_FEE).toBe(1250)
  })

  describe('getStayDiscountPerNight', () => {
    it('returns 0 for fewer than 3 nights', () => {
      expect(getStayDiscountPerNight(0)).toBe(0)
      expect(getStayDiscountPerNight(1)).toBe(0)
      expect(getStayDiscountPerNight(2)).toBe(0)
    })
    it('returns DISCOUNT_PER_NIGHT_3_6 for 3–6 nights', () => {
      expect(getStayDiscountPerNight(3)).toBe(10_000)
      expect(getStayDiscountPerNight(6)).toBe(10_000)
    })
    it('returns DISCOUNT_PER_NIGHT_1_WEEK_TO_3_WEEKS for 7–21 nights', () => {
      expect(getStayDiscountPerNight(7)).toBe(20_000)
      expect(getStayDiscountPerNight(21)).toBe(20_000)
    })
    it('returns DISCOUNT_PER_NIGHT_1_MONTH_PLUS for 28+ nights', () => {
      expect(getStayDiscountPerNight(28)).toBe(30_000)
      expect(getStayDiscountPerNight(100)).toBe(30_000)
    })
  })

  describe('getStayDiscountAmount', () => {
    it('returns 0 for 0 nights', () => {
      expect(getStayDiscountAmount(0)).toBe(0)
    })
    it('returns discount per night × nights', () => {
      expect(getStayDiscountAmount(5)).toBe(50_000)
      expect(getStayDiscountAmount(14)).toBe(280_000)
      expect(getStayDiscountAmount(30)).toBe(900_000)
    })
  })

  describe('normalizeWhatsAppPhoneDigits', () => {
    it('returns null for empty or non-numeric', () => {
      expect(normalizeWhatsAppPhoneDigits('')).toBeNull()
      expect(normalizeWhatsAppPhoneDigits('abc')).toBeNull()
    })
    it('leaves 234-prefixed numbers as-is', () => {
      expect(normalizeWhatsAppPhoneDigits('+234 801 234 5678')).toBe('2348012345678')
    })
    it('converts Nigerian 0-prefixed mobile to 234…', () => {
      expect(normalizeWhatsAppPhoneDigits('08161122328')).toBe('2348161122328')
    })
  })

  describe('getWhatsAppChatUrl', () => {
    it('returns null when there are no digits', () => {
      expect(getWhatsAppChatUrl('')).toBeNull()
      expect(getWhatsAppChatUrl('abc')).toBeNull()
    })

    it('strips non-digits and builds wa.me URL with default message', () => {
      const url = getWhatsAppChatUrl('+234 801 234 5678')
      expect(url).toContain('https://wa.me/2348012345678')
      expect(url).toContain(encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE))
    })

    it('uses custom message when provided', () => {
      const url = getWhatsAppChatUrl('2348012345678', 'Custom hi')
      expect(url).toContain(encodeURIComponent('Custom hi'))
    })

    it('normalizes local Nigerian 081… for wa.me', () => {
      const url = getWhatsAppChatUrl('08161122328')
      expect(url).toContain('https://wa.me/2348161122328')
    })
  })
})

