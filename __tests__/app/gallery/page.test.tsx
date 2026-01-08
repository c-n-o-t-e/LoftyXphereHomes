import { render, screen } from '@testing-library/react'
import GalleryPage from '@/app/gallery/page'

describe('Gallery Page', () => {
  it('renders the page heading', () => {
    render(<GalleryPage />)
    expect(screen.getByText('Gallery')).toBeInTheDocument()
  })

  it('renders the page description', () => {
    render(<GalleryPage />)
    expect(screen.getByText(/Explore our premium apartments/i)).toBeInTheDocument()
  })

  it('renders gallery images', () => {
    render(<GalleryPage />)
    // Should render at least one image
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })
})

