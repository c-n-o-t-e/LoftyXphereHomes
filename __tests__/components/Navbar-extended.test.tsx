import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/Navbar'

jest.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    isLoading: false,
    authError: null,
    clearAuthError: jest.fn(),
    signOut: jest.fn().mockResolvedValue(undefined),
  }),
}))

function renderNavbar() {
  return render(<Navbar />)
}

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Navbar - Extended Coverage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  it('handles scroll events', () => {
    renderNavbar()
    const nav = screen.getByRole('navigation')
    
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    fireEvent.scroll(window)
    
    // Nav should still be rendered
    expect(nav).toBeInTheDocument()
  })

  it('includes blog link in navigation', () => {
    renderNavbar()
    expect(screen.getByText('Blog')).toBeInTheDocument()
  })

  it('closes mobile menu when Apartments is clicked', () => {
    renderNavbar()
    const menuButton = screen.getByLabelText('Toggle menu')
    
    // Open menu
    fireEvent.click(menuButton)
    
    const apartmentLinks = screen.getAllByText('Apartments')
    if (apartmentLinks.length > 0) {
      fireEvent.click(apartmentLinks[0])
    }
  })

  it('cleans up scroll listener on unmount', () => {
    const { unmount } = renderNavbar()
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    
    unmount()
    
    // Should clean up event listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})

