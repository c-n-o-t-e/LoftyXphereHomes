import { render, screen } from '@testing-library/react'
import LocationHighlight from '@/components/LocationHighlight'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('LocationHighlight', () => {
  it('renders the section heading', () => {
    render(<LocationHighlight />)
    expect(screen.getByText('Prime Locations')).toBeInTheDocument()
  })

  it('renders both cities', () => {
    render(<LocationHighlight />)
    expect(screen.getByText('Lagos')).toBeInTheDocument()
    expect(screen.getByText('Abuja')).toBeInTheDocument()
  })

  it('renders area information for each city', () => {
    render(<LocationHighlight />)
    expect(screen.getByText(/Victoria Island, Lekki, Ikoyi/i)).toBeInTheDocument()
    expect(screen.getByText(/Wuse 2, Maitama, Garki/i)).toBeInTheDocument()
  })

  it('renders apartment count for each city', () => {
    render(<LocationHighlight />)
    expect(screen.getAllByText(/3 premium apartments available/i)).toHaveLength(2)
  })

  it('renders view apartment buttons', () => {
    render(<LocationHighlight />)
    expect(screen.getByText('View Lagos Apartments')).toBeInTheDocument()
    expect(screen.getByText('View Abuja Apartments')).toBeInTheDocument()
  })
})

