import { useState, useEffect } from "react";
import { StadiumState } from "./types";

/**
 * Custom hook to manage the stadium crowd simulation logic.
 * Separates business logic from the UI components for better testability and readability.
 */
export function useStadiumSimulation(initialState: StadiumState) {
  const [stadium, setStadium] = useState<StadiumState>(initialState);
  const [criticalZone, setCriticalZone] = useState<{ name: string; density: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStadium(prev => {
        const next = { ...prev };
        
        Object.keys(next).forEach(key => {
          const zoneId = key as keyof StadiumState;
          const zone = { ...next[zoneId] };
          
          // Simulation logic: Moderate density swings
          let change = Math.floor(Math.random() * 80) - 30;

          // Bias for specific zones to create dynamic flow
          if (zoneId === "foodCourt" && Math.random() > 0.6) change += 100;
          if (zoneId === "zoneA" && Math.random() > 0.8) change += 150;
          if (zoneId === "restrooms" && Math.random() > 0.5) change += 20;

          // Clamp density to moderate levels (40% - 75%) for professional dashboard stability
          zone.count = Math.max(zone.capacity * 0.4, Math.min(zone.count + change, zone.capacity * 0.75));
          
          // Calculate wait time based on density squared for exponential response
          const densityRatio = zone.count / zone.capacity;
          const densityMultiplier = Math.pow(densityRatio, 2);
          
          let maxWaitForZone = 15; 
          if (zoneId === "foodCourt") maxWaitForZone = 45;
          else if (zoneId === "restrooms") maxWaitForZone = 25;
          else if (zoneId === "stage" || zoneId === "vip") maxWaitForZone = 5;

          zone.waitTime = Math.round(densityMultiplier * maxWaitForZone);
          next[zoneId] = zone;
        });

        return next;
      });
    }, 1500); 

    return () => clearInterval(interval);
  }, []);

  return { stadium, criticalZone, setCriticalZone };
}
