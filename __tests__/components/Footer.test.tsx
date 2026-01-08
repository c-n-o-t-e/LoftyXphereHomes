import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Footer', () => {
  it('renders the footer with brand name', () => {
    render(<Footer />)
    expect(screen.getByText('LoftyXphereHomes')).toBeInTheDocument()
  })

  it('renders footer description', () => {
    render(<Footer />)
    expect(screen.getByText(/Premium shortlet apartment rentals/i)).toBeInTheDocument()
  })

  it('renders all quick links', () => {
    render(<Footer />)
    expect(screen.getByText('All Apartments')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Book Now')).toBeInTheDocument()
  })

  it('renders legal links', () => {
    render(<Footer />)
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('renders contact information', () => {
    render(<Footer />)
    expect(screen.getByText('+234 800 000 0000')).toBeInTheDocument()
    expect(screen.getByText('info@loftyxpherehomes.com')).toBeInTheDocument()
    expect(screen.getByText('Lagos & Abuja, Nigeria')).toBeInTheDocument()
  })

  it('renders social media links', () => {
    render(<Footer />)
    const facebookLink = screen.getByLabelText('Facebook')
    const instagramLink = screen.getByLabelText('Instagram')
    const twitterLink = screen.getByLabelText('Twitter')
    
    expect(facebookLink).toBeInTheDocument()
    expect(instagramLink).toBeInTheDocument()
    expect(twitterLink).toBeInTheDocument()
  })

  it('renders copyright with current year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument()
  })
})

