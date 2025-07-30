import { describe, it, expect } from 'vitest';
import { percentile, computeThresholds, getHighlightClass } from './percentile';

describe('percentile', () => {
  it('calculates percentile correctly', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(percentile(arr, 80)).toBe(4);
    expect(percentile(arr, 0)).toBe(1);
  });
});

describe('computeThresholds', () => {
  it('computes top and bottom thresholds ignoring zeros', () => {
    const earnings = {
      '2024-01-01': 10,
      '2024-01-02': 0,
      '2024-01-03': 100,
      '2024-01-04': 50
    };
    const result = computeThresholds(earnings);
    expect(result.top).toBe(100);
    expect(result.bottom).toBe(10);
  });
});

describe('getHighlightClass', () => {
  it('returns classes based on thresholds', () => {
    const cls = getHighlightClass(100, { top: 80, bottom: 20 });
    expect(cls).toContain('bg-blue-100');
    const cls2 = getHighlightClass(10, { top: 80, bottom: 20 });
    expect(cls2).toContain('bg-red-100');
  });
});
