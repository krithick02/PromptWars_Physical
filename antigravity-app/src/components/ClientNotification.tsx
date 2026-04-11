"use client";

import { motion } from "framer-motion";
import { Navigation } from "lucide-react";

export default function ClientNotification() {
  return (
    <div className="absolute top-1/4 right-12 z-50 pointer-events-none w-80">
      <motion.div
        initial={{ y: -10, scale: 0.98, opacity: 0 }}
        animate={{ 
            y: 0, 
            scale: 1, 
            opacity: 1, 
        }}
        exit={{ y: -20, opacity: 0 }}
        transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
        }}
        className="bg-[#141416] p-8 rounded-2xl border border-[#27272a] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        <div className="flex flex-col items-center text-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-[#c2a87e]/10 border border-[#c2a87e]/20 flex justify-center items-center shadow-inner">
               <Navigation className="w-6 h-6 text-[#c2a87e]" />
            </div>
            <div>
                <h3 className="font-medium text-lg text-[#fafafa] mb-1 tracking-tight">System Redirection</h3>
                <p className="text-[10px] text-[#71717a] font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Critical density threshold reached. Traffic flow has been recalculated. Proceed to <strong className="text-[#c2a87e]">Gate A</strong> for optimal entry speed.
                </p>
            </div>
            
            <div className="w-full bg-[#09090b] rounded-full h-1 mt-2 overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="h-full bg-[#c2a87e] w-full"
                />
            </div>
        </div>
      </motion.div>
    </div>
  );
}
