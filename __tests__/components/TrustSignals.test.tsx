import { render, screen } from '@testing-library/react'
import TrustSignals from '@/components/TrustSignals'

describe('TrustSignals', () => {
  it('renders the section heading', () => {
    render(<TrustSignals />)
    expect(screen.getByText('Why Choose LoftyXphereHomes?')).toBeInTheDocument()
  })

  it('renders all trust signal items', () => {
    render(<TrustSignals />)
    expect(screen.getByText('Secure & Safe')).toBeInTheDocument()
    expect(screen.getByText('Premium Clean')).toBeInTheDocument()
    expect(screen.getByText('High-Speed Wi-Fi')).toBeInTheDocument()
    expect(screen.getByText('24/7 Support')).toBeInTheDocument()
    expect(screen.getByText('Rated 4.8+')).toBeInTheDocument()
  })

  it('renders descriptions for each trust signal', () => {
    render(<TrustSignals />)
    expect(screen.getByText(/24\/7 security personnel/i)).toBeInTheDocument()
    expect(screen.getByText(/Immaculate spaces/i)).toBeInTheDocument()
    expect(screen.getByText(/Reliable internet/i)).toBeInTheDocument()
    expect(screen.getByText(/Always available/i)).toBeInTheDocument()
    expect(screen.getByText(/Consistently excellent reviews/i)).toBeInTheDocument()
  })
})

