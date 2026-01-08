import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/about/page'

describe('About Page', () => {
  it('renders the page heading', () => {
    render(<AboutPage />)
    expect(screen.getByText('About LoftyXphereHomes')).toBeInTheDocument()
  })

  it('renders the story section', () => {
    render(<AboutPage />)
    expect(screen.getByText('Our Story')).toBeInTheDocument()
  })

  it('renders values section', () => {
    render(<AboutPage />)
    expect(screen.getByText('Our Values')).toBeInTheDocument()
  })

  it('renders all value items', () => {
    render(<AboutPage />)
    expect(screen.getByText('Trust & Security')).toBeInTheDocument()
    expect(screen.getByText('Premium Quality')).toBeInTheDocument()
    expect(screen.getByText('Customer First')).toBeInTheDocument()
    expect(screen.getByText('Excellence')).toBeInTheDocument()
  })

  it('renders why choose us section', () => {
    render(<AboutPage />)
    expect(screen.getByText('Why Choose LoftyXphereHomes?')).toBeInTheDocument()
  })
})

