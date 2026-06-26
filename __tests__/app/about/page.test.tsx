import { render, screen } from '@testing-library/react'
import { AboutPageContent } from '@/components/AboutPageContent'

const emptyImages = { story: null, whyChooseUs: null }

describe('About Page', () => {
  it('renders the page heading', () => {
    render(<AboutPageContent images={emptyImages} />)
    expect(screen.getByText('About LoftyXphereHomes')).toBeInTheDocument()
  })

  it('renders the story section', () => {
    render(<AboutPageContent images={emptyImages} />)
    expect(screen.getByText('Our Story')).toBeInTheDocument()
  })

  it('renders values section', () => {
    render(<AboutPageContent images={emptyImages} />)
    expect(screen.getByText('Our Core Values')).toBeInTheDocument()
  })

  it('renders all value items', () => {
    render(<AboutPageContent images={emptyImages} />)
    expect(screen.getByText('Trust & Security')).toBeInTheDocument()
    expect(screen.getByText('Premium Quality')).toBeInTheDocument()
    expect(screen.getByText('Customer First')).toBeInTheDocument()
    expect(screen.getByText('Excellence')).toBeInTheDocument()
  })

  it('renders why choose us section', () => {
    render(<AboutPageContent images={emptyImages} />)
    expect(screen.getByText('Why Choose LoftyXphereHomes?')).toBeInTheDocument()
  })
})

