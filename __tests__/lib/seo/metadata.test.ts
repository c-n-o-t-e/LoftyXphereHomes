import { buildRootMetadata } from '@/lib/seo/metadata'
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  SITE_KEYWORDS,
  absoluteUrl,
} from '@/lib/seo/constants'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_DESCRIPTION,
  SITE_TITLE,
} from '@/lib/constants'
import { buildStructuredDataGraph } from '@/lib/seo/structured-data'

describe('SEO metadata', () => {
  it('buildRootMetadata uses premium hospitality title and descriptions', () => {
    const metadata = buildRootMetadata()

    expect(metadata.title).toEqual({
      default: SITE_TITLE,
      template: `%s | ${SITE_NAME}`,
    })
    expect(metadata.description).toBe(SITE_DESCRIPTION)
    expect(metadata.openGraph?.title).toBe(SITE_TITLE)
    expect(metadata.openGraph?.description).toBe(SITE_OG_DESCRIPTION)
    expect(metadata.twitter?.title).toBe(SITE_TITLE)
    expect(metadata.twitter?.description).toBe(SITE_OG_DESCRIPTION)
  })

  it('includes Open Graph image for social crawlers', () => {
    const apartmentPhoto = {
      url: 'https://cdn.example/outdoor-large.jpg',
      alt: 'Outdoor lounge at Lofty Xphere Homes',
      fromPropertyPhoto: true,
    }
    const metadata = buildRootMetadata({ socialShareImage: apartmentPhoto })
    const images = metadata.openGraph?.images

    expect(Array.isArray(images)).toBe(true)
    expect(images?.[0]).toMatchObject({
      url: apartmentPhoto.url,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: apartmentPhoto.alt,
    })
    expect(metadata.twitter?.images).toContain(apartmentPhoto.url)
  })

  it('falls back to static OG asset when no apartment photo is provided', () => {
    const metadata = buildRootMetadata()
    const images = metadata.openGraph?.images

    expect(images?.[0]).toMatchObject({
      url: absoluteUrl(OG_IMAGE_PATH),
    })
  })

  it('includes hospitality-focused keywords without stuffing', () => {
    const metadata = buildRootMetadata()
    expect(metadata.keywords).toEqual(expect.arrayContaining([...SITE_KEYWORDS]))
    expect(metadata.keywords?.length).toBeLessThanOrEqual(15)
  })

  it('sets favicon icons for browsers', () => {
    const metadata = buildRootMetadata()
    expect(metadata.icons).toMatchObject({
      icon: [{ url: '/favicon.png', type: 'image/png' }],
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    })
  })
})

describe('Structured data', () => {
  it('builds Organization, LodgingBusiness, and WebSite graph', () => {
    const graph = buildStructuredDataGraph()
    const types = graph['@graph'].map((node) => node['@type'])

    expect(types).toEqual(
      expect.arrayContaining(['Organization', 'LodgingBusiness', 'WebSite', 'WebPage']),
    )
  })

  it('includes verified social profile links', () => {
    const graph = buildStructuredDataGraph()
    const organization = graph['@graph'].find((node) => node['@type'] === 'Organization')

    expect(organization?.sameAs).toEqual([
      'https://www.instagram.com/loftyxpherehomes',
      'https://www.facebook.com/loftyxpherehomes',
      'https://x.com/loftyxpherehomes',
    ])
  })
})
