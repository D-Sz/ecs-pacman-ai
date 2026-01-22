// Test setup file for Vitest
// This file runs before each test file

import { beforeEach, afterEach, vi } from 'vitest';

// Clean up DOM between tests
beforeEach(() => {
  document.body.innerHTML = '';
});

// Reset any mocks
afterEach(() => {
  vi.restoreAllMocks();
});
