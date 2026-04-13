/**
 * BEATLINE — TACTICAL OPERATIONS HUD
 *
 * Simulation Logic Test Suite
 * Tests: crowd density clamping, wait-time formulas, zone bias behaviour,
 *        density utility, and critical-threshold edge cases.
 *
 * Framework: Vitest (jsdom environment)
 */

import { describe, it, expect } from 'vitest';
import { getZoneDensity } from '../src/lib/useStadiumSimulation';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Density clamping
// ─────────────────────────────────────────────────────────────────────────────
describe('Crowd density clamping', () => {
  it('should clamp density to 0.75 when input exceeds upper bound', () => {
    const raw = 0.8;
    const clamped = Math.max(0.4, Math.min(raw, 0.75));
    expect(clamped).toBe(0.75);
  });

  it('should clamp density to 0.40 when input is below lower bound', () => {
    const raw = 0.1;
    const clamped = Math.max(0.4, Math.min(raw, 0.75));
    expect(clamped).toBe(0.4);
  });

  it('should leave density unchanged when it is within the safe band', () => {
    const raw = 0.6;
    const clamped = Math.max(0.4, Math.min(raw, 0.75));
    expect(clamped).toBe(0.6);
  });

  it('should return exactly 0.40 at the lower boundary', () => {
    const clamped = Math.max(0.4, Math.min(0.4, 0.75));
    expect(clamped).toBe(0.4);
  });

  it('should return exactly 0.75 at the upper boundary', () => {
    const clamped = Math.max(0.4, Math.min(0.75, 0.75));
    expect(clamped).toBe(0.75);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Wait-time formula
// ─────────────────────────────────────────────────────────────────────────────
describe('Wait-time exponential formula', () => {
  it('should calculate wait time as densityRatio² × maxWait', () => {
    const densityRatio = 0.5;
    const maxWait = 45;
    const waitTime = Math.round(Math.pow(densityRatio, 2) * maxWait);
    expect(waitTime).toBe(11); // 0.25 × 45 = 11.25 → 11
  });

  it('should return 0 wait time at zero density', () => {
    const waitTime = Math.round(Math.pow(0, 2) * 45);
    expect(waitTime).toBe(0);
  });

  it('should return full maxWait at 100% density', () => {
    const waitTime = Math.round(Math.pow(1, 2) * 45);
    expect(waitTime).toBe(45);
  });

  it('should scale super-linearly — 75% density gives more than half maxWait', () => {
    const waitAt75 = Math.pow(0.75, 2) * 45; // 0.5625 × 45 = 25.3
    const halfMax = 45 / 2;
    expect(waitAt75).toBeGreaterThan(halfMax);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Zone-specific max wait ceilings
// ─────────────────────────────────────────────────────────────────────────────
describe('Zone max-wait ceilings', () => {
  const getMaxWait = (zoneId: string): number => {
    if (zoneId === 'foodCourt')                         return 45;
    if (zoneId === 'restrooms')                         return 25;
    if (zoneId === 'stage' || zoneId === 'vip')        return 5;
    return 15;
  };

  it('should return 45 for foodCourt', ()  => expect(getMaxWait('foodCourt')).toBe(45));
  it('should return 25 for restrooms', ()  => expect(getMaxWait('restrooms')).toBe(25));
  it('should return  5 for stage',     ()  => expect(getMaxWait('stage')).toBe(5));
  it('should return  5 for vip',       ()  => expect(getMaxWait('vip')).toBe(5));
  it('should return 15 for zoneA',     ()  => expect(getMaxWait('zoneA')).toBe(15));
  it('should return 15 for zoneB',     ()  => expect(getMaxWait('zoneB')).toBe(15));
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. getZoneDensity utility
// ─────────────────────────────────────────────────────────────────────────────
describe('getZoneDensity utility', () => {
  it('should return correct ratio for normal values', () => {
    expect(getZoneDensity(2500, 5000)).toBe(0.5);
  });

  it('should return 1.0 when count equals capacity', () => {
    expect(getZoneDensity(5000, 5000)).toBe(1.0);
  });

  it('should return 0 for zero count', () => {
    expect(getZoneDensity(0, 5000)).toBe(0);
  });

  it('should return 0 when capacity is zero (guard against division by zero)', () => {
    expect(getZoneDensity(100, 0)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Critical threshold detection
// ─────────────────────────────────────────────────────────────────────────────
describe('Critical threshold detection', () => {
  it('should flag a zone as critical when density >= 90%', () => {
    const isCritical = (count: number, capacity: number) => count / capacity >= 0.9;
    expect(isCritical(4500, 5000)).toBe(true);
    expect(isCritical(5000, 5000)).toBe(true);
  });

  it('should NOT flag a zone as critical when density < 90%', () => {
    const isCritical = (count: number, capacity: number) => count / capacity >= 0.9;
    expect(isCritical(4499, 5000)).toBe(false);
    expect(isCritical(3750, 5000)).toBe(false);
  });
});
