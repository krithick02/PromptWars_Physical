"use client";

import { StadiumState } from "@/lib/types";
import { MapPin, Navigation } from "lucide-center";
import { MapPin as MapPinIcon, Navigation as NavIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  stadium: StadiumState;
  selectedZone: string;
  onSelectZone: (zoneId: string) => void;
}

export default function RouteSimulator({ stadium, selectedZone, onSelectZone }: Props) {
  const calculateRoute = () => {
    if (!selectedZone) return null;
    
    if (selectedZone === "foodCourt" || selectedZone === "restrooms") {
        return "You are currently near the facilities concourse. Please follow the central path markers straight to the Response Hub.";
    }
    
    if (selectedZone === "zoneA" || selectedZone === "zoneB") {
        return `Flow rate is stable. Proceed toward the rear concourse exits to reach the central Response Hub.`;
    }

    if (selectedZone === "stage" || selectedZone === "vip") {
        const densityA = stadium.zoneA.count / stadium.zoneA.capacity;
        const densityB = stadium.zoneB.count / stadium.zoneB.capacity;
        
        if (densityA < densityB) {
            return `Exit via the left corridor into Zone A (${Math.round(densityA*100)}% load). Follow the designated lane straight to the Response Hub.`;
        } else {
            return `Exit via the right corridor into Zone B (${Math.round(densityB*100)}% load). Follow the designated lane straight to the Response Hub.`;
        }
    }
    
    return "Route unavailable.";
  }

  return (
      <div className="w-full bg-[#1c1c1f] p-6 rounded-2xl border border-white/[0.03] relative overflow-hidden">
        
        <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-[#c2a87e]/10 rounded-lg border border-[#c2a87e]/20">
                <MapPinIcon className="w-4 h-4 text-[#c2a87e]" />
            </div>
            <h3 className="text-[#a1a1aa] font-bold text-[10px] tracking-[0.3em] uppercase">Tactical Navigation</h3>
        </div>

        <div className="flex flex-col gap-4">
            <div className="relative">
                <select
                    className="w-full bg-[#09090b] border border-[#27272a] text-[#d4d4d8] text-sm rounded-xl px-4 py-4 appearance-none outline-none focus:border-[#c2a87e]/50 transition-colors cursor-pointer font-medium"
                    value={selectedZone}
                    onChange={(e) => onSelectZone(e.target.value)}
                >
                    <option value="" disabled>IDENTIFY LOCATION...</option>
                    {Object.values(stadium).map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#52525b]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            <AnimatePresence>
                {selectedZone && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 mt-2 bg-[#27272a]/30 border border-white/[0.03] rounded-xl"
                    >
                         <h4 className="text-[#c2a87e] text-[9px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                             <NavIcon className="w-3 h-3" />
                             Validated Response Path
                         </h4>
                         <p className="text-xs text-[#71717a] leading-relaxed font-medium">
                             {calculateRoute()}
                         </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
  );
}
