import { describe, it, expect } from 'vitest';
import { percentile, computeThresholds, getHighlightStyle } from './percentile';

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

  it('works with earnings objects containing amount property', () => {
    const earnings = {
      '2024-01-01': { amount: 10 },
      '2024-01-02': { amount: 0 },
      '2024-01-03': { amount: 100 },
      '2024-01-04': { amount: 50 }
    };
    const result = computeThresholds(earnings);
    expect(result.top).toBe(100);
    expect(result.bottom).toBe(10);
  });
});

describe('getHighlightStyle', () => {
  it('returns style based on thresholds', () => {
    const style = getHighlightStyle(100, { top: 80, bottom: 20 });
    expect(style).toEqual({ color: 'blue' });
    const style2 = getHighlightStyle(10, { top: 80, bottom: 20 });
    expect(style2).toEqual({ color: 'red' });
  });
});
