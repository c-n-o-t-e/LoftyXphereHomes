import { render, screen } from '@testing-library/react'
import TermsPage from '@/app/terms/page'

describe('Terms Page', () => {
  it('renders the page heading', () => {
    render(<TermsPage />)
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument()
  })

  it('renders terms sections', () => {
    render(<TermsPage />)
    expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument()
    expect(screen.getByText('2. Booking and Payment')).toBeInTheDocument()
    expect(screen.getByText('3. Cancellation Policy')).toBeInTheDocument()
    expect(screen.getByText('4. Guest Responsibilities')).toBeInTheDocument()
    expect(screen.getByText('5. Liability')).toBeInTheDocument()
    expect(screen.getByText('6. Contact Information')).toBeInTheDocument()
  })
})

