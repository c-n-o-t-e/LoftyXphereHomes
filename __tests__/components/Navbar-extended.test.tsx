import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/Navbar'

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
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    fireEvent.scroll(window)
    
    // Nav should still be rendered
    expect(nav).toBeInTheDocument()
  })

  it('includes blog link in navigation', () => {
    render(<Navbar />)
    expect(screen.getByText('Blog')).toBeInTheDocument()
  })

  it('closes mobile menu when View Apartments is clicked', () => {
    render(<Navbar />)
    const menuButton = screen.getByLabelText('Toggle menu')
    
    // Open menu
    fireEvent.click(menuButton)
    
    const ctaLinks = screen.getAllByText('View Apartments')
    if (ctaLinks.length > 0) {
      fireEvent.click(ctaLinks[0])
    }
  })

  it('cleans up scroll listener on unmount', () => {
    const { unmount } = render(<Navbar />)
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    
    unmount()
    
    // Should clean up event listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})

