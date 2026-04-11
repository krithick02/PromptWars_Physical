"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, TriangleAlert, MoveRight, Users } from "lucide-react";

interface Props {
  isVisible: boolean;
  zoneName: string;
  density: number;
  onClose: () => void;
}

export default function CriticalCrowdAlert({ isVisible, zoneName, density, onClose }: Props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[#09090b]/95 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.98, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 10, opacity: 0 }}
            className="w-full max-w-2xl bg-[#0c0c0e] border border-[#991b1b]/40 rounded-[2rem] p-16 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] pointer-events-auto"
          >
            <div className="flex flex-col items-center text-center relative z-30">
                <div className="w-24 h-24 rounded-2xl bg-[#991b1b]/10 border border-[#991b1b]/30 flex items-center justify-center mb-10 shadow-inner">
                   <AlertOctagon className="w-10 h-10 text-[#ef4444]" />
                </div>

                <div className="space-y-6">
                    <h2 className="text-4xl font-light text-[#fafafa] tracking-tight uppercase">Critical Violation</h2>
                    <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-[#991b1b] text-white text-[10px] font-bold tracking-[0.4em] uppercase shadow-lg">
                       <TriangleAlert className="w-4 h-4" /> Capacity Overload
                    </div>
                </div>

                <p className="mt-12 text-[#71717a] font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed px-12">
                    Structural density in <span className="text-white underline decoration-[#991b1b] decoration-2 underline-offset-8 transition-colors">{zoneName}</span> has reached <span className="text-white text-lg">{Math.round(density * 100)}%</span>. 
                    Redirection of all active flux assets is mandatory.
                </p>

                <div className="w-full grid grid-cols-2 gap-8 mt-16">
                    <div className="bg-[#141416] border border-white/[0.03] rounded-2xl p-8 backdrop-blur-md">
                        <p className="text-[10px] text-[#52525b] font-bold uppercase tracking-[0.3em] mb-4">Actual Density</p>
                        <p className="text-4xl font-light text-[#fafafa] tabular-nums tracking-tighter">{Math.round(density * 100)}%</p>
                    </div>
                    <div className="bg-[#1a0707] border border-[#991b1b]/20 rounded-2xl p-8 backdrop-blur-md">
                        <p className="text-[10px] text-[#ef4444] font-bold uppercase tracking-[0.3em] mb-4">Command State</p>
                        <p className="text-4xl font-light text-[#ef4444] uppercase tracking-tighter">Halt</p>
                    </div>
                </div>

                <motion.button
                   whileHover={{ scale: 1.02, backgroundColor: '#fafafa', color: '#000' }}
                   whileTap={{ scale: 0.98 }}
                   onClick={onClose}
                   className="w-full mt-16 bg-white text-black font-bold py-6 rounded-2xl flex items-center justify-center gap-6 shadow-2xl transition-all uppercase tracking-[0.3em] text-xs"
                >
                    Acknowledge State <MoveRight className="w-6 h-6" />
                </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
