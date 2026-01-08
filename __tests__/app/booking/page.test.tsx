import { render, screen } from '@testing-library/react'
import BookingPage from '@/app/booking/page'

// Mock useSearchParams with Suspense
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: () => '/booking',
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Booking Page', () => {
  it('renders the page heading', async () => {
    render(<BookingPage />)
    // Wait for Suspense to resolve
    await screen.findByText('Book Your Stay')
    expect(screen.getByText('Book Your Stay')).toBeInTheDocument()
  })

  it('renders the page description', async () => {
    render(<BookingPage />)
    await screen.findByText(/Reserve your perfect shortlet apartment/i)
    expect(screen.getByText(/Reserve your perfect shortlet apartment/i)).toBeInTheDocument()
  })

  it('renders booking CTA button', async () => {
    render(<BookingPage />)
    await screen.findByText('Book Now')
    expect(screen.getByText('Book Now')).toBeInTheDocument()
  })

  it('renders inquiry form option', async () => {
    render(<BookingPage />)
    await screen.findByText('Send Inquiry Instead')
    expect(screen.getByText('Send Inquiry Instead')).toBeInTheDocument()
  })
})

