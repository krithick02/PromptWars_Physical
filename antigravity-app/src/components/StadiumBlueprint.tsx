"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StadiumState, getHeatmapColor } from "@/lib/types";
import { Clock } from "lucide-react";
import React, { useMemo } from "react";

interface Props {
  stadium: StadiumState;
  selectedRouteZone: string;
}

const ZoneBlock = React.memo(({ zoneId, data }: { zoneId: keyof StadiumState; data: StadiumState[keyof StadiumState] }) => {
    const color = getHeatmapColor(data.count, data.capacity);
    const density = (data.count / data.capacity) * 100;

    return (
      <motion.div
        layout
        className="relative bg-[#141416] rounded-2xl flex flex-col items-center justify-center border border-[#27272a] transition-all duration-500 overflow-hidden shadow-inner h-full w-full"
        style={{ borderTopColor: color, borderTopWidth: '3px' }}
        role="group"
        aria-label={`${data.name} section, current density ${Math.round(density)} percent`}
      >
        <div className="absolute inset-0 bg-[#09090b] opacity-20" aria-hidden="true" />
        <div 
            className="absolute bottom-0 left-0 w-full transition-all duration-700 ease-in-out opacity-[0.03]" 
            style={{ height: `${density}%`, backgroundColor: color }} 
            aria-hidden="true"
        />
        
        {/* Main Content Container */}
        <div className="z-10 flex flex-col items-center justify-between p-4 flex-grow text-center pointer-events-none w-full h-full">
           {/* Section Name - Top (Refined Visibility) */}
           <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#a1a1aa] leading-none w-full px-2">
             {data.name}
           </h3>
           
           {/* Density Metric - Center */}
           <div className="flex flex-col items-center justify-center flex-grow">
                <div className="text-3xl font-light tabular-nums leading-none text-[#fafafa] tracking-tighter">
                    {Math.round(density)}<span className="text-lg opacity-40 ml-0.5" aria-hidden="true">%</span>
                    <span className="sr-only">percent density</span>
                </div>
           </div>
           
           {/* Halt Time Pill - Bottom */}
           <div 
                className="mt-auto px-4 py-1.5 bg-[#09090b] border border-white/[0.05] rounded-full flex items-center gap-2 shadow-executive"
                aria-label={`Average wait time ${data.waitTime} minutes`}
            >
               <Clock className="w-3 h-3 text-[#c2a87e] opacity-70" aria-hidden="true" />
               <span className="text-[9px] font-bold text-[#fafafa] uppercase tracking-widest tabular-nums leading-none">
                 {data.waitTime} Min
               </span>
           </div>
        </div>
      </motion.div>
    );
});

ZoneBlock.displayName = "ZoneBlock";

export default function StadiumBlueprint({ stadium, selectedRouteZone }: Props) {
  
  const currentPath = useMemo(() => {
    if (!selectedRouteZone || selectedRouteZone === "foodCourt" || selectedRouteZone === "restrooms") return null;

    // Viewbox: 300 x 400
    const HUB_Y = 360; 
    
    if (selectedRouteZone === "zoneA") return `M 100 220 L 150 220 L 150 ${HUB_Y}`;
    if (selectedRouteZone === "zoneB") return `M 200 220 L 150 220 L 150 ${HUB_Y}`;
    if (selectedRouteZone === "stage" || selectedRouteZone === "vip") {
        const startY = selectedRouteZone === "stage" ? 50 : 100;
        return `M 150 ${startY} L 150 ${HUB_Y}`;
    }
    return null;
  }, [selectedRouteZone]);

  return (
    <div className="w-full h-full p-8 flex flex-col justify-center items-center" role="main" aria-label="Tactical Stadium Layout">
      <div className="w-full h-full max-w-5xl relative border border-[#27272a] rounded-[3rem] p-10 flex flex-col gap-5 bg-[#0a0a0b] overflow-hidden shadow-executive">
        {/* Subtle grid with gold tint */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #c2a87e 1px, transparent 1px)', backgroundSize: '40px 40px'}} aria-hidden="true" />

        {/* Stadium Sections Layout - Optimized for perfect fit and visibility */}
        <div className="h-[100px] w-full flex justify-center z-10 shrink-0">
          <ZoneBlock zoneId="stage" data={stadium.stage} />
        </div>

        <div className="h-[90px] w-full flex justify-center z-10 shrink-0">
          <ZoneBlock zoneId="vip" data={stadium.vip} />
        </div>

        <div className="flex-grow w-full flex justify-center gap-5 z-10 min-h-[130px] overflow-hidden px-2">
          <div className="w-[48%] h-full"> 
            <ZoneBlock zoneId="zoneA" data={stadium.zoneA} />
          </div>
          <div className="w-[48%] h-full">
            <ZoneBlock zoneId="zoneB" data={stadium.zoneB} />
          </div>
        </div>

        <div className="h-[100px] w-full flex justify-center gap-5 z-10 shrink-0">
          <div className="w-[48%] h-full">
            <ZoneBlock zoneId="foodCourt" data={stadium.foodCourt} />
          </div>
          <div className="w-[48%] h-full">
            <ZoneBlock zoneId="restrooms" data={stadium.restrooms} />
          </div>
        </div>

        {/* Tactical Response Marker */}
        <div className="h-10 w-full flex justify-center items-center z-10 mt-2 shrink-0">
           <div className="px-12 py-3 bg-[#1e1e1e] border border-white/[0.05] rounded-full flex items-center justify-center gap-4 text-[#c2a87e] font-bold text-[10px] uppercase tracking-[0.4em] shadow-executive whitespace-nowrap">
               <div className="w-1.5 h-1.5 bg-[#c2a87e] rounded-full animate-pulse" />
               Help Station
           </div>
        </div>

        {/* Tactical Route Overlay */}
        <svg viewBox="0 0 300 400" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <AnimatePresence>
                {currentPath && (
                    <g>
                        <motion.path
                            key={`glow-${currentPath}`}
                            d={currentPath}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            fill="none"
                            stroke="#c2a87e"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                        <motion.path
                            key={currentPath}
                            d={currentPath}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            fill="none"
                            stroke="#c2a87e"
                            strokeWidth="3.5"
                            strokeDasharray="12 8"
                            strokeLinecap="round"
                        />
                    </g>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {currentPath && (
                    <motion.circle
                        key={`pulse-${currentPath}`}
                        r="4.5"
                        fill="#fafafa"
                        shadow-2xl
                    >
                        <animateMotion 
                            dur="3s" 
                            repeatCount="indefinite" 
                            path={currentPath} 
                        />
                        <circle r="2" fill="#c2a87e" />
                    </motion.circle>
                )}
            </AnimatePresence>
        </svg>

      </div>
    </div>
  );
}
