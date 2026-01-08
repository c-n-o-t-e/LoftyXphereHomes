import { render, screen } from '@testing-library/react'
import ApartmentDetailPage from '@/app/apartments/[id]/page'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

describe('Apartment Detail Page', () => {
  it('renders apartment name when apartment exists', async () => {
    const params = Promise.resolve({ id: 'lofty-abuja-01' })
    render(await ApartmentDetailPage({ params }))
    expect(screen.getByText(/Lofty Abuja Suite/i)).toBeInTheDocument()
  })

  it('renders apartment location', async () => {
    const params = Promise.resolve({ id: 'lofty-abuja-01' })
    render(await ApartmentDetailPage({ params }))
    expect(screen.getByText(/Wuse 2, Abuja/i)).toBeInTheDocument()
  })

  it('renders apartment rating', async () => {
    const params = Promise.resolve({ id: 'lofty-abuja-01' })
    render(await ApartmentDetailPage({ params }))
    // Rating appears multiple times, so use getAllByText
    expect(screen.getAllByText(/4.8/i).length).toBeGreaterThan(0)
  })

  it('renders booking button', async () => {
    const params = Promise.resolve({ id: 'lofty-abuja-01' })
    render(await ApartmentDetailPage({ params }))
    expect(screen.getByText('Book Now')).toBeInTheDocument()
  })
})

