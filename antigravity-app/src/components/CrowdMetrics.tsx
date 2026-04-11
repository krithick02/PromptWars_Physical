"use client";

import { useState } from "react";
import { StadiumState, getHeatmapColor } from "@/lib/types";
import { Users, AlertTriangle, Flame, ChevronDown, Layers, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RouteSimulator from "./RouteSimulator";
import VenueMap from "./VenueMap";

interface Props {
  stadium: StadiumState;
  selectedRouteZone: string;
  onSelectRouteZone: (zoneId: string) => void;
}

export default function CrowdMetrics({ stadium, selectedRouteZone, onSelectRouteZone }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Aggregate totals
  const totalCount = Object.values(stadium).reduce((acc, zone) => acc + zone.count, 0);
  const totalCapacity = Object.values(stadium).reduce((acc, zone) => acc + zone.capacity, 0);
  const globalDensity = totalCount / totalCapacity;

  // Find overloaded zones
  const overloadedZones = Object.values(stadium).filter(z => z.count / z.capacity >= 0.9);

  return (
    <div 
        className="w-full h-full bg-[#141416] p-10 flex flex-col gap-10 overflow-y-auto no-scrollbar"
        role="region"
        aria-label="Stadium Information"
    >
      
      <div className="border-b border-[#27272a] pb-10 shrink-0">
        <h2 className="text-xl font-medium tracking-tight text-[#fafafa] mb-1 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#c2a87e] rounded-full" />
          Beatline Center
        </h2>
        <p className="text-[10px] text-[#71717a] uppercase tracking-[0.4em] font-bold">Live Updates Hub</p>
      </div>

      <div className="bg-[#1c1c1f] p-8 rounded-[2rem] border border-white/[0.03] shadow-executive relative overflow-hidden group shrink-0 min-h-[160px] flex flex-col justify-center">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[#a1a1aa] font-bold text-[9px] tracking-[0.3em] uppercase opacity-60" id="total-load-label">Crowd Size</h3>
          <Users className="text-[#c2a87e] w-4 h-4 opacity-40" aria-hidden="true" />
        </div>
        <div 
            className="text-5xl font-light tracking-tighter tabular-nums text-[#fafafa] flex items-baseline gap-3 leading-tight"
            aria-labelledby="total-load-label"
        >
            {totalCount.toLocaleString()}
            <span className="text-sm text-[#52525b] font-bold tracking-widest uppercase opacity-40">Total</span>
        </div>
        <div 
            className="w-full bg-[#27272a] h-1.5 mt-8 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(globalDensity * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Global Stadium Capacity"
        >
            <motion.div className="h-full bg-[#c2a87e]" animate={{ width: `${(globalDensity * 100)}%` }} transition={{ ease: "linear", duration: 0.5 }} />
        </div>
      </div>

      <AnimatePresence>
        {overloadedZones.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} 
            className="bg-[#2d1515] p-6 rounded-xl border border-[#991b1b]/30 flex items-start gap-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="p-2 bg-[#991b1b]/10 rounded-full shrink-0"><AlertTriangle className="text-[#991b1b] w-5 h-5" aria-hidden="true" /></div>
            <div>
                <h4 className="text-[#ef4444] font-bold text-xs tracking-wider uppercase">Too Many People</h4>
                <p className="text-[11px] text-[#a1a1aa] mt-2 leading-relaxed">Crowded sections in: <span className="text-white font-semibold">{overloadedZones.map(z => z.name).join(", ")}</span>.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-grow flex flex-col gap-6">
        <VenueMap />
        <RouteSimulator stadium={stadium} selectedZone={selectedRouteZone} onSelectZone={onSelectRouteZone} />
        
        <div className="space-y-4">
            <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full py-4 px-6 rounded-xl bg-[#1c1c1f] hover:bg-[#27272a] border border-white/[0.03] transition-all duration-300 flex items-center justify-between text-[11px] font-semibold text-[#a1a1aa] tracking-widest uppercase">
                <div className="flex items-center gap-4">
                <Layers className="w-4 h-4 text-[#c2a87e]/60" />
                Section Details
                </div>
                <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }} className="text-[#52525b]"><ChevronDown className="w-4 h-4" /></motion.div>
            </button>
            
            <AnimatePresence>
                {showBreakdown && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-col gap-4 overflow-hidden origin-top px-1 mb-4">
                        {Object.values(stadium).map((zone) => {
                            const ratio = zone.count / zone.capacity;
                            const color = getHeatmapColor(zone.count, zone.capacity);
                            const isHot = ratio >= 0.7;

                            return (
                                <div key={zone.id} className="relative p-6 rounded-2xl bg-[#1c1c1f]/50 border border-white/[0.03] border-l-2 transition-all flex flex-col gap-4" style={{ borderLeftColor: color }}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-[#fafafa] text-[11px] uppercase tracking-wider">{zone.name}</span>
                                            {isHot && <Flame className="w-3.5 h-3.5" style={{ color }} />}
                                        </div>
                                        <span className="text-sm font-bold tabular-nums" style={{ color }}>{Math.round(ratio * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-[#09090b] h-1 rounded-full overflow-hidden">
                                        <div className="h-full transition-all duration-500" style={{ width: `${(ratio * 100)}%`, backgroundColor: color }} />
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] text-[#52525b] font-bold uppercase tracking-[0.2em] pt-1">
                                        <div className="flex gap-4">
                                            <span>{zone.count.toLocaleString()} NOW</span>
                                            <span>{zone.capacity.toLocaleString()} MAX</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-60">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{zone.waitTime}M</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
