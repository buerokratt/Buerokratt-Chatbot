import '@testing-library/jest-dom';

// Mock ResizeObserver for tests
globalThis.ResizeObserver = class ResizeObserver {
  observe() {
    // Empty mock for tests
  }
  unobserve() {
    // Empty mock for tests
  }
  disconnect() {
    // Empty mock for tests
  }
} as any;
