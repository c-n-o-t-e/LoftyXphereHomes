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
    expect(screen.getByText('Lagos & Abuja, Nigeria')).toBeInTheDocument()
  })
})

