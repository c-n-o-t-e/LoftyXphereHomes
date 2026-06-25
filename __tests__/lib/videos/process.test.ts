import { validateHeroVideoUpload, validateApartmentVideoUpload } from '@/lib/videos/process'
import { APARTMENT_VIDEO_MAX_BYTES, HERO_VIDEO_MAX_BYTES } from '@/lib/videos/constants'

describe('validateHeroVideoUpload', () => {
  it('rejects empty files', () => {
    const result = validateHeroVideoUpload({ buffer: Buffer.alloc(0) })
    expect(result.ok).toBe(false)
  })

  it('accepts mp4 uploads within size limits', () => {
    const buffer = Buffer.alloc(1024)
    const result = validateHeroVideoUpload({ buffer, mimeType: 'video/mp4' })
    expect(result.ok).toBe(true)
  })

  it('rejects files over the max size', () => {
    const buffer = Buffer.alloc(HERO_VIDEO_MAX_BYTES + 1)
    const result = validateHeroVideoUpload({
      buffer,
      mimeType: 'video/mp4',
    })
    expect(result.ok).toBe(false)
  })

  it('rejects unsupported mime types', () => {
    const result = validateHeroVideoUpload({
      buffer: Buffer.alloc(10),
      mimeType: 'application/pdf',
    })
    expect(result.ok).toBe(false)
  })
})

describe('validateApartmentVideoUpload', () => {
  it('accepts mp4 uploads within apartment size limits', () => {
    const buffer = Buffer.alloc(1024)
    const result = validateApartmentVideoUpload({ buffer, mimeType: 'video/mp4' })
    expect(result.ok).toBe(true)
  })

  it('rejects files over the apartment max size', () => {
    const buffer = Buffer.alloc(APARTMENT_VIDEO_MAX_BYTES + 1)
    const result = validateApartmentVideoUpload({
      buffer,
      mimeType: 'video/mp4',
    })
    expect(result.ok).toBe(false)
  })
})
