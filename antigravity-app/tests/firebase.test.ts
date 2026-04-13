/**
 * Firebase Integration Test Suite
 * Tests: config structure, module exports, utility helpers, and
 *        graceful degradation when Firestore is unavailable.
 *
 * Note: Firebase SDK calls are intentionally not mocked here —
 * these tests validate the module contract (exports, config shape,
 * and error-resilient wrappers) without requiring a live project.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firebaseConfig, CROWD_COLLECTION, VENUE_DOC_ID } from '../src/lib/firebase';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Firebase config structure
// ─────────────────────────────────────────────────────────────────────────────
describe('Firebase config shape', () => {
  it('should export a config object with all required keys', () => {
    const requiredKeys = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
      'measurementId',
    ];
    requiredKeys.forEach(key => {
      expect(firebaseConfig).toHaveProperty(key);
    });
  });

  it('should have non-empty string values for all config keys', () => {
    Object.values(firebaseConfig).forEach(value => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it('should use environment variables or demo fallbacks (never undefined)', () => {
    expect(firebaseConfig.apiKey).toBeTruthy();
    expect(firebaseConfig.projectId).toBeTruthy();
    expect(firebaseConfig.appId).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Firestore collection / document constants
// ─────────────────────────────────────────────────────────────────────────────
describe('Firestore path constants', () => {
  it('should export CROWD_COLLECTION as a non-empty string', () => {
    expect(typeof CROWD_COLLECTION).toBe('string');
    expect(CROWD_COLLECTION.length).toBeGreaterThan(0);
  });

  it('should export VENUE_DOC_ID as a non-empty string', () => {
    expect(typeof VENUE_DOC_ID).toBe('string');
    expect(VENUE_DOC_ID.length).toBeGreaterThan(0);
  });

  it('CROWD_COLLECTION and VENUE_DOC_ID should be distinct', () => {
    expect(CROWD_COLLECTION).not.toBe(VENUE_DOC_ID);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Module exports contract
// ─────────────────────────────────────────────────────────────────────────────
describe('Firebase module exports', () => {
  it('should export getFirebaseDb as a function', async () => {
    const mod = await import('../src/lib/firebase');
    expect(typeof mod.getFirebaseDb).toBe('function');
  });

  it('should export getFirebaseAnalytics as a function', async () => {
    const mod = await import('../src/lib/firebase');
    expect(typeof mod.getFirebaseAnalytics).toBe('function');
  });

  it('should export persistCrowdSnapshot as a function', async () => {
    const mod = await import('../src/lib/firebase');
    expect(typeof mod.persistCrowdSnapshot).toBe('function');
  });

  it('should export fetchCrowdSnapshot as a function', async () => {
    const mod = await import('../src/lib/firebase');
    expect(typeof mod.fetchCrowdSnapshot).toBe('function');
  });

  it('should export subscribeToCrowdUpdates as a function', async () => {
    const mod = await import('../src/lib/firebase');
    expect(typeof mod.subscribeToCrowdUpdates).toBe('function');
  });

  it('should export trackEvent as a function', async () => {
    const mod = await import('../src/lib/firebase');
    expect(typeof mod.trackEvent).toBe('function');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Graceful degradation of trackEvent
// ─────────────────────────────────────────────────────────────────────────────
describe('trackEvent graceful degradation', () => {
  it('should not throw when called without Analytics being initialised', async () => {
    const { trackEvent } = await import('../src/lib/firebase');
    // trackEvent must never throw — it catches internally
    await expect(trackEvent('test_event', { foo: 'bar' })).resolves.not.toThrow();
  });

  it('should accept event name with no params', async () => {
    const { trackEvent } = await import('../src/lib/firebase');
    await expect(trackEvent('simulation_started')).resolves.not.toThrow();
  });
});
