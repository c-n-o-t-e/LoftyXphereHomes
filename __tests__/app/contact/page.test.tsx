import { render, screen } from '@testing-library/react'
import ContactPage from '@/app/contact/page'

describe('Contact Page', () => {
  it('renders the page heading', () => {
    render(<ContactPage />)
    expect(screen.getByText('Get In Touch')).toBeInTheDocument()
  })

  it('renders contact information cards', () => {
    render(<ContactPage />)
    expect(screen.getByText('Phone')).toBeInTheDocument()
    // Use getAllByText since Email appears multiple times (label and card)
    expect(screen.getAllByText('Email').length).toBeGreaterThan(0)
    expect(screen.getByText('Location')).toBeInTheDocument()
    // Address appears in both contact card and map component
    expect(screen.getAllByText(/430 Magnus Abe Street/i).length).toBeGreaterThan(0)
  })

  it('renders contact form', () => {
    render(<ContactPage />)
    expect(screen.getByText('Send us a Message')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
  })

  it('displays contact details', () => {
    render(<ContactPage />)
    expect(screen.getByText('+234 800 000 0000')).toBeInTheDocument()
    expect(screen.getByText('info@loftyxpherehomes.com')).toBeInTheDocument()
    // Address appears multiple times (contact card and map)
    expect(screen.getAllByText(/430 Magnus Abe Street/i).length).toBeGreaterThan(0)
  })

  it('renders Google Map', () => {
    render(<ContactPage />)
    expect(screen.getByText('Find Us')).toBeInTheDocument()
    expect(screen.getByTitle(/LoftyXphereHomes Location/i)).toBeInTheDocument()
  })
})

