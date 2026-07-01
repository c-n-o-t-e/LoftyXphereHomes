import { screen, waitFor } from '@testing-library/react'
import ApartmentDetailPage from '@/app/apartments/[id]/page'
import { renderWithQueryClient } from '@/lib/testing/render-with-query-client'
import { notFound } from 'next/navigation'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

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

describe('Apartment Detail Page - Extended Coverage', () => {
  const waitForReservationCard = () =>
    waitFor(() => expect(screen.getByText('Book Apartment')).toBeInTheDocument())

  it('renders all apartment details', async () => {
    const params = Promise.resolve({ id: 'skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/Skyline Suite/i)).toBeInTheDocument()
    expect(screen.getByText(/Wuye, Abuja/i)).toBeInTheDocument()
  })

  it('renders apartment amenities', async () => {
    const params = Promise.resolve({ id: 'skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText('In your suite')).toBeInTheDocument()
    expect(screen.getByText(/Starlink Wi-Fi/i)).toBeInTheDocument()
  })

  it('renders house rules', async () => {
    const params = Promise.resolve({ id: 'skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText('House Rules')).toBeInTheDocument()
    expect(screen.getByText(/No smoking indoors/i)).toBeInTheDocument()
  })

  it('renders check-in and check-out times', async () => {
    const params = Promise.resolve({ id: 'skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/Check-in:/i)).toBeInTheDocument()
    expect(screen.getByText(/Check-out:/i)).toBeInTheDocument()
  })

  it('renders booking card with price', async () => {
    const params = Promise.resolve({ id: 'skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/₦200,000/i)).toBeInTheDocument()
    // Price format may vary, just check that price is displayed
    expect(screen.getByText(/₦/i)).toBeInTheDocument()
  })

  it('renders apartment images', async () => {
    const params = Promise.resolve({ id: 'skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('calls notFound when apartment does not exist', async () => {
    const params = Promise.resolve({ id: 'non-existent-apartment' })
    try {
      renderWithQueryClient(await ApartmentDetailPage({ params }))
    } catch (e) {
      // Expected
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('renders Book Apartment button', async () => {
    const params = Promise.resolve({ id: 'skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText('Book Apartment')).toBeInTheDocument()
  })

  it('shows placeholder when apartment has no uploaded images', async () => {
    const { getApartmentImageSets } = jest.requireMock('@/lib/data/getApartmentImages')
    getApartmentImageSets.mockResolvedValueOnce([])

    const params = Promise.resolve({ id: 'skyline-suite' })
    renderWithQueryClient(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByLabelText('Photo coming soon')).toBeInTheDocument()
  })
})

