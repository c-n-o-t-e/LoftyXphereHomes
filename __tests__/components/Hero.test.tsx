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
  it('renders the hero section with main content immediately', () => {
    render(<Hero heroVideo={mockHeroVideo} />)
    expect(screen.getByText('Live Lofty.')).toBeVisible()
    expect(screen.getByText('Stay Different.')).toBeVisible()
  })

  it('renders video visible immediately with eager preload', () => {
    const { container } = render(<Hero heroVideo={mockHeroVideo} />)
    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('preload', 'auto')
    expect(video).not.toHaveClass('opacity-0')

    const sources = video?.querySelectorAll('source')
    expect(sources?.length).toBe(2)
    expect(sources?.[0]?.getAttribute('src')).toBe(mockHeroVideo.mobileMp4Url)
    expect(sources?.[1]?.getAttribute('src')).toBe(mockHeroVideo.desktopMp4Url)
  })

  it('does not render a separate poster image layer', () => {
    const { container } = render(<Hero heroVideo={mockHeroVideo} />)
    expect(container.querySelector('img')).not.toBeInTheDocument()
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
