"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, ChevronDown, Activity } from "lucide-react";

/**
 * Service stream data — defined outside the component so it is never
 * recreated on render. This is a stable constant reference.
 */
const STREAMS = [
  { id: "v1", name: "Water Supply",   pending: 42,  lane: "Module Alpha" },
  { id: "v2", name: "Beverage Flow",  pending: 15,  lane: "Module Alpha" },
  { id: "f1", name: "Dry Goods",      pending: 89,  lane: "Module Beta"  },
  { id: "f2", name: "Nutrients",      pending: 112, lane: "Module Gamma" },
];

/**
 * ServiceStreams — Collapsible live help/service request status panel.
 *
 * Performance:
 *  - React.memo: prevents re-render when parent state changes but this
 *    component receives no props.
 *  - useCallback: stable toggle handler avoids children re-renders.
 *  - STREAMS constant is module-level — zero allocation cost per render.
 */
const ServiceStreams = memo(function ServiceStreams() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <div className="w-full bg-[#1c1c1f] border border-white/[0.03] rounded-[2rem] p-8 relative overflow-hidden transition-all duration-300">
      <div className="relative z-10 flex flex-col gap-5">
        {/* Header / toggle button */}
        <button
          onClick={toggle}
          className="flex items-center justify-between w-full group"
          aria-expanded={isOpen}
          aria-controls="service-streams-list"
        >
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#c2a87e]/10 rounded-2xl border border-[#c2a87e]/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-[#c2a87e]" aria-hidden="true" />
            </div>
            <div className="text-left">
              <h3 className="text-[#fafafa] font-medium text-sm tracking-tight uppercase flex items-center gap-3">
                <div className="w-1 h-4 bg-[#c2a87e] rounded-full" />
                Live Help Status
              </h3>
              <p className="text-[10px] text-[#52525b] font-bold uppercase tracking-[0.3em] leading-none mt-2">
                Active Requests
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="p-3 text-[#52525b] transition-all group-hover:text-white"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Animated stream list */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="service-streams-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-4 overflow-hidden"
              role="list"
              aria-label="Service stream requests"
            >
              <div className="pt-2 flex flex-col gap-4">
                {STREAMS.map(item => (
                  <div
                    key={item.id}
                    role="listitem"
                    className="relative p-6 rounded-2xl bg-[#09090b] border border-white/[0.03] flex justify-between items-center group hover:border-[#c2a87e]/20 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-[#fafafa] text-[11px] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-[#c2a87e] opacity-40" aria-hidden="true" />
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-[#52525b] uppercase font-bold tracking-[0.2em]">
                        {item.lane}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className="text-[#fafafa] font-light text-3xl tabular-nums leading-none tracking-tighter"
                        aria-label={`${item.pending} active requests`}
                      >
                        {item.pending}
                      </span>
                      <p className="text-[10px] text-[#c2a87e]/60 uppercase tracking-widest font-bold mt-2">
                        Active
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default ServiceStreams;
