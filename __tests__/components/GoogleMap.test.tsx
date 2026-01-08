import { render, screen } from '@testing-library/react'
import GoogleMap from '@/components/GoogleMap'

describe('GoogleMap', () => {
  it('renders the map iframe', () => {
    render(<GoogleMap />)
    const iframe = screen.getByTitle(/LoftyXphereHomes Location/i)
    expect(iframe).toBeInTheDocument()
    // Check that iframe has src attribute with the address
    const src = iframe.getAttribute('src')
    expect(src).toBeTruthy()
    expect(src).toContain('430')
  })

  it('displays the address', () => {
    render(<GoogleMap />)
    expect(screen.getByText(/430 Magnus Abe Street, Wuye, Abuja/i)).toBeInTheDocument()
  })

  it('renders location heading', () => {
    render(<GoogleMap />)
    expect(screen.getByText('Our Location')).toBeInTheDocument()
  })

  it('renders link to open in Google Maps', () => {
    render(<GoogleMap />)
    const link = screen.getByText('Open in Google Maps')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('target', '_blank')
  })
})

