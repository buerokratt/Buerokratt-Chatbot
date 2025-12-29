import '@testing-library/jest-dom';

// Mock ResizeObserver for tests
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;
