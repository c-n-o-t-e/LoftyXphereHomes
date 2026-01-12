import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import Hero from '@/components/Hero'
import { getFeaturedApartments } from '@/lib/data/apartments'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, priority, ...props }: { src: string; alt: string; fill?: boolean; priority?: boolean; [key: string]: any }) => {
    // Remove fill and priority props to avoid DOM warnings
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...props} />
  },
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(() => ({})),
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.();
      return fn({ location: '', checkIn: '', checkOut: '', guests: 2 });
    },
    setValue: jest.fn(),
    watch: jest.fn(() => ''),
    formState: { errors: {} },
  }),
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => ({}),
}))

jest.mock('zod', () => ({
  z: {
    object: () => ({
      refine: () => ({
        parse: () => ({}),
      }),
    }),
    string: () => ({
      optional: () => ({}),
    }),
    coerce: {
      number: () => ({
        min: () => ({
          max: () => ({
            optional: () => ({}),
          }),
        }),
      }),
    },
  },
}))

jest.mock('@/lib/utils/search', () => ({
  getUniqueCities: jest.fn(() => ['Lagos', 'Abuja']),
  getUniqueAreas: jest.fn(() => ['Victoria Island', 'Wuse 2', 'Lekki']),
  areDatesValid: jest.fn(() => true),
  filterApartments: jest.fn((apts: any[]) => apts),
  calculateNights: jest.fn(() => 0),
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select">{children}</div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children, ...props }: any) => <div data-testid="select-trigger" {...props}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} data-testid="input" />,
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, asChild, ...props }: any) => {
    if (asChild && children) {
      return children;
    }
    return <button onClick={onClick} type={type} {...props}>{children}</button>;
  },
}))

jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Search: () => <div data-testid="search-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Quote: () => <div data-testid="quote-icon" />,
}))

jest.mock('@/lib/data/apartments', () => {
  const mockApartments = [
    {
      id: 'test-1',
      name: 'Test Apartment 1',
      location: { city: 'Lagos', area: 'Victoria Island' },
      images: ['https://example.com/image1.jpg'],
      rating: 4.9,
      reviews: 50,
      capacity: 4,
      beds: 2,
      baths: 2,
      pricePerNight: 50000,
      amenities: [],
      houseRules: [],
      shortDescription: 'Test apartment',
    },
    {
      id: 'test-2',
      name: 'Test Apartment 2',
      location: { city: 'Abuja', area: 'Wuse 2' },
      images: ['https://example.com/image2.jpg'],
      rating: 4.8,
      reviews: 40,
      capacity: 2,
      beds: 1,
      baths: 1,
      pricePerNight: 40000,
      amenities: [],
      houseRules: [],
      shortDescription: 'Test apartment',
    },
    {
      id: 'test-3',
      name: 'Test Apartment 3',
      location: { city: 'Lagos', area: 'Lekki' },
      images: ['https://example.com/image3.jpg'],
      rating: 4.7,
      reviews: 30,
      capacity: 6,
      beds: 3,
      baths: 3,
      pricePerNight: 60000,
      amenities: [],
      houseRules: [],
      shortDescription: 'Test apartment',
    },
  ];
  
  return {
    apartments: mockApartments,
    getFeaturedApartments: jest.fn(() => mockApartments),
    getApartmentById: jest.fn((id: string) => mockApartments.find((apt: any) => apt.id === id)),
  };
})

// Mock timers for auto-advance functionality
jest.useFakeTimers()

