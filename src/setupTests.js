// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
const React = require('react');
require('@testing-library/jest-dom');

// Mock для framer-motion
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }) => React.createElement('div', props, children),
      button: ({ children, ...props }) => React.createElement('button', props, children),
      form: ({ children, ...props }) => React.createElement('form', props, children),
      h1: ({ children, ...props }) => React.createElement('h1', props, children),
      p: ({ children, ...props }) => React.createElement('p', props, children),
      section: ({ children, ...props }) => React.createElement('section', props, children),
    },
    AnimatePresence: ({ children }) => children,
  };
});

// Mock для react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => React.createElement('div', { 'data-testid': 'toast-container' }),
}));

// Mock для @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => React.createElement('div', { 'data-testid': 'three-canvas' }, children),
  useFrame: jest.fn(),
  useThree: () => ({
    viewport: { width: 1000, height: 1000 },
  }),
}));

// Mock для @react-three/drei
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => React.createElement('div', { 'data-testid': 'orbit-controls' }),
}));

// Mock для three
jest.mock('three', () => ({
  Color: jest.fn(() => ({
    multiplyScalar: jest.fn().mockReturnThis(),
  })),
  Mesh: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Group: jest.fn(),
  Vector3: jest.fn(),
  Object3D: jest.fn(),
}));

// Глобальный мок для window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // устаревший
    removeListener: jest.fn(), // устаревший
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});