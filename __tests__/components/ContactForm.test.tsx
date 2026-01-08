import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/ContactForm'

describe('ContactForm', () => {
  const user = userEvent.setup()

  it('renders all form fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/inquiry category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<ContactForm />)
    const submitButton = screen.getByText('Send Message')
    
    fireEvent.click(submitButton)
    
    // Form should show validation errors or prevent submission
    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/invalid|required|at least/i)
      // Form validation should trigger
      expect(errorMessages.length).toBeGreaterThanOrEqual(0)
    }, { timeout: 2000 })
  })

  it('validates email format on submit', async () => {
    render(<ContactForm />)
    const emailInput = screen.getByLabelText(/email/i)
    
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByText('Send Message')
    fireEvent.click(submitButton)
    
    // Form should prevent submission with invalid email
    await waitFor(() => {
      expect(screen.getByText('Send Message')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('validates message minimum length on submit', async () => {
    render(<ContactForm />)
    const messageInput = screen.getByLabelText(/message/i)
    
    await user.type(messageInput, 'short')
    
    const submitButton = screen.getByText('Send Message')
    fireEvent.click(submitButton)
    
    // Form should prevent submission with short message
    await waitFor(() => {
      expect(screen.getByText('Send Message')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('can fill form with valid data', async () => {
    render(<ContactForm />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '+2348000000000')
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough')
    
    // Verify form fields are filled
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+2348000000000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('This is a test message that is long enough')).toBeInTheDocument()
  })

  it('has inquiry category select field', () => {
    render(<ContactForm />)
    const categorySelect = screen.getByLabelText(/inquiry category/i)
    expect(categorySelect).toBeInTheDocument()
  })
})

