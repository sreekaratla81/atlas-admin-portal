export function percentile(arr, p) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export function computeThresholds(earnings) {
  const values = Object.values(earnings)
    .map((v) => {
      if (v && typeof v === 'object') {
        return parseFloat(v.amount);
      }
      return parseFloat(v);
    })
    .filter((v) => !isNaN(v) && v > 0);
  const top = percentile(values, 95);
  const bottom = percentile(values, 5);
  return { top, bottom };
}

export function getHighlightStyle(price, thresholds) {
  if (price >= thresholds.top) {
    return { color: '#add8e6' };
  }
  if (price <= thresholds.bottom) {
    return { color: '#f8d7da' };
  }
  return {};
}
