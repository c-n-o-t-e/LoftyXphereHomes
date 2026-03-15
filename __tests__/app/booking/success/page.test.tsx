import { render, screen } from '@testing-library/react'
import * as paystack from '@/lib/paystack'
import BookingSuccessPage from '@/app/booking/success/page'

jest.mock('@/lib/paystack', () => ({
  verifyTransaction: jest.fn(),
}))

jest.mock('@/lib/booking', () => ({
  upsertBookingFromPaystack: jest.fn(),
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

async function renderSuccessPage(searchParams: { reference?: string } = {}) {
  const searchParamsPromise = Promise.resolve(searchParams)
  const element = await BookingSuccessPage({ searchParams: searchParamsPromise })
  return render(element)
}

describe('Booking Success Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders payment successful heading', async () => {
    await renderSuccessPage()
    expect(screen.getByRole('heading', { name: /payment successful/i })).toBeInTheDocument()
  })

  it('renders thank you and confirmation message', async () => {
    await renderSuccessPage()
    expect(screen.getByText(/thank you for your booking/i)).toBeInTheDocument()
    expect(screen.getByText(/your stay is confirmed/i)).toBeInTheDocument()
  })

  it('renders login prompt for booking details', async () => {
    await renderSuccessPage()
    expect(screen.getByText(/log in with the email you used for this reservation/i)).toBeInTheDocument()
  })

  it('renders Access My Dashboard link', async () => {
    await renderSuccessPage()
    const link = screen.getByRole('link', { name: /access my dashboard/i })
    expect(link).toHaveAttribute('href', '/login?redirect=/my-bookings')
  })

  it('renders Browse more apartments link', async () => {
    await renderSuccessPage()
    const link = screen.getByRole('link', { name: /browse more apartments/i })
    expect(link).toHaveAttribute('href', '/apartments')
  })

  it('calls verifyTransaction when reference is provided', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    verifyTransaction.mockResolvedValueOnce({ status: true, data: { status: 'success' } })
    await renderSuccessPage({ reference: 'ref_123' })
    expect(verifyTransaction).toHaveBeenCalledWith('ref_123')
  })

  it('does not call verifyTransaction when reference is empty', async () => {
    const verifyTransaction = jest.mocked(paystack.verifyTransaction)
    await renderSuccessPage({})
    await renderSuccessPage({ reference: '' })
    expect(verifyTransaction).not.toHaveBeenCalled()
  })
})
