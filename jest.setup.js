// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // Remove priority and fill from props to avoid warnings in tests
    const { priority, fill, ...restProps } = props
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...restProps} />
  },
}))

// Fix jsdom pointer capture issue
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: jest.fn(() => false),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: jest.fn(),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: jest.fn(),
  writable: true,
})

// Mock framer-motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  return {
    ...actual,
    motion: {
      div: ({ children, whileInView, initial, animate, transition, ...props }) => <div {...props}>{children}</div>,
      nav: ({ children, whileInView, initial, animate, transition, ...props }) => <nav {...props}>{children}</nav>,
      section: ({ children, whileInView, initial, animate, transition, ...props }) => <section {...props}>{children}</section>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
    }),
  }
})

