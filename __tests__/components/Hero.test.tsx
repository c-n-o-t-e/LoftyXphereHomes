import { render, screen } from '@testing-library/react'
import Hero from '@/components/Hero'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock('@/components/HeroSearchBar', () => {
  return function MockHeroSearchBar() {
    return <div data-testid="hero-search-bar">HeroSearchBar</div>
  }
})

const mockHeroVideo = {
  id: 'hero-1',
  mobileMp4Url: 'https://example.supabase.co/mobile.mp4',
  desktopMp4Url: 'https://example.supabase.co/desktop.mp4',
  posterUrl: 'https://example.supabase.co/poster.webp',
  updatedAt: new Date().toISOString(),
}

describe('Hero', () => {
  it('renders the hero section with main content', () => {
    render(<Hero heroVideo={mockHeroVideo} />)
    expect(screen.getByText('Live Lofty.')).toBeInTheDocument()
    expect(screen.getByText('Stay Different.')).toBeInTheDocument()
  })

  it('renders video with poster when hero video is configured', () => {
    const { container } = render(<Hero heroVideo={mockHeroVideo} />)
    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('poster', mockHeroVideo.posterUrl)
    expect(video?.querySelector('source')?.getAttribute('src')).toBe(
      mockHeroVideo.desktopMp4Url,
    )
  })

  it('does not show a dark fallback backdrop when no hero video is configured', () => {
    const { container } = render(<Hero />)
    expect(container.querySelector('video')).toBeNull()
    expect(container.querySelector('.from-stone-900')).toBeNull()
  })

  it('does not show a blocking loading spinner', () => {
    render(<Hero heroVideo={mockHeroVideo} />)
    expect(screen.queryByLabelText('Loading hero video')).not.toBeInTheDocument()
  })

  it('renders the HeroSearchBar component', () => {
    render(<Hero heroVideo={mockHeroVideo} />)
    expect(screen.getByTestId('hero-search-bar')).toBeInTheDocument()
  })
})
