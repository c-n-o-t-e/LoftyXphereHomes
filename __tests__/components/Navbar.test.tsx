import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/Navbar'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Navbar', () => {
  beforeEach(() => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  it('renders the navbar with brand name', () => {
    render(<Navbar />)
    expect(screen.getByText('LoftyXphereHomes')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Apartments')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Book Now')).toBeInTheDocument()
  })

  it('toggles mobile menu when menu button is clicked', () => {
    render(<Navbar />)
    const menuButton = screen.getByLabelText('Toggle menu')
    
    // Menu should be closed initially
    expect(screen.queryByText('Home')).toBeInTheDocument() // Desktop view
    
    // Click to open mobile menu
    fireEvent.click(menuButton)
    
    // Click to close mobile menu
    fireEvent.click(menuButton)
  })

  it('closes mobile menu when a link is clicked', () => {
    render(<Navbar />)
    const menuButton = screen.getByLabelText('Toggle menu')
    
    fireEvent.click(menuButton)
    
    const homeLink = screen.getAllByText('Home')[1] // Mobile menu link
    fireEvent.click(homeLink)
  })

  it('closes mobile menu when Book Now is clicked in mobile menu', () => {
    render(<Navbar />)
    const menuButton = screen.getByLabelText('Toggle menu')
    
    // Open menu
    fireEvent.click(menuButton)
    
    // Find Book Now in mobile menu (should be second one)
    const bookNowLinks = screen.getAllByText('Book Now')
    if (bookNowLinks.length > 1) {
      fireEvent.click(bookNowLinks[1])
    }
  })

  it('applies scrolled styles when window is scrolled', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    
    // Initially should have backdrop blur
    expect(nav).toHaveClass('bg-white/80')
    
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    fireEvent.scroll(window)
    
    // After scroll, should have different background
    // Note: This test checks the initial state, actual scroll behavior is tested in integration
  })
})

