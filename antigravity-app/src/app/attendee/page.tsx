"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Ticket, CheckCircle2, Loader2, ArrowLeft, ScanLine, UtensilsCrossed, Coffee, ShoppingBag, MapPin, Plus, Minus, CreditCard, AlertTriangle, Radio } from "lucide-react";
import Link from "next/link";
import EmergencySOS from "@/components/EmergencySOS";
import CriticalCrowdAlert from "@/components/CriticalCrowdAlert";

const MENU = [
  { id: "v1", name: "Potable Water", price: 3, desc: "Still mineral water", icon: "💧" },
  { id: "v2", name: "Premium Cola", price: 4, desc: "Classic caramel soda", icon: "🥤" },
  { id: "f1", name: "Salted Popcorn", price: 6, desc: "Buttered corn kernels", icon: "🍿" },
  { id: "f2", name: "Classic Hot Dog", price: 5, desc: "Beef sausage in bun", icon: "🌭" },
];

export default function AttendeePortal() {
  const [ticketId, setTicketId] = useState("");
  const [step, setStep] = useState<"input" | "processing" | "app">("input");
  const [criticalZone, setCriticalZone] = useState<{ name: string; density: number } | null>(null);
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<"ticket" | "concessions" | "sos">("ticket");
  
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderState, setOrderState] = useState<"menu" | "processing" | "pickup">("menu");

  const verifyTicket = () => {
    if (!ticketId.trim()) return;
    setStep("processing");
    setTimeout(() => setStep("app"), 2500);
  };

  const updateCart = (id: string, diff: number) => {
    setCart(prev => {
        const next = { ...prev };
        next[id] = Math.max(0, (next[id] || 0) + diff);
        if (next[id] === 0) delete next[id];
        return next;
    });
  };

  const cartTotal = MENU.reduce((acc, item) => acc + (item.price * (cart[item.id] || 0)), 0);
  const cartAmount = Object.values(cart).reduce((a, b) => a + b, 0);

  const processOrder = () => {
      setOrderState("processing");
      setTimeout(() => setOrderState("pickup"), 3000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
        const currentTime = Date.now();
        const COOLDOWN = 15 * 60 * 1000;

        if (Math.random() > 0.999 && (currentTime - lastAlertTime > COOLDOWN)) {
            setCriticalZone({ name: "General Admission A", density: 2.12 });
            setLastAlertTime(currentTime);
            setTimeout(() => setCriticalZone(null), 8000); 
        }
    }, 3000);
    return () => clearInterval(interval);
  }, [lastAlertTime]);

  return (
    <main className="w-full min-h-screen bg-[#09090b] text-[#fafafa] font-sans flex flex-col relative overflow-hidden">
        
        {/* Critical Global Alert */}
        <CriticalCrowdAlert 
            isVisible={!!criticalZone} 
            zoneName={criticalZone?.name || ""} 
            density={criticalZone?.density || 0} 
            onClose={() => setCriticalZone(null)}
        />
        
        {/* Header Area */}
        <div className="relative pt-16 pb-12 px-10 z-10 flex flex-col items-center border-b border-white/[0.03]">
            <Link href="/" className="absolute top-10 left-10 text-[#52525b] hover:text-[#fafafa] flex items-center gap-3 transition-all z-20 bg-white/[0.03] px-5 py-2.5 rounded-2xl border border-white/5 shadow-executive">
                <ArrowLeft className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
            </Link>
            <div className="w-20 h-20 bg-[#c2a87e]/10 rounded-full flex items-center justify-center mb-10 border border-[#c2a87e]/20 shadow-executive">
                <Radio className="w-8 h-8 text-[#c2a87e] animate-pulse" />
            </div>
            <h1 className="text-3xl font-light tracking-tight uppercase flex items-center gap-4">
                <div className="w-1.5 h-8 bg-[#c2a87e] rounded-full" />
                Beatline Portal
            </h1>
            <p className="text-[10px] text-[#71717a] font-bold uppercase tracking-[0.5em] mt-5 opacity-60">Verified Access Terminal</p>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center px-10 z-10 relative">
            <AnimatePresence mode="wait">
                {step === "input" && (
                    <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-sm flex flex-col items-center">
                        <div className="w-full bg-[#141416] p-12 rounded-[2.5rem] border border-white/5 shadow-2x relative overflow-hidden">
                            <div className="flex flex-col items-center mb-12 text-center">
                                <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl mb-8"><Ticket className="text-[#c2a87e] w-10 h-10 opacity-70" /></div>
                                <h2 className="text-xl font-medium uppercase tracking-tight text-[#fafafa]">Credential Entry</h2>
                                <p className="text-[10px] text-[#71717a] font-bold uppercase tracking-widest mt-4 leading-relaxed">Input your localized ticket UUID for system activation.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="ST_AUTH_XXX" 
                                        value={ticketId}
                                        onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                                        className="w-full bg-[#09090b] border border-[#27272a] focus:border-[#c2a87e]/40 text-[#fafafa] px-8 py-5 rounded-2xl outline-none transition-all duration-300 font-bold tracking-[0.2em] text-sm uppercase placeholder:text-[#3f3f46]"
                                    />
                                </div>
                                <button onClick={verifyTicket} disabled={!ticketId.trim()} className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-[#fafafa] shadow-lg transition-all duration-300 disabled:opacity-20 uppercase tracking-[0.3em] text-xs">
                                    Activate Access
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === "processing" && (
                    <motion.div key="processing" className="flex flex-col items-center justify-center">
                        <div className="relative w-24 h-24 mb-10">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-full h-full rounded-full border-[3px] border-white/5 border-t-[#c2a87e]" />
                            <Loader2 className="w-10 h-10 text-[#c2a87e] opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h3 className="font-bold tracking-[0.5em] text-[#fafafa] text-[9px] uppercase animate-pulse">Syncing Protocols</h3>
                    </motion.div>
                )}

                {step === "app" && (
                    <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col pt-4">
                        <div className="flex-grow overflow-y-auto no-scrollbar pb-40">
                            <AnimatePresence mode="wait">
                                {activeTab === "ticket" && (
                                    <motion.div key="ticket-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex flex-col items-center">
                                        <div className="w-full max-w-sm bg-[#141416] p-12 rounded-[2.5rem] border border-[#c2a87e]/10 shadow-2xl relative overflow-hidden flex flex-col items-center">
                                            <div className="w-full flex justify-between items-center mb-12">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-[#c2a87e] uppercase tracking-[0.2em]">Authorized State</span>
                                                    <p className="text-[#fafafa] font-light text-2xl tracking-tighter uppercase mt-1">Section A-1</p>
                                                </div>
                                                <div className="p-4 bg-[#c2a87e]/10 rounded-2xl border border-[#c2a87e]/20"><QrCode className="w-6 h-6 text-[#c2a87e]" /></div>
                                            </div>

                                            <div className="bg-white p-10 rounded-[2.5rem] mb-12 w-full aspect-square flex justify-center items-center shadow-inner relative group border-[12px] border-black/5">
                                                <QrCode className="w-full h-full text-black opacity-80" strokeWidth={1} />
                                            </div>

                                            <div className="text-center">
                                                <h3 className="text-[#fafafa] font-medium text-lg mb-2">Credential Secure</h3>
                                                <p className="text-[10px] text-[#71717a] font-bold uppercase tracking-widest leading-relaxed">Maintain visual of this terminal at all local proximity readers.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "concessions" && (
                                    <motion.div key="food-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-sm">
                                        {orderState === "menu" ? (
                                            <div className="flex flex-col gap-5">
                                                <h2 className="text-xl font-light uppercase tracking-tight text-[#fafafa] px-2">Rapid Supply</h2>
                                                {MENU.map(item => (
                                                    <div key={item.id} className="bg-[#141416] border border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-sm active:bg-[#1c1c1f] transition-all">
                                                        <div className="flex gap-6 items-center">
                                                            <div className="text-3xl grayscale opacity-50">{item.icon}</div>
                                                            <div>
                                                                <h4 className="font-medium text-[#fafafa] tracking-tight">{item.name}</h4>
                                                                <p className="text-[10px] text-[#c2a87e] font-bold tracking-widest uppercase mt-1">${item.price}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-5 bg-[#09090b] p-2.5 rounded-2xl border border-white/5">
                                                            <button onClick={() => updateCart(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-[#52525b]"><Minus className="w-4 h-4" /></button>
                                                            <span className="text-xs font-bold tabular-nums text-[#fafafa] w-4 text-center">{cart[item.id] || 0}</span>
                                                            <button onClick={() => updateCart(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-[#c2a87e]/10 rounded-xl text-[#c2a87e]"><Plus className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {cartAmount > 0 && (
                                                    <motion.button 
                                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                        onClick={processOrder}
                                                        className="w-full mt-8 bg-white text-black font-bold p-6 rounded-2xl flex justify-between items-center shadow-xl uppercase tracking-[0.3em] text-[10px]"
                                                    >
                                                        <div className="flex items-center gap-4"><ShoppingBag className="w-5 h-5" /> Confirm Order</div>
                                                        <div className="bg-[#f0f0f0] px-4 py-1.5 rounded-xl tabular-nums">${cartTotal.toFixed(2)}</div>
                                                    </motion.button>
                                                )}
                                            </div>
                                        ) : orderState === "processing" ? (
                                            <div className="flex flex-col items-center justify-center py-24">
                                                <div className="relative w-24 h-24 mb-12">
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-full h-full rounded-full border-[3px] border-white/5 border-t-[#c2a87e]" />
                                                </div>
                                                <h3 className="font-bold tracking-[0.5em] text-[#fafafa] text-[9px] uppercase animate-pulse">Encoding Transaction</h3>
                                            </div>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 text-center">
                                                <div className="bg-[#141416] border border-[#c2a87e]/20 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden flex flex-col items-center">
                                                    <div className="p-5 bg-[#166534]/10 border border-[#166534]/20 rounded-2xl text-[#166534] mb-8 shadow-sm">
                                                        <CheckCircle2 className="w-10 h-10" />
                                                    </div>
                                                    <h3 className="text-[#fafafa] font-light text-2xl tracking-tighter uppercase mb-2">Request Processed</h3>
                                                    <p className="text-[9px] text-[#71717a] font-bold uppercase tracking-widest mb-12">Session ID: #{Math.floor(Math.random()*89999)+10000}</p>
                                                    
                                                    <div className="w-full bg-[#09090b] rounded-[2rem] p-8 border border-white/5 flex flex-col gap-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className="p-3 bg-[#c2a87e]/10 rounded-xl border border-[#c2a87e]/20"><MapPin className="w-4 h-4 text-[#c2a87e]" /></div>
                                                            <div className="text-left">
                                                                <p className="text-[9px] text-[#52525b] font-bold uppercase tracking-widest">Routing Link</p>
                                                                <p className="text-xs font-bold text-[#fafafa] uppercase tracking-widest mt-1">Section 4 — Module Alpha</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-[#71717a] font-bold uppercase tracking-widest leading-relaxed text-left opacity-60">Authorize terminal at pickup for prompt fulfillment.</p>
                                                    </div>
                                                    <button onClick={() => setOrderState("menu")} className="mt-12 text-[9px] font-bold uppercase tracking-[0.4em] text-[#52525b] hover:text-[#fafafa] transition-colors">Return to Hub</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "sos" && (
                                    <motion.div key="sos-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full max-w-sm">
                                        <EmergencySOS />
                                        <div className="mt-10 p-8 bg-[#141416] rounded-[2.5rem] border border-[#991b1b]/20">
                                            <div className="flex items-center gap-5 mb-6">
                                                <div className="p-3 bg-[#991b1b]/10 rounded-xl border border-[#991b1b]/20"><AlertTriangle className="w-5 h-5 text-[#ef4444]" /></div>
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#fafafa]">Authorization Note</h4>
                                            </div>
                                            <p className="text-[10px] text-[#71717a] leading-relaxed font-bold uppercase tracking-[0.15em]">All signals are logged and prioritized using dedicated secure channels. Only use for critical field incidents.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Global Bottom Navigation */}
        {step === "app" && (
            <motion.nav initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-0 left-0 w-full z-50 px-8 pb-10 pt-4 bg-gradient-to-t from-[#09090b] to-transparent">
                <div className="bg-[#1c1c1f] border border-white/5 rounded-3xl p-3 shadow-2xl flex justify-between items-center">
                    <button 
                        onClick={() => setActiveTab("ticket")} 
                        className={`flex-grow flex flex-col items-center gap-2 transition-all duration-300 py-3 rounded-2xl ${activeTab === "ticket" ? "text-[#c2a87e] bg-[#c2a87e]/10" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
                    >
                        <Ticket className="w-6 h-6" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Credential</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("concessions")} 
                        className={`flex-grow flex flex-col items-center gap-2 transition-all duration-300 py-3 rounded-2xl ${activeTab === "concessions" ? "text-[#c2a87e] bg-[#c2a87e]/10" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
                    >
                        <UtensilsCrossed className="w-6 h-6" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Supply</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("sos")} 
                        className={`flex-grow flex flex-col items-center gap-2 transition-all duration-300 py-3 rounded-2xl ${activeTab === "sos" ? "text-[#ef4444] bg-[#991b1b]/10" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
                    >
                        <Radio className="w-6 h-6" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Resource</span>
                    </button>
                </div>
            </motion.nav>
        )}
    </main>
  );
}
