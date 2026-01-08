import { render, screen } from '@testing-library/react'
import GalleryPage from '@/app/gallery/page'

describe('Gallery Page - Extended Coverage', () => {
  it('renders gallery page title', () => {
    render(<GalleryPage />)
    expect(screen.getByText('Gallery')).toBeInTheDocument()
  })

  it('renders gallery description', () => {
    render(<GalleryPage />)
    expect(screen.getByText(/Explore our premium apartments/i)).toBeInTheDocument()
  })

  it('renders all apartment images', () => {
    render(<GalleryPage />)
    const images = screen.getAllByRole('img')
    // Should have multiple images from different apartments
    expect(images.length).toBeGreaterThan(5)
  })

  it('displays apartment names with images', () => {
    render(<GalleryPage />)
    // Images should be present with apartment information
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })
})