describe('Hero', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
  })

  it('renders the hero section with main content', () => {
    render(<Hero />)
    expect(screen.getByText('Premium Shortlet')).toBeInTheDocument()
    expect(screen.getByText('Apartments')).toBeInTheDocument()
  })

  it('renders the main heading', () => {
    render(<Hero />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Premium Shortlet')
  })

  it('renders the description text', () => {
    render(<Hero />)
    expect(screen.getByText(/Experience luxury, comfort, and exceptional service/i)).toBeInTheDocument()
  })

  it('renders both CTA buttons', () => {
    render(<Hero />)
    expect(screen.getByText('Book Your Stay')).toBeInTheDocument()
    expect(screen.getByText('Explore Apartments')).toBeInTheDocument()
  })

  it('has correct links for CTA buttons', () => {
    render(<Hero />)
    const bookButton = screen.getByText('Book Your Stay').closest('a')
    const exploreButton = screen.getByText('Explore Apartments').closest('a')
    
    expect(bookButton).toHaveAttribute('href', '/booking')
    expect(exploreButton).toHaveAttribute('href', '/apartments')
  })

  it('renders image slideshow with featured apartment images', () => {
    render(<Hero />)
    expect(getFeaturedApartments).toHaveBeenCalledWith(6)
    
    // Check if images are rendered (using first image from featured apartments)
    const images = screen.getAllByAltText(/Hero image/i)
    expect(images.length).toBeGreaterThan(0)
  })

  it('displays the first image initially', () => {
    render(<Hero />)
    const firstImage = screen.getByAltText('Hero image 1')
    expect(firstImage).toBeInTheDocument()
    expect(firstImage).toHaveAttribute('src', expect.stringContaining('image1'))
  })

  it('renders navigation arrows when there are multiple images', () => {
    render(<Hero />)
    const prevButton = screen.getByLabelText('Previous image')
    const nextButton = screen.getByLabelText('Next image')
    
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('navigates to next image when next button is clicked', async () => {
    render(<Hero />)
    
    const nextButton = screen.getByLabelText('Next image')
    
    act(() => {
      fireEvent.click(nextButton)
    })

    await waitFor(() => {
      const secondImage = screen.getByAltText('Hero image 2')
      expect(secondImage).toBeInTheDocument()
    })
  })

  it('navigates to previous image when previous button is clicked', async () => {
    render(<Hero />)
    
    // First go to next image
    const nextButton = screen.getByLabelText('Next image')
    act(() => {
      fireEvent.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByAltText('Hero image 2')).toBeInTheDocument()
    })

    // Then go to previous
    const prevButton = screen.getByLabelText('Previous image')
    act(() => {
      fireEvent.click(prevButton)
    })

    await waitFor(() => {
      expect(screen.getByAltText('Hero image 1')).toBeInTheDocument()
    })
  })

  it('wraps around when navigating past the last image', async () => {
    render(<Hero />)
    
    // Navigate to last image (index 2)
    const nextButton = screen.getByLabelText('Next image')
    
    act(() => {
      fireEvent.click(nextButton) // Image 2
    })
    
    await waitFor(() => {
      expect(screen.getByAltText('Hero image 2')).toBeInTheDocument()
    })

    act(() => {
      fireEvent.click(nextButton) // Image 3
    })
    
    await waitFor(() => {
      expect(screen.getByAltText('Hero image 3')).toBeInTheDocument()
    })

    // Next click should wrap to first image
    act(() => {
      fireEvent.click(nextButton)
    })
    
    await waitFor(() => {
      expect(screen.getByAltText('Hero image 1')).toBeInTheDocument()
    })
  })

  it('wraps around when navigating before the first image', async () => {
    render(<Hero />)
    
    const prevButton = screen.getByLabelText('Previous image')
    
    act(() => {
      fireEvent.click(prevButton)
    })

    // Should wrap to last image (index 2)
    await waitFor(() => {
      const lastImage = screen.getByAltText('Hero image 3')
      expect(lastImage).toBeInTheDocument()
    })
  })

  it('renders slide indicators for each image', () => {
    render(<Hero />)
    
    const indicators = screen.getAllByLabelText(/Go to slide/i)
    expect(indicators.length).toBe(3) // 3 featured apartments
  })

  it('navigates to specific slide when indicator is clicked', async () => {
    render(<Hero />)
    
    const slide3Indicator = screen.getByLabelText('Go to slide 3')
    
    act(() => {
      fireEvent.click(slide3Indicator)
    })

    await waitFor(() => {
      expect(screen.getByAltText('Hero image 3')).toBeInTheDocument()
    })
  })

  it('highlights the active slide indicator', () => {
    render(<Hero />)
    
    const indicators = screen.getAllByLabelText(/Go to slide/i)
    
    // First indicator should be active (wider)
    expect(indicators[0]).toHaveClass('w-12')
    
    // Other indicators should be inactive (narrower)
    expect(indicators[1]).toHaveClass('w-2')
    expect(indicators[2]).toHaveClass('w-2')
  })

  it('auto-advances slideshow after transition duration', async () => {
    render(<Hero />)
    
    // Initially on first image
    expect(screen.getByAltText('Hero image 1')).toBeInTheDocument()
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000) // TRANSITION_DURATION
    })

    await waitFor(() => {
      expect(screen.getByAltText('Hero image 2')).toBeInTheDocument()
    })
  })

  it('stops auto-advancing when user interacts with controls', async () => {
    render(<Hero />)
    
    const nextButton = screen.getByLabelText('Next image')
    
    // User clicks next button
    act(() => {
      fireEvent.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByAltText('Hero image 2')).toBeInTheDocument()
    })

    // Auto-advance should be disabled
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Should still be on image 2 (no auto-advance)
    await waitFor(() => {
      expect(screen.getByAltText('Hero image 2')).toBeInTheDocument()
    }, { timeout: 100 })
  })

  it('renders scroll indicator at the bottom', () => {
    const { container } = render(<Hero />)
    
    // Find scroll indicator by its characteristic classes - check for the mouse indicator structure
    const scrollIndicator = container.querySelector('.w-6.h-10.border-2')
    expect(scrollIndicator).toBeInTheDocument()
  })

  it('applies proper styling to content with gradient overlays', () => {
    render(<Hero />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-white')
    
    const description = screen.getByText(/Experience luxury, comfort, and exceptional service/i)
    // Description has text-white/90 for slight transparency with overlay
    expect(description.className).toContain('text-white')
    expect(description).toHaveClass('drop-shadow-lg')
  })

  it('uses fallback image when no featured apartments available', () => {
    // Mock empty featured apartments
    jest.mocked(getFeaturedApartments).mockReturnValueOnce([])
    
    render(<Hero />)
    
    const fallbackImage = screen.getByAltText('Hero image 1')
    expect(fallbackImage).toBeInTheDocument()
  })

  it('handles apartments with missing images gracefully', () => {
    jest.mocked(getFeaturedApartments).mockReturnValueOnce([
      {
        id: 'test-1',
        name: 'Test Apartment 1',
        images: [], // No images
        rating: 4.9,
        reviews: 50,
      },
    ])
    
    render(<Hero />)
    
    // Should use fallback image
    const fallbackImage = screen.getByAltText('Hero image 1')
    expect(fallbackImage).toBeInTheDocument()
  })

  it('does not show navigation arrows when only one image', () => {
    jest.mocked(getFeaturedApartments).mockReturnValueOnce([
      {
        id: 'test-1',
        name: 'Test Apartment 1',
        images: ['https://example.com/image1.jpg'],
        rating: 4.9,
        reviews: 50,
      },
    ])
    
    render(<Hero />)
    
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument()
  })

  it('does not show indicators when only one image', () => {
    jest.mocked(getFeaturedApartments).mockReturnValueOnce([
      {
        id: 'test-1',
        name: 'Test Apartment 1',
        images: ['https://example.com/image1.jpg'],
        rating: 4.9,
        reviews: 50,
      },
    ])
    
    render(<Hero />)
    
    const indicators = screen.queryAllByLabelText(/Go to slide/i)
    expect(indicators.length).toBe(0)
  })
})

