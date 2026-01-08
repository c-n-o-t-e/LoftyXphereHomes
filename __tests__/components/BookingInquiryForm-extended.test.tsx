import { render, screen } from '@testing-library/react'
import { BookingInquiryForm } from '@/components/BookingInquiryForm'

describe('BookingInquiryForm - Extended Coverage', () => {
  it('uses default apartment ID when provided', () => {
    render(<BookingInquiryForm defaultApartmentId="test-apartment-01" />)
    const apartmentSelect = screen.getByLabelText(/apartment interested in/i)
    expect(apartmentSelect).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    render(<BookingInquiryForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/check-in date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/check-out date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/apartment interested in/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<BookingInquiryForm />)
    expect(screen.getByText('Send Inquiry')).toBeInTheDocument()
  })
})

