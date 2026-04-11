export type ZoneId = 'stage' | 'vip' | 'zoneA' | 'zoneB' | 'foodCourt' | 'restrooms';

export interface ZoneData {
  id: ZoneId;
  name: string;
  count: number;
  capacity: number;
  waitTime: number;
}

export type StadiumState = Record<ZoneId, ZoneData>;

// Utility to calculate heatmap color based on density ratio
// Updated for "Midnight Graphite" theme: Matte, high-contrast muted tones.
export function getHeatmapColor(count: number, capacity: number): string {
  const ratio = count / capacity;
  if (ratio >= 0.9) return "#991b1b"; // Muted Crimson Danger
  if (ratio >= 0.7) return "#b45309"; // Branded Amber Warning
  return "#3f3f46"; // Neutral Slate Safe
}

// Glow logic removed to prevent neon leakage as per "no neon" requirement.
export function getHeatmapGlow(count: number, capacity: number): string {
  return "transparent";
}
