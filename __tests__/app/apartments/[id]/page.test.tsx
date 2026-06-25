import { screen, waitFor } from '@testing-library/react'
import ApartmentDetailPage from '@/app/apartments/[id]/page'
import { renderWithQueryClient } from '@/lib/testing/render-with-query-client'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

jest.mock('@/lib/data/getApartmentImages', () => ({
  getApartmentImageSets: jest.fn(async () => [
    {
      thumbnail: 'https://example.com/thumb.jpg',
      medium: 'https://example.com/medium.jpg',
      large: 'https://example.com/large.jpg',
    },
  ]),
}))

describe('Apartment Detail Page', () => {
  const waitForReservationCard = () =>
    waitFor(() => expect(screen.getByText('Book Apartment')).toBeInTheDocument())

  it('renders apartment name when apartment exists', async () => {
    const params = Promise.resolve({ id: 'lofty-skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/The Skyline Suite/i)).toBeInTheDocument()
  })

  it('renders apartment location', async () => {
    const params = Promise.resolve({ id: 'lofty-skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/Wuye, Abuja/i)).toBeInTheDocument()
  })

  it('renders booking button', async () => {
    const params = Promise.resolve({ id: 'lofty-skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText('Book Apartment')).toBeInTheDocument()
  })
})

