import { render, screen } from '@testing-library/react'
import AmenitiesSection from '@/components/AmenitiesSection'

describe('AmenitiesSection', () => {
  it('renders the section heading', () => {
    render(<AmenitiesSection />)
    expect(screen.getByText('Premium Amenities')).toBeInTheDocument()
  })

  it('renders the section description', () => {
    render(<AmenitiesSection />)
    expect(screen.getByText(/Every detail designed for your comfort/i)).toBeInTheDocument()
  })

  it('renders all standard amenities', () => {
    render(<AmenitiesSection />)
    expect(screen.getByText('24/7 Power')).toBeInTheDocument()
    expect(screen.getByText('High-speed Wi-Fi')).toBeInTheDocument()
    expect(screen.getByText('Air Conditioning')).toBeInTheDocument()
    expect(screen.getByText('Fully equipped kitchen')).toBeInTheDocument()
    expect(screen.getByText('Secure parking')).toBeInTheDocument()
    expect(screen.getByText('Workspace desk')).toBeInTheDocument()
    expect(screen.getByText('Netflix/YouTube enabled TV')).toBeInTheDocument()
    expect(screen.getByText('Security personnel')).toBeInTheDocument()
    expect(screen.getByText('Fresh towels & toiletries')).toBeInTheDocument()
  })
})

