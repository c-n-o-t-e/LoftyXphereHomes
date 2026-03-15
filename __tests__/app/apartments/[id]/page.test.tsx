import { render, screen, waitFor } from '@testing-library/react'
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
  const waitForReservationCard = () =>
    waitFor(() => expect(screen.getByText('Book Apartment')).toBeInTheDocument())

  it('renders apartment name when apartment exists', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/Lofty Wuye Premium/i)).toBeInTheDocument()
  })

  it('renders apartment location', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/Wuye, Abuja/i)).toBeInTheDocument()
  })

  it('renders apartment rating', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getAllByText(/4\.9/i).length).toBeGreaterThan(0)
  })

  it('renders booking button', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText('Book Apartment')).toBeInTheDocument()
  })
})

