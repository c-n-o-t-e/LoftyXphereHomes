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

  it('renders separate mobile and desktop videos for responsive playback', () => {
    const { container } = render(<Hero heroVideo={mockHeroVideo} />)
    const videos = container.querySelectorAll('video')
    expect(videos.length).toBe(2)

    const mobileVideo = videos[0]
    const desktopVideo = videos[1]

    expect(mobileVideo).toHaveClass('md:hidden')
    expect(desktopVideo).toHaveClass('hidden', 'md:block')

    expect(mobileVideo).toHaveAttribute('preload', 'metadata')
    expect(mobileVideo).toHaveAttribute('poster', mockHeroVideo.posterUrl)
    expect(mobileVideo.querySelector('source')?.getAttribute('src')).toBe(
      mockHeroVideo.mobileMp4Url,
    )
    expect(desktopVideo.querySelector('source')?.getAttribute('src')).toBe(
      mockHeroVideo.desktopMp4Url,
    )
  })

  it('renders a single video when only one variant is configured', () => {
    const { container } = render(
      <Hero
        heroVideo={{
          ...mockHeroVideo,
          mobileMp4Url: '',
          desktopMp4Url: mockHeroVideo.desktopMp4Url,
        }}
      />,
    )
    const videos = container.querySelectorAll('video')
    expect(videos.length).toBe(1)
    expect(videos[0].querySelector('source')?.getAttribute('src')).toBe(
      mockHeroVideo.desktopMp4Url,
    )
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
