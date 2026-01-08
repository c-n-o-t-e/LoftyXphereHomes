// Layout is a server component that exports metadata
// We test the metadata export separately
import RootLayout, { metadata } from '@/app/layout'

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
    expect(metadata.title?.template).toContain('LoftyXphereHomes')
  })
})

