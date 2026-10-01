// layoutUtils.js - Layout configuration & intelligent grid arrangement up to 100 devices

export const STANDARD_LAYOUTS = [
  { id: '1x1', name: '1 × 1', rows: 1, cols: 1, total: 1, label: 'Single Screen', desc: '1 Phone Test' },
  { id: '1x2', name: '1 × 2', rows: 1, cols: 2, total: 2, label: 'Dual Horizontal', desc: '2 Phones Side-by-Side' },
  { id: '2x1', name: '2 × 1', rows: 2, cols: 1, total: 2, label: 'Dual Vertical', desc: '2 Phones Stacked' },
  { id: '2x2', name: '2 × 2', rows: 2, cols: 2, total: 4, label: 'Quad Display', desc: '4 Phones Wall (Recommended)' },
  { id: '2x3', name: '2 × 3', rows: 2, cols: 3, total: 6, label: 'Wide Cinema', desc: '6 Phones Display' },
  { id: '3x3', name: '3 × 3', rows: 3, cols: 3, total: 9, label: 'Mega Wall', desc: '9 Phones Mega Screen' }
];

export const POPULAR_LARGE_PRESETS = [10, 12, 15, 16, 20, 24, 25, 30, 36, 40, 50, 60, 64, 70, 80, 90, 100];

/**
 * Intelligent balanced grid calculation for 10 to 100 phones.
 * Keeps aspect ratio balanced and visually pleasing.
 */
export function calculateOptimalGrid(phoneCount) {
  const count = Math.max(1, Math.min(100, parseInt(phoneCount, 10) || 1));

  // Curated optimal factorings for balanced aspect ratios
  const curated = {
    1: { rows: 1, cols: 1 },
    2: { rows: 1, cols: 2 },
    3: { rows: 1, cols: 3 },
    4: { rows: 2, cols: 2 },
    5: { rows: 1, cols: 5 },
    6: { rows: 2, cols: 3 },
    7: { rows: 2, cols: 4 },
    8: { rows: 2, cols: 4 },
    9: { rows: 3, cols: 3 },
    10: { rows: 2, cols: 5 },
    11: { rows: 3, cols: 4 },
    12: { rows: 3, cols: 4 },
    13: { rows: 3, cols: 5 },
    14: { rows: 2, cols: 7 },
    15: { rows: 3, cols: 5 },
    16: { rows: 4, cols: 4 },
    17: { rows: 3, cols: 6 },
    18: { rows: 3, cols: 6 },
    19: { rows: 4, cols: 5 },
    20: { rows: 4, cols: 5 },
    21: { rows: 3, cols: 7 },
    22: { rows: 4, cols: 6 },
    23: { rows: 4, cols: 6 },
    24: { rows: 4, cols: 6 },
    25: { rows: 5, cols: 5 },
    26: { rows: 4, cols: 7 },
    27: { rows: 3, cols: 9 },
    28: { rows: 4, cols: 7 },
    29: { rows: 5, cols: 6 },
    30: { rows: 5, cols: 6 },
    32: { rows: 4, cols: 8 },
    35: { rows: 5, cols: 7 },
    36: { rows: 6, cols: 6 },
    40: { rows: 5, cols: 8 },
    42: { rows: 6, cols: 7 },
    45: { rows: 5, cols: 9 },
    48: { rows: 6, cols: 8 },
    49: { rows: 7, cols: 7 },
    50: { rows: 5, cols: 10 },
    54: { rows: 6, cols: 9 },
    56: { rows: 7, cols: 8 },
    60: { rows: 6, cols: 10 },
    64: { rows: 8, cols: 8 },
    70: { rows: 7, cols: 10 },
    72: { rows: 8, cols: 9 },
    75: { rows: 8, cols: 10 },
    80: { rows: 8, cols: 10 },
    81: { rows: 9, cols: 9 },
    90: { rows: 9, cols: 10 },
    100: { rows: 10, cols: 10 }
  };

  if (curated[count]) {
    const { rows, cols } = curated[count];
    return {
      id: `${rows}x${cols}`,
      name: `${rows} × ${cols}`,
      rows,
      cols,
      total: rows * cols,
      targetPhones: count,
      label: `${rows}×${cols} Grid (${count} Phones)`
    };
  }

  // Fallback balance algorithm for any other number between 10 and 100
  let bestR = 2, bestC = Math.ceil(count / 2), bestScore = Infinity;
  for (let r = 1; r <= 10; r++) {
    for (let c = 1; c <= 10; c++) {
      const cap = r * c;
      if (cap >= count && cap <= 100) {
        const waste = cap - count;
        const ratio = c / r;
        const score = waste * 3 + Math.abs(ratio - 1.4) * 2;
        if (score < bestScore) {
          bestScore = score;
          bestR = r;
          bestC = c;
        }
      }
    }
  }

  return {
    id: `${bestR}x${bestC}`,
    name: `${bestR} × ${bestC}`,
    rows: bestR,
    cols: bestC,
    total: bestR * bestC,
    targetPhones: count,
    label: `${bestR}×${bestC} Grid (${count} Phones)`
  };
}

/**
 * Creates custom grid safely with 1-100 constraint.
 */
export function createCustomGrid(rowsInput, colsInput) {
  const r = Math.max(1, Math.min(10, parseInt(rowsInput, 10) || 1));
  const c = Math.max(1, Math.min(10, parseInt(colsInput, 10) || 1));
  const total = Math.min(100, Math.max(1, r * c));

  return {
    id: `${r}x${c}`,
    name: `${r} × ${c}`,
    rows: r,
    cols: c,
    total,
    label: `Custom ${r}×${c} (${total} Phones)`
  };
}
