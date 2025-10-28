import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.mock('react-hot-toast', () => {
  const mock = {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  };

  return {
    __esModule: true,
    default: mock,
    toast: mock,
    Toaster: () => null,
  };
});
