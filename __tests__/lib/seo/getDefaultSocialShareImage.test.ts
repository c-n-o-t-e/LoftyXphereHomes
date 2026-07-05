import { getDefaultSocialShareImage } from '@/lib/seo/getDefaultSocialShareImage'
import { getSiteSocialShareImage } from '@/lib/data/propertyAmenities'
import { absoluteUrl, OG_IMAGE_PATH } from '@/lib/seo/constants'

jest.mock('@/lib/data/propertyAmenities', () => ({
  getSiteSocialShareImage: jest.fn(),
}))

const mockedGetSiteSocialShareImage = getSiteSocialShareImage as jest.MockedFunction<
  typeof getSiteSocialShareImage
>

describe('getDefaultSocialShareImage', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns outdoor & common areas gallery photo #10 when available', async () => {
    mockedGetSiteSocialShareImage.mockResolvedValue({
      thumbnail: 'https://cdn.example/outdoor-thumb.jpg',
      medium: 'https://cdn.example/outdoor-medium.jpg',
      large: 'https://cdn.example/outdoor-large.jpg',
      blurDataUrl: null,
      altText: 'Outdoor lounge at Lofty Xphere Homes',
    })

    const image = await getDefaultSocialShareImage()

    expect(image.fromPropertyPhoto).toBe(true)
    expect(image.url).toBe('https://cdn.example/outdoor-large.jpg')
    expect(image.alt).toBe('Outdoor lounge at Lofty Xphere Homes')
  })

  it('falls back to the static OG asset when the outdoor photo is unavailable', async () => {
    mockedGetSiteSocialShareImage.mockResolvedValue(null)

    const image = await getDefaultSocialShareImage()

    expect(image.fromPropertyPhoto).toBe(false)
    expect(image.url).toBe(absoluteUrl(OG_IMAGE_PATH))
  })
})
