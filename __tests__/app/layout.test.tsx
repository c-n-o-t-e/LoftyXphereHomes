// Layout is a server component that exports metadata
// We test the metadata export separately
import RootLayout from '@/app/layout'
import { buildRootMetadata } from '@/lib/seo/metadata'
import { SITE_NAME, SITE_TITLE } from '@/lib/constants'

const metadata = buildRootMetadata()

// Mock next/font
jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    variable: '--font-inter',
    subsets: ['latin'],
    className: 'font-inter',
  })),
  Playfair_Display: jest.fn(() => ({
    variable: '--font-playfair',
    subsets: ['latin'],
    className: 'font-playfair',
  })),
}))

// Mock components
jest.mock('@/components/Navbar', () => {
  return function MockNavbar() {
    return <nav>Navbar</nav>
  }
})

jest.mock('@/components/seo/StructuredData', () => ({
  StructuredData: () => null,
}))

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer>Footer</footer>
  }
})

describe('Root Layout', () => {
  it('exports metadata with correct structure', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBeDefined()
    expect(metadata.description).toBeDefined()
    expect(metadata.openGraph).toBeDefined()
  })

  it('has correct metadata title template', () => {
    expect(metadata.title).toHaveProperty('template')
    expect(metadata.title?.template).toContain(SITE_NAME)
    expect(metadata.title?.default).toBe(SITE_TITLE)
  })

  it('includes Meta domain verification meta tag', () => {
    expect(metadata.other).toEqual({
      'facebook-domain-verification': 'yy2ha6g9oowjl43f3cmtgdnz6lsin7',
    })
  })
})

