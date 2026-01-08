import { render, screen } from '@testing-library/react'
import ApartmentsPage from '@/app/apartments/page'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Apartments Page', () => {
  it('renders the page heading', () => {
    render(<ApartmentsPage />)
    expect(screen.getByText('Our Apartments')).toBeInTheDocument()
  })

  it('renders the page description', () => {
    render(<ApartmentsPage />)
    expect(screen.getByText(/Discover our complete collection/i)).toBeInTheDocument()
  })

  it('renders apartment cards', () => {
    render(<ApartmentsPage />)
    // Should render at least one apartment card
    const apartmentCards = screen.getAllByText(/Lofty/i)
    expect(apartmentCards.length).toBeGreaterThan(0)
  })
})

