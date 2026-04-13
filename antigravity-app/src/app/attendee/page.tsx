"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Ticket, CheckCircle2, Loader2, ArrowLeft, UtensilsCrossed, ShoppingBag, MapPin, Plus, Minus, AlertTriangle, Radio, Activity, Navigation, Clock, TrendingUp, TrendingDown, Minus as Minus2, CheckCircle } from "lucide-react";
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

  const [activeTab, setActiveTab] = useState<"ticket" | "concessions" | "sos" | "status">("ticket");

  // ── Live Zone Status for Attendees ────────────────────────────────────────
  const ZONES_INITIAL = useMemo(() => [
    { id: "gate-a",    name: "Gate A",       capacity: 2000, count: 820,  waitTime: 4,  icon: "🅰️" },
    { id: "gate-b",    name: "Gate B",       capacity: 2000, count: 1560, waitTime: 11, icon: "🅱️" },
    { id: "gate-c",    name: "Gate C",       capacity: 2000, count: 1840, waitTime: 18, icon: "🅲"  },
    { id: "food-ct",   name: "Food Court",   capacity: 2500, count: 1900, waitTime: 22, icon: "🍔" },
    { id: "restrooms", name: "Restrooms",    capacity: 300,  count: 155,  waitTime: 6,  icon: "🚻" },
    { id: "merch",     name: "Merch Stand",  capacity: 400,  count: 210,  waitTime: 8,  icon: "👕" },
  ], []);

  const [zones, setZones] = useState(ZONES_INITIAL);

  // Simulate crowd fluctuations (same pattern as ops dashboard)
  useEffect(() => {
    const tick = setInterval(() => {
      setZones(prev => prev.map(z => {
        const change = Math.floor(Math.random() * 60) - 20;
        const newCount = Math.max(z.capacity * 0.3, Math.min(z.count + change, z.capacity * 0.95));
        const ratio = newCount / z.capacity;
        const waitTime = Math.round(Math.pow(ratio, 2) * (z.id === "food-ct" ? 45 : z.id === "restrooms" ? 20 : 25));
        return { ...z, count: Math.round(newCount), waitTime };
      }));
    }, 2000);
    return () => clearInterval(tick);
  }, []);

  const recommendedZone = useMemo(() =>
    [...zones].sort((a, b) => (a.count / a.capacity) - (b.count / b.capacity))[0],
    [zones]
  );

  const getZoneStatus = useCallback((count: number, capacity: number) => {
    const r = count / capacity;
    if (r >= 0.85) return { label: "Busy",     color: "#ef4444", bg: "#991b1b", icon: TrendingUp };
    if (r >= 0.60) return { label: "Moderate", color: "#f59e0b", bg: "#b45309", icon: Minus2    };
    return              { label: "Open",     color: "#22c55e", bg: "#166534", icon: TrendingDown };
  }, []);
  
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

                                {activeTab === "status" && (
                                    <motion.div
                                        key="status-view"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="w-full max-w-sm flex flex-col gap-5"
                                        role="region"
                                        aria-label="Live venue crowd status"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-xl font-light uppercase tracking-tight text-[#fafafa]">Live Status</h2>
                                                <p className="text-[9px] text-[#52525b] font-bold uppercase tracking-[0.3em] mt-1">Updates every 2 seconds</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-[#166534]/10 border border-[#166534]/20 rounded-full">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">Live</span>
                                            </div>
                                        </div>

                                        {/* Recommended Entrance Banner */}
                                        <motion.div
                                            key={recommendedZone.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-[#0d2318] border border-[#166534]/40 rounded-[2rem] p-8 relative overflow-hidden"
                                            role="alert"
                                            aria-live="polite"
                                        >
                                            <div className="flex items-start gap-5">
                                                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 shrink-0">
                                                    <Navigation className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-green-400 mb-2">Recommended Route</p>
                                                    <h3 className="text-[#fafafa] font-medium text-base tracking-tight">{recommendedZone.name}</h3>
                                                    <p className="text-[10px] text-[#71717a] font-bold uppercase tracking-widest mt-2">
                                                        {Math.round((recommendedZone.count / recommendedZone.capacity) * 100)}% capacity · ~{recommendedZone.waitTime} MIN wait
                                                    </p>
                                                </div>
                                                <div className="text-3xl shrink-0">{recommendedZone.icon}</div>
                                            </div>
                                            <p className="text-[10px] text-green-300/60 font-bold uppercase tracking-widest mt-6 leading-relaxed">
                                                Head here for fastest entry and minimal waiting time.
                                            </p>
                                        </motion.div>

                                        {/* Zone Grid */}
                                        <div className="flex flex-col gap-3" role="list" aria-label="Zone crowd status">
                                            {zones.map(zone => {
                                                const status = getZoneStatus(zone.count, zone.capacity);
                                                const ratio  = zone.count / zone.capacity;
                                                const StatusIcon = status.icon;
                                                const isRecommended = zone.id === recommendedZone.id;

                                                return (
                                                    <motion.div
                                                        key={zone.id}
                                                        layout
                                                        role="listitem"
                                                        className={`bg-[#141416] border rounded-2xl p-6 flex flex-col gap-4 transition-all ${
                                                            isRecommended
                                                                ? "border-green-500/30 bg-[#0d2318]/60"
                                                                : "border-white/[0.04]"
                                                        }`}
                                                        aria-label={`${zone.name}: ${status.label}, ${Math.round(ratio * 100)}% full, ${zone.waitTime} minute wait`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-2xl" aria-hidden="true">{zone.icon}</span>
                                                                <div>
                                                                    <h4 className="font-bold text-[#fafafa] text-sm tracking-tight flex items-center gap-2">
                                                                        {zone.name}
                                                                        {isRecommended && (
                                                                            <span className="text-[8px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                                                                Best
                                                                            </span>
                                                                        )}
                                                                    </h4>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <Clock className="w-3 h-3 text-[#52525b]" aria-hidden="true" />
                                                                        <span className="text-[9px] text-[#52525b] font-bold uppercase tracking-widest">
                                                                            ~{zone.waitTime} MIN wait
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${status.bg}20`, border: `1px solid ${status.bg}40` }}>
                                                                    <StatusIcon className="w-3 h-3" style={{ color: status.color }} aria-hidden="true" />
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: status.color }}>
                                                                        {status.label}
                                                                    </span>
                                                                </div>
                                                                <span className="text-lg font-light tabular-nums tracking-tighter" style={{ color: status.color }}>
                                                                    {Math.round(ratio * 100)}%
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Capacity bar */}
                                                        <div className="w-full bg-[#09090b] h-1 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
                                                            <motion.div
                                                                className="h-full rounded-full"
                                                                animate={{ width: `${ratio * 100}%` }}
                                                                transition={{ ease: "linear", duration: 0.8 }}
                                                                style={{ backgroundColor: status.color }}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* Legend */}
                                        <div className="flex justify-center gap-6 py-4">
                                            {[
                                                { color: "#22c55e", label: "Open (<60%)"    },
                                                { color: "#f59e0b", label: "Moderate (60–85%)" },
                                                { color: "#ef4444", label: "Busy (>85%)"  },
                                            ].map(l => (
                                                <div key={l.label} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                                                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#52525b]">{l.label}</span>
                                                </div>
                                            ))}
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
                        aria-label="My Ticket"
                        className={`flex-grow flex flex-col items-center gap-2 transition-all duration-300 py-3 rounded-2xl ${activeTab === "ticket" ? "text-[#c2a87e] bg-[#c2a87e]/10" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
                    >
                        <Ticket className="w-5 h-5" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Ticket</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("status")}
                        aria-label="Live crowd status"
                        className={`flex-grow flex flex-col items-center gap-2 transition-all duration-300 py-3 rounded-2xl ${activeTab === "status" ? "text-[#c2a87e] bg-[#c2a87e]/10" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
                    >
                        <Activity className="w-5 h-5" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Status</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("concessions")}
                        aria-label="Order food and drinks"
                        className={`flex-grow flex flex-col items-center gap-2 transition-all duration-300 py-3 rounded-2xl ${activeTab === "concessions" ? "text-[#c2a87e] bg-[#c2a87e]/10" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
                    >
                        <UtensilsCrossed className="w-5 h-5" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Food</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("sos")}
                        aria-label="Emergency SOS"
                        className={`flex-grow flex flex-col items-center gap-2 transition-all duration-300 py-3 rounded-2xl ${activeTab === "sos" ? "text-[#ef4444] bg-[#991b1b]/10" : "text-[#52525b] hover:text-[#a1a1aa]"}`}
                    >
                        <Radio className="w-5 h-5" />
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em]">SOS</span>
                    </button>
                </div>
            </motion.nav>
        )}
    </main>
  );
}
