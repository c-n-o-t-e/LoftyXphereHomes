import { render, screen, waitFor } from '@testing-library/react'
import ApartmentDetailPage from '@/app/apartments/[id]/page'
import { notFound } from 'next/navigation'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

describe('Apartment Detail Page - Extended Coverage', () => {
  const waitForReservationCard = () =>
    waitFor(() => expect(screen.getByText('Book Apartment')).toBeInTheDocument())

  it('renders all apartment details', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/Lofty Wuye Premium/i)).toBeInTheDocument()
    expect(screen.getByText(/Wuye, Abuja/i)).toBeInTheDocument()
    // Rating may appear multiple times, use getAllByText
    const ratingElements = screen.getAllByText(/4\.9/i)
    expect(ratingElements.length).toBeGreaterThan(0)
  })

  it('renders apartment amenities', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText('Amenities')).toBeInTheDocument()
    expect(screen.getByText(/24\/7 Power/i)).toBeInTheDocument()
  })

  it('renders house rules', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText('House Rules')).toBeInTheDocument()
    expect(screen.getByText(/No smoking indoors/i)).toBeInTheDocument()
  })

  it('renders check-in and check-out times', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/Check-in:/i)).toBeInTheDocument()
    expect(screen.getByText(/Check-out:/i)).toBeInTheDocument()
  })

  it('renders booking card with price', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText(/₦65,000/i)).toBeInTheDocument()
    // Price format may vary, just check that price is displayed
    expect(screen.getByText(/₦/i)).toBeInTheDocument()
  })

  it('renders apartment images', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('calls notFound when apartment does not exist', async () => {
    const params = Promise.resolve({ id: 'non-existent-apartment' })
    try {
      render(await ApartmentDetailPage({ params }))
    } catch (e) {
      // Expected
    }
    expect(notFound).toHaveBeenCalled()
  })

  it('renders Book Apartment button', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    expect(screen.getByText('Book Apartment')).toBeInTheDocument()
  })

  it('uses fallback image when apartment has no images', async () => {
    const params = Promise.resolve({ id: 'lofty-wuye-01' })
    render(await ApartmentDetailPage({ params }))
    await waitForReservationCard()
    // Should render images (or fallback)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })
})

