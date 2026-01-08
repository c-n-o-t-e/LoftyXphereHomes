import { render, screen } from '@testing-library/react'
import PrivacyPage from '@/app/privacy/page'

describe('Privacy Page', () => {
  it('renders the page heading', () => {
    render(<PrivacyPage />)
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('renders privacy sections', () => {
    render(<PrivacyPage />)
    expect(screen.getByText('1. Information We Collect')).toBeInTheDocument()
    expect(screen.getByText('2. How We Use Your Information')).toBeInTheDocument()
    expect(screen.getByText('3. Information Sharing')).toBeInTheDocument()
    expect(screen.getByText('4. Data Security')).toBeInTheDocument()
    expect(screen.getByText('5. Your Rights')).toBeInTheDocument()
    expect(screen.getByText('6. Contact Us')).toBeInTheDocument()
  })
})

