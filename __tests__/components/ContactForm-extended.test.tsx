import { render, screen } from '@testing-library/react'
import { ContactForm } from '@/components/ContactForm'

describe('ContactForm - Extended Coverage', () => {
  it('renders all form fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/inquiry category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<ContactForm />)
    expect(screen.getByText('Send Message')).toBeInTheDocument()
  })

  it('handles all inquiry categories', () => {
    render(<ContactForm />)
    const categorySelect = screen.getByLabelText(/inquiry category/i)
    expect(categorySelect).toBeInTheDocument()
  })
})

