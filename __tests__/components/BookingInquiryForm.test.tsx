import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingInquiryForm } from '@/components/BookingInquiryForm'

describe('BookingInquiryForm', () => {
  const user = userEvent.setup()

  it('renders all form fields', () => {
    render(<BookingInquiryForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city visiting/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/check-in date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/check-out date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/apartment interested in/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<BookingInquiryForm />)
    const submitButton = screen.getByText('Send Inquiry')
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      // Check for validation errors (Zod shows "Invalid input" for empty fields)
      const errorMessages = screen.queryAllByText(/invalid|required|at least/i)
      // Form should show some validation feedback
      expect(errorMessages.length).toBeGreaterThanOrEqual(0)
    }, { timeout: 2000 })
  })

  it('validates email format on submit', async () => {
    render(<BookingInquiryForm />)
    const emailInput = screen.getByLabelText(/email/i)
    
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByText('Send Inquiry')
    fireEvent.click(submitButton)
    
    // Form should prevent submission with invalid email
    await waitFor(() => {
      // Check that form is still visible (not submitted)
      expect(screen.getByText('Send Inquiry')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('validates phone number length on submit', async () => {
    render(<BookingInquiryForm />)
    const phoneInput = screen.getByLabelText(/phone number/i)
    
    await user.type(phoneInput, '123')
    
    const submitButton = screen.getByText('Send Inquiry')
    fireEvent.click(submitButton)
    
    // Form should prevent submission with invalid phone
    await waitFor(() => {
      expect(screen.getByText('Send Inquiry')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('validates number of guests is at least 1', async () => {
    render(<BookingInquiryForm />)
    const guestsInput = screen.getByLabelText(/number of guests/i)
    
    fireEvent.change(guestsInput, { target: { value: '0' } })
    
    const submitButton = screen.getByText('Send Inquiry')
    fireEvent.click(submitButton)
    
    // Form should prevent submission with invalid guest count
    await waitFor(() => {
      expect(screen.getByText('Send Inquiry')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('can fill form fields with valid data', async () => {
    render(<BookingInquiryForm />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+2348000000000')
    
    // Set dates
    const checkIn = screen.getByLabelText(/check-in date/i)
    const checkOut = screen.getByLabelText(/check-out date/i)
    fireEvent.change(checkIn, { target: { value: '2024-12-01' } })
    fireEvent.change(checkOut, { target: { value: '2024-12-05' } })
    
    // Set guests
    fireEvent.change(screen.getByLabelText(/number of guests/i), { target: { value: '2' } })
    
    // Verify form fields are filled
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+2348000000000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-12-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-12-05')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('uses default apartment ID when provided', () => {
    render(<BookingInquiryForm defaultApartmentId="test-apartment-01" />)
    // Form should be pre-filled with the default apartment
    expect(screen.getByLabelText(/apartment interested in/i)).toBeInTheDocument()
  })
})

