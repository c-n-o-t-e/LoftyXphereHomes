import { render, screen, fireEvent, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DatePickerCalendar } from '@/components/DatePickerCalendar'
import { YourReservationCard } from '@/components/YourReservationCard'

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

function isoRange(startIso: string, endIsoInclusive: string): string[] {
  const [sy, sm, sd] = startIso.split('-').map(Number)
  const [ey, em, ed] = endIsoInclusive.split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  const out: string[] = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    out.push(`${y}-${m}-${day}`)
  }
  return out
}

describe('DatePickerCalendar month snapping', () => {
  it('opens on the next month when the current month is fully disabled', async () => {
    // April 2026 is fully blocked, May 1 is the first selectable date
    render(
      <DatePickerCalendar
        open
        onClose={() => {}}
        value=""
        minDate="2026-04-01"
        disabledDates={isoRange('2026-04-01', '2026-04-30')}
        onSelect={() => {}}
        onClear={() => {}}
      />
    )

    expect(await screen.findByText('May 2026')).toBeInTheDocument()
  })

  it('keeps the selected value month visible when value exists', () => {
    render(
      <DatePickerCalendar
        open
        onClose={() => {}}
        value="2026-04-10"
        minDate="2026-04-01"
        disabledDates={[]}
        onSelect={() => {}}
        onClear={() => {}}
      />
    )

    expect(screen.getByText('April 2026')).toBeInTheDocument()
  })
})

describe('YourReservationCard checkout month rollover', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2026, 3, 15)) // Apr 15, 2026
  })

  afterEach(() => {
    jest.useRealTimers()
    // restore possible fetch mock changes per-test
    jest.restoreAllMocks()
  })

  it('opens checkout on May after selecting April 30 check-in', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ blockedDates: [], bookingRanges: [] }),
    } as unknown as Response)

    renderWithQueryClient(
      <YourReservationCard
        apartmentId="apt_1"
        pricePerNight={100000}
        capacity={2}
        beds={1}
        baths={1}
        bookingUrl={null}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /check-in/i }))
    expect(screen.getByText('April 2026')).toBeInTheDocument()

    // Select April 30 as check-in
    const thirtiethButtons = screen.getAllByRole('button', { name: '30' })
    const enabledThirtieth = thirtiethButtons.find((b) => !b.hasAttribute('disabled'))
    expect(enabledThirtieth).toBeTruthy()
    fireEvent.click(enabledThirtieth!)

    // Auto-opens checkout after 150ms
    await act(async () => {
      jest.advanceTimersByTime(200)
    })

    expect(await screen.findByText('May 2026')).toBeInTheDocument()
  })
})

