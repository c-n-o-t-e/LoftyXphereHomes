// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

const { TextEncoder, TextDecoder } = require('util')
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder
}

// Polyfill fetch for Jest/jsdom (e.g. YourReservationCard fetches /api/availability)
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ blockedDates: [], bookingRanges: [] }),
    })
  )
}

// jsdom does not implement HTMLMediaElement.play(); mock it so components using video do not throw
if (typeof HTMLMediaElement !== 'undefined') {
  HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined)
}

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

// Mock framer-motion (include all motion.* tags used in components)
jest.mock('framer-motion', () => {
  const React = require('react')
  const createMotion = (Tag) => {
    const C = ({ children, whileInView, initial, animate, transition, ...props }) =>
      React.createElement(Tag, props, children)
    return C
  }
  return {
    motion: {
      div: createMotion('div'),
      nav: createMotion('nav'),
      section: createMotion('section'),
      p: createMotion('p'),
      span: createMotion('span'),
      button: createMotion('button'),
      a: createMotion('a'),
      li: createMotion('li'),
      h1: createMotion('h1'),
      h2: createMotion('h2'),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
  }
})

