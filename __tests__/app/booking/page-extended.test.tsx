import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BookingPage from '@/app/booking/page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: jest.fn(() => new URLSearchParams('?apartment=lofty-abuja-01')),
  usePathname: () => '/booking',
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Booking Page - Extended Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders booking page title', async () => {
    render(<BookingPage />)
    await screen.findByText('Book Your Stay')
    expect(screen.getByText('Book Your Stay')).toBeInTheDocument()
  })

  it('renders booking options', async () => {
    render(<BookingPage />)
    await screen.findByText('Book Your Stay')
    expect(screen.getByText('Book Now')).toBeInTheDocument()
    expect(screen.getByText('Send Inquiry Instead')).toBeInTheDocument()
  })

  it('renders booking description', async () => {
    render(<BookingPage />)
    await screen.findByText('Book Your Stay')
    expect(screen.getByText(/Reserve your perfect shortlet apartment/i)).toBeInTheDocument()
  })

  it('handles booking click with apartment bookingUrl', async () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation()
    render(<BookingPage />)
    
    await screen.findByText('Book Now')
    const bookButton = screen.getByText('Book Now')
    fireEvent.click(bookButton)
    
    await waitFor(() => {
      expect(windowOpenSpy).toHaveBeenCalled()
    }, { timeout: 1000 })
    
    windowOpenSpy.mockRestore()
  })

  it('toggles to inquiry form', async () => {
    render(<BookingPage />)
    await screen.findByText('Send Inquiry Instead')
    
    const inquiryButton = screen.getByText('Send Inquiry Instead')
    fireEvent.click(inquiryButton)
    
    // The button text includes an arrow character, use a more flexible matcher
    await waitFor(() => {
      expect(screen.getByText(/Back to Booking Options/i)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('toggles back from inquiry form', async () => {
    render(<BookingPage />)
    await screen.findByText('Send Inquiry Instead')
    
    // Go to form
    fireEvent.click(screen.getByText('Send Inquiry Instead'))
    await waitFor(() => {
      expect(screen.getByText(/Back to Booking Options/i)).toBeInTheDocument()
    })
    
    // Go back - use getByText with regex to handle the arrow character
    const backButton = screen.getByText(/Back to Booking Options/i)
    fireEvent.click(backButton)
    await waitFor(() => {
      expect(screen.getByText('Book Now')).toBeInTheDocument()
    })
  })

  it('displays selected apartment when apartment param is provided', async () => {
    render(<BookingPage />)
    await screen.findByText('Book Your Stay')
    
    await waitFor(() => {
      expect(screen.getByText(/Selected Apartment:/i)).toBeInTheDocument()
      expect(screen.getByText(/Lofty Abuja Suite/i)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('handles booking click without apartment bookingUrl', async () => {
    jest.spyOn(require('next/navigation'), 'useSearchParams').mockReturnValue(
      new URLSearchParams('?apartment=lofty-lagos-01')
    )
    
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation()
    render(<BookingPage />)
    
    await screen.findByText('Book Now')
    const bookButton = screen.getByText('Book Now')
    fireEvent.click(bookButton)
    
    await waitFor(() => {
      expect(windowOpenSpy).toHaveBeenCalled()
    }, { timeout: 1000 })
    
    windowOpenSpy.mockRestore()
  })
})

