"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ShieldAlert, Flame, Syringe, Users, Send, CheckCircle, X } from "lucide-react";

export default function EmergencySOS() {
  const [step, setStep] = useState<"initial" | "selecting" | "reporting" | "confirmed">("initial");
  const [emergencyType, setEmergencyType] = useState<string | null>(null);

  const types = [
    { id: 'medical', label: 'Medical', icon: <Syringe className="w-5 h-5" />, color: '#b45309' },
    { id: 'security', label: 'Security', icon: <ShieldAlert className="w-5 h-5" />, color: '#c2a87e' },
    { id: 'fire', label: 'Fire', icon: <Flame className="w-5 h-5" />, color: '#991b1b' },
    { id: 'crowd', label: 'Crowd Rush', icon: <Users className="w-5 h-5" />, color: '#52525b' },
  ];

  const handleReport = (type: string) => {
    setEmergencyType(type);
    setStep("reporting");
    
    // Simulate live transmission to Command Center
    setTimeout(() => {
      setStep("confirmed");
    }, 2000);
  };

  return (
    <div className="w-full bg-[#1c1c1f] border border-[#991b1b]/10 rounded-[2rem] p-8 relative">
        <div className="relative z-10">
            <div className={`flex items-center gap-5 transition-all duration-300 ${step === "initial" ? "mb-6" : "mb-8 pb-8 border-b border-white/[0.03]"}`}>
                <div className="p-4 bg-[#991b1b]/10 rounded-2xl border border-[#991b1b]/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-[#ef4444]" />
                </div>
                <div>
                  <h3 className="text-[#fafafa] font-medium text-sm tracking-tight uppercase flex items-center gap-3">
                    <div className="w-1 h-4 bg-[#991b1b] rounded-full" />
                    Quick Alerts
                  </h3>
                  <p className="text-[10px] text-[#71717a] font-bold uppercase tracking-[0.3em] leading-none mt-2">Emergency Help</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === "initial" && (
                    <motion.button
                        key="initial"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -5 }}
                        whileHover={{ scale: 1.02, backgroundColor: '#b91c1c' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep("selecting")}
                        className="w-full bg-[#991b1b] text-white py-6 rounded-xl flex items-center justify-center gap-4 transition-all font-bold uppercase tracking-[0.25em] text-xs shadow-lg"
                    >
                        Send Help Request
                    </motion.button>
                )}

                {step === "selecting" && (
                    <motion.div
                        key="selecting"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex flex-col gap-4"
                    >
                        <p className="text-[#52525b] text-[9px] font-bold uppercase tracking-[0.2em] mb-2 text-center">Inquiry Protocol</p>
                        <div className="grid grid-cols-2 gap-4">
                            {types.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleReport(t.label)}
                                    className="flex flex-col items-center justify-center gap-4 p-6 bg-[#09090b] border border-white/[0.03] rounded-xl hover:bg-[#27272a] hover:border-white/10 transition-all text-[10px] font-bold uppercase tracking-[0.2em] text-[#71717a] group"
                                >
                                    <div className="transition-transform group-hover:scale-110" style={{ color: t.color }}>{t.icon}</div>
                                    <span className="group-hover:text-[#fafafa]">{t.label}</span>
                                </button>
                            ))}
                        </div>
                        <button 
                          onClick={() => setStep("initial")} 
                          className="mt-4 text-[9px] text-[#52525b] hover:text-[#fafafa] flex items-center justify-center gap-3 uppercase font-bold tracking-[0.2em] transition-colors"
                        >
                            <X className="w-4 h-4" /> Cancel Request
                        </button>
                    </motion.div>
                )}

                {step === "reporting" && (
                    <motion.div key="reporting" className="flex flex-col items-center justify-center py-10 text-center min-h-[180px]">
                        <div className="relative w-20 h-20 mb-10">
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                              className="w-full h-full rounded-full border-[2px] border-[#991b1b]/20 border-t-[#991b1b]" 
                            />
                            <Send className="w-6 h-6 text-[#991b1b] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
                        </div>
                        <h3 className="text-[#ef4444] font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Contacting Support</h3>
                        <p className="text-[9px] text-[#71717a] mt-6 uppercase font-bold tracking-widest">Sharing your location...</p>
                    </motion.div>
                )}

                {step === "confirmed" && (
                    <motion.div key="confirmed" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="p-5 bg-[#166534]/10 text-[#166534] rounded-xl mb-8 border border-[#166534]/20 shadow-sm">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-[#fafafa] font-bold text-sm uppercase tracking-[0.1em] mb-4">Response Acknowledged</h3>
                        <p className="text-[10px] text-[#71717a] px-10 leading-relaxed font-bold uppercase tracking-widest mb-10">Units are moving to your coordinates. Remain stationed at your current node.</p>
                        <button 
                          onClick={() => setStep("initial")} 
                          className="px-10 py-4 bg-[#09090b] border border-white/5 rounded-xl text-[9px] text-[#52525b] hover:text-white uppercase font-bold tracking-[0.2em] transition-all"
                        >
                          Clear Session
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}
