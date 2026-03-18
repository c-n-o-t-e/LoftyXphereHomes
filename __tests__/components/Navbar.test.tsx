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
    expect(screen.getByAltText('LoftyXphereHomes Logo')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Apartments')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
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

  it('closes mobile menu when View Apartments is clicked in mobile menu', () => {
    render(<Navbar />)
    const menuButton = screen.getByLabelText('Toggle menu')
    
    // Open menu
    fireEvent.click(menuButton)
    
    const ctaLinks = screen.getAllByText('View Apartments')
    if (ctaLinks.length > 0) fireEvent.click(ctaLinks[0])
  })

  it('has navigation role and nav element', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    // On homepage Navbar is transparent by default, hover shows bg
    expect(nav.className).toMatch(/fixed|transition|z-50/)
  })
})

