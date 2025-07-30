export function percentile(arr, p) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export function computeThresholds(earnings) {
  const values = Object.values(earnings).map(v => parseFloat(v)).filter(v => v > 0);
  const top = percentile(values, 95);
  const bottom = percentile(values, 5);
  return { top, bottom };
}

export function getHighlightClass(price, thresholds) {
  const classes = ['text-lg', 'font-bold'];
  if (price >= thresholds.top) {
    classes.push('bg-blue-100', 'text-blue-900', 'rounded', 'px-1');
  }
  if (price <= thresholds.bottom) {
    classes.push('bg-red-100', 'text-red-900', 'rounded', 'px-1');
  }
  return classes.join(' ');
}
