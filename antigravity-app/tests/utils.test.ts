/**
 * Utility Functions Test Suite
 * Tests: getHeatmapColor and getHeatmapGlow from src/lib/types.ts
 *
 * Covers all three density bands:
 *  - Safe   (<  70%)  → neutral slate
 *  - Warning (70–89%) → amber
 *  - Danger  (≥  90%) → crimson
 */

import { describe, it, expect } from 'vitest';
import { getHeatmapColor, getHeatmapGlow } from '../src/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// getHeatmapColor
// ─────────────────────────────────────────────────────────────────────────────
describe('getHeatmapColor', () => {
  // Danger band (≥ 90%)
  it('should return crimson danger at exactly 90% capacity', () => {
    expect(getHeatmapColor(4500, 5000)).toBe('#991b1b');
  });

  it('should return crimson danger above 90%', () => {
    expect(getHeatmapColor(5000, 5000)).toBe('#991b1b');
  });

  it('should return crimson danger at 100%', () => {
    expect(getHeatmapColor(300, 300)).toBe('#991b1b');
  });

  // Warning band (70–89%)
  it('should return amber warning at exactly 70% capacity', () => {
    expect(getHeatmapColor(3500, 5000)).toBe('#b45309');
  });

  it('should return amber warning at 80%', () => {
    expect(getHeatmapColor(4000, 5000)).toBe('#b45309');
  });

  it('should return amber warning just below danger threshold (89.9%)', () => {
    // 4499 / 5000 = 0.8998 < 0.9
    expect(getHeatmapColor(4499, 5000)).toBe('#b45309');
  });

  // Safe band (< 70%)
  it('should return neutral slate at 50% capacity', () => {
    expect(getHeatmapColor(2500, 5000)).toBe('#3f3f46');
  });

  it('should return neutral slate at 0% capacity', () => {
    expect(getHeatmapColor(0, 5000)).toBe('#3f3f46');
  });

  it('should return neutral slate just below warning threshold (69.9%)', () => {
    // 3499 / 5000 = 0.6998 < 0.7
    expect(getHeatmapColor(3499, 5000)).toBe('#3f3f46');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getHeatmapGlow (always transparent — neon removed by design)
// ─────────────────────────────────────────────────────────────────────────────
describe('getHeatmapGlow', () => {
  it('should always return "transparent" regardless of density', () => {
    expect(getHeatmapGlow(0, 5000)).toBe('transparent');
    expect(getHeatmapGlow(2500, 5000)).toBe('transparent');
    expect(getHeatmapGlow(5000, 5000)).toBe('transparent');
  });
});
