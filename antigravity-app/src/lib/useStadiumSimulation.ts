import { useState, useEffect, useCallback, useRef } from "react";
import { StadiumState } from "./types";
import { persistCrowdSnapshot, trackEvent } from "./firebase";

/**
 * Custom hook to manage the stadium crowd simulation logic.
 * 
 * Architecture:
 *  - Separates business logic from UI components for testability.
 *  - Persists live crowd state to Google Firebase Firestore on each tick.
 *  - Emits operational events to Google Analytics via Firebase Analytics.
 *  - Uses useCallback for stable interval references to prevent re-renders.
 *  - useRef tracks the last-persisted tick to throttle Firestore writes (every 5s).
 */
export function useStadiumSimulation(initialState: StadiumState) {
  const [stadium, setStadium] = useState<StadiumState>(initialState);
  const [criticalZone, setCriticalZone] = useState<{ name: string; density: number } | null>(null);
  const lastPersistRef = useRef<number>(0);
  const tickCount = useRef<number>(0);

  /**
   * Core simulation tick: updates crowd counts and wait times for all zones.
   * Extracted as useCallback so the interval's dependency array stays stable.
   */
  const runSimulationTick = useCallback(() => {
    setStadium(prev => {
      const next = { ...prev };

      Object.keys(next).forEach(key => {
        const zoneId = key as keyof StadiumState;
        const zone = { ...next[zoneId] };

        // Simulation logic: moderate density swings
        let change = Math.floor(Math.random() * 80) - 30;

        // Bias for specific zones to create dynamic flow
        if (zoneId === "foodCourt" && Math.random() > 0.6) change += 100;
        if (zoneId === "zoneA"     && Math.random() > 0.8) change += 150;
        if (zoneId === "restrooms" && Math.random() > 0.5) change += 20;

        // Clamp density to moderate levels (40%–75%) for dashboard stability
        zone.count = Math.max(
          zone.capacity * 0.4,
          Math.min(zone.count + change, zone.capacity * 0.75)
        );

        // Calculate wait time based on density² for exponential response
        const densityRatio = zone.count / zone.capacity;
        const densityMultiplier = Math.pow(densityRatio, 2);

        let maxWaitForZone = 15;
        if (zoneId === "foodCourt")                          maxWaitForZone = 45;
        else if (zoneId === "restrooms")                     maxWaitForZone = 25;
        else if (zoneId === "stage" || zoneId === "vip")    maxWaitForZone = 5;

        zone.waitTime = Math.round(densityMultiplier * maxWaitForZone);
        next[zoneId] = zone;
      });

      // ── Throttled Firebase Firestore persistence (every ~5 ticks / 7.5s) ──
      tickCount.current += 1;
      const now = Date.now();
      if (tickCount.current % 5 === 0 || now - lastPersistRef.current > 7500) {
        lastPersistRef.current = now;
        const snapshot: Record<string, { count: number; capacity: number; waitTime: number }> = {};
        Object.keys(next).forEach(k => {
          const z = next[k as keyof StadiumState];
          snapshot[k] = { count: z.count, capacity: z.capacity, waitTime: z.waitTime };
        });
        persistCrowdSnapshot(snapshot);
      }

      return next;
    });
  }, []);

  /**
   * Detect and surface a critical zone whenever the stadium state updates.
   * Wrapped in useCallback so it can be used as a stable memoized dependency.
   */
  const detectCriticalZone = useCallback((state: StadiumState) => {
    const critical = Object.values(state).find(z => z.count / z.capacity >= 0.9);
    if (critical) {
      setCriticalZone({ name: critical.name, density: critical.count / critical.capacity });
      trackEvent('critical_zone_detected', { zone: critical.name });
    }
  }, []);

  // Run the simulation on a 1.5-second interval
  useEffect(() => {
    const interval = setInterval(runSimulationTick, 1500);
    trackEvent('simulation_started', { timestamp: new Date().toISOString() });
    return () => {
      clearInterval(interval);
      trackEvent('simulation_stopped');
    };
  }, [runSimulationTick]);

  // Watch for critical density whenever stadium state changes
  useEffect(() => {
    detectCriticalZone(stadium);
  }, [stadium, detectCriticalZone]);

  return { stadium, criticalZone, setCriticalZone };
}

/**
 * Pure utility: compute density ratio for a single zone.
 * Exported for direct use in tests and memoized downstream consumers.
 */
export function getZoneDensity(count: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return count / capacity;
}
