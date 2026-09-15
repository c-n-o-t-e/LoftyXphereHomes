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
    expect(screen.getByText('Lofty Xphere Homes')).toBeInTheDocument()
  })

  it('renders footer description', () => {
    render(<Footer />)
    expect(screen.getByText(/luxury serviced apartments/i)).toBeInTheDocument()
  })

  it('renders all quick links', () => {
    render(<Footer />)
    expect(screen.getByText('All Apartments')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    // Footer quick links include All Apartments (not a separate CTA)
    expect(screen.queryByText('View Apartments')).not.toBeInTheDocument()
  })

  it('renders legal links', () => {
    render(<Footer />)
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('renders contact information', () => {
    render(<Footer />)
    expect(screen.getByText('+234 8161122328')).toBeInTheDocument()
    expect(screen.getByText('hello@loftyxpherehomes.com')).toBeInTheDocument()
    expect(screen.getByText(/8 Magnus Abe Street, Wuye, Abuja/i)).toBeInTheDocument()
  })

  it('renders social media links', () => {
    render(<Footer />)
    const facebookLink = screen.getByLabelText(/Lofty Xphere Homes on Facebook/i)
    const instagramLink = screen.getByLabelText(/Lofty Xphere Homes on Instagram/i)
    const twitterLink = screen.getByLabelText(/Lofty Xphere Homes on X/i)
    
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

