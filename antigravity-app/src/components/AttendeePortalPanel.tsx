"use client";

import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Ticket, UtensilsCrossed, Radio, Activity,
  QrCode, Navigation, Clock, TrendingUp, TrendingDown,
  Minus as Minus2, Plus, Minus, ShoppingBag, AlertTriangle,
  CheckCircle2, CreditCard, Coffee
} from "lucide-react";
import EmergencySOS from "./EmergencySOS";

// ─── Menu items ───────────────────────────────────────────────────────────────
const MENU = [
  { id: "v1", name: "Potable Water",  price: 3, desc: "Still mineral water",  icon: "💧" },
  { id: "v2", name: "Premium Cola",   price: 4, desc: "Classic caramel soda", icon: "🥤" },
  { id: "f1", name: "Salted Popcorn", price: 6, desc: "Buttered corn kernels",icon: "🍿" },
  { id: "f2", name: "Classic Hot Dog",price: 5, desc: "Beef sausage in bun",  icon: "🌭" },
];

const ZONES_INITIAL = [
  { id: "gate-a",    name: "Gate A",      capacity: 2000, count: 820,  waitTime: 4,  icon: "🅰️" },
  { id: "gate-b",    name: "Gate B",      capacity: 2000, count: 1560, waitTime: 11, icon: "🅱️" },
  { id: "gate-c",    name: "Gate C",      capacity: 2000, count: 1840, waitTime: 18, icon: "🆒" },
  { id: "food-ct",   name: "Food Court",  capacity: 2500, count: 1900, waitTime: 22, icon: "🍔" },
  { id: "restrooms", name: "Restrooms",   capacity: 300,  count: 155,  waitTime: 6,  icon: "🚻" },
  { id: "merch",     name: "Merch Stand", capacity: 400,  count: 210,  waitTime: 8,  icon: "👕" },
];

type Tab = "ticket" | "status" | "food" | "sos";

interface Props {
  onClose: () => void;
}

/**
 * AttendeePortalPanel — Slide-in attendee experience embedded in the ops dashboard.
 * Contains: digital ticket, live crowd status, food ordering, and emergency SOS.
 * Wrapped in React.memo — only re-renders when onClose reference changes.
 */
const AttendeePortalPanel = memo(function AttendeePortalPanel({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("status");

  // ── Crowd Status ────────────────────────────────────────────────────────────
  const [zones, setZones] = useState(ZONES_INITIAL);

  useEffect(() => {
    const tick = setInterval(() => {
      setZones(prev => prev.map(z => {
        const change   = Math.floor(Math.random() * 60) - 20;
        const newCount = Math.max(z.capacity * 0.3, Math.min(z.count + change, z.capacity * 0.95));
        const ratio    = newCount / z.capacity;
        const waitTime = Math.round(
          Math.pow(ratio, 2) * (z.id === "food-ct" ? 45 : z.id === "restrooms" ? 20 : 25)
        );
        return { ...z, count: Math.round(newCount), waitTime };
      }));
    }, 2000);
    return () => clearInterval(tick);
  }, []);

  const recommendedZone = useMemo(
    () => [...zones].sort((a, b) => (a.count / a.capacity) - (b.count / b.capacity))[0],
    [zones]
  );

  const getStatus = useCallback((count: number, capacity: number) => {
    const r = count / capacity;
    if (r >= 0.85) return { label: "Busy",     color: "#ef4444", bg: "#991b1b", Icon: TrendingUp   };
    if (r >= 0.60) return { label: "Moderate", color: "#f59e0b", bg: "#b45309", Icon: Minus2        };
    return              { label: "Open",     color: "#22c55e", bg: "#166534", Icon: TrendingDown  };
  }, []);

  // ── Food ordering ───────────────────────────────────────────────────────────
  const [cart, setCart]           = useState<Record<string, number>>({});
  const [orderStep, setOrderStep] = useState<"menu" | "processing" | "pickup">("menu");

  const updateCart = useCallback((id: string, diff: number) => {
    setCart(prev => {
      const next = { ...prev };
      next[id] = Math.max(0, (next[id] || 0) + diff);
      if (next[id] === 0) delete next[id];
      return next;
    });
  }, []);

  const cartTotal  = useMemo(() => MENU.reduce((acc, item) => acc + item.price * (cart[item.id] || 0), 0), [cart]);
  const cartAmount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  const placeOrder = useCallback(() => {
    setOrderStep("processing");
    setTimeout(() => setOrderStep("pickup"), 2500);
  }, []);

  const resetOrder = useCallback(() => {
    setCart({});
    setOrderStep("menu");
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-[420px] z-50 flex flex-col bg-[#09090b] border-l border-white/[0.06] shadow-[-40px_0_100px_rgba(0,0,0,0.8)]"
      role="dialog"
      aria-modal="true"
      aria-label="Attendee Experience Panel"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-white/[0.04] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-[#c2a87e] rounded-full" />
          <div>
            <h2 className="text-sm font-medium uppercase tracking-tight text-[#fafafa]">Attendee Portal</h2>
            <p className="text-[9px] text-[#52525b] font-bold uppercase tracking-[0.3em] mt-0.5">Live Venue Companion</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-[#52525b] hover:text-white transition-all"
          aria-label="Close attendee portal"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        <AnimatePresence mode="wait">

          {/* TICKET ─────────────────────────────────────────────────────────── */}
          {activeTab === "ticket" && (
            <motion.div
              key="ticket"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-full bg-[#141416] border border-[#c2a87e]/10 rounded-[2rem] p-8 flex flex-col items-center gap-6">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-[#c2a87e] font-bold uppercase tracking-[0.3em]">Authorized</p>
                    <p className="text-white font-light text-xl tracking-tight mt-1">Section A-1</p>
                  </div>
                  <div className="p-3 bg-[#c2a87e]/10 rounded-xl border border-[#c2a87e]/20">
                    <QrCode className="w-5 h-5 text-[#c2a87e]" />
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[1.5rem] w-full aspect-square flex items-center justify-center border-[8px] border-black/5 opacity-80">
                  <QrCode className="w-full h-full text-black" strokeWidth={1} />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-sm">ST_AUTH_0012</p>
                  <p className="text-[9px] text-[#52525b] font-bold uppercase tracking-widest mt-2 leading-relaxed">Show this at all entry points and scanners</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATUS ─────────────────────────────────────────────────────────── */}
          {activeTab === "status" && (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="flex flex-col gap-4"
              role="region"
              aria-label="Live venue crowd status"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-white font-medium text-sm uppercase tracking-tight">Live Status</h3>
                  <p className="text-[9px] text-[#52525b] font-bold uppercase tracking-[0.3em] mt-0.5">Updates every 2s</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#166534]/10 border border-[#166534]/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-green-400">Live</span>
                </div>
              </div>

              {/* Recommended banner */}
              <div className="bg-[#0d2318] border border-[#166534]/40 rounded-2xl p-6" role="alert" aria-live="polite">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20 shrink-0">
                    <Navigation className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-green-400 mb-1">Best Route Now</p>
                    <p className="text-white font-medium text-sm">{recommendedZone.name}</p>
                    <p className="text-[9px] text-[#71717a] font-bold uppercase tracking-widest mt-1">
                      {Math.round((recommendedZone.count / recommendedZone.capacity) * 100)}% full · ~{recommendedZone.waitTime} min wait
                    </p>
                  </div>
                  <span className="text-2xl shrink-0">{recommendedZone.icon}</span>
                </div>
                <p className="text-[9px] text-green-300/50 font-bold uppercase tracking-widest mt-4 leading-relaxed">
                  Fastest entry with minimal queuing.
                </p>
              </div>

              {/* Zone list */}
              <div className="flex flex-col gap-2.5" role="list">
                {zones.map(zone => {
                  const ratio  = zone.count / zone.capacity;
                  const s      = getStatus(zone.count, zone.capacity);
                  const isBest = zone.id === recommendedZone.id;

                  return (
                    <motion.div
                      key={zone.id} layout role="listitem"
                      className={`rounded-xl p-5 border flex flex-col gap-3 transition-all ${
                        isBest ? "bg-[#0d2318]/60 border-green-500/30" : "bg-[#141416] border-white/[0.04]"
                      }`}
                      aria-label={`${zone.name}: ${s.label}, ${Math.round(ratio * 100)}% full, ${zone.waitTime} min wait`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl" aria-hidden="true">{zone.icon}</span>
                          <div>
                            <h4 className="text-white font-bold text-xs tracking-tight flex items-center gap-2">
                              {zone.name}
                              {isBest && (
                                <span className="text-[7px] font-bold uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full">
                                  Best
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock className="w-2.5 h-2.5 text-[#52525b]" aria-hidden="true" />
                              <span className="text-[8px] text-[#52525b] font-bold uppercase tracking-widest">~{zone.waitTime} min</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: `${s.bg}20`, border: `1px solid ${s.bg}40`, color: s.color }}>
                            <s.Icon className="w-2.5 h-2.5" />
                            {s.label}
                          </div>
                          <span className="text-base font-light tabular-nums" style={{ color: s.color }}>
                            {Math.round(ratio * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#09090b] h-0.5 rounded-full overflow-hidden"
                        role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
                        <motion.div className="h-full rounded-full"
                          animate={{ width: `${ratio * 100}%` }}
                          transition={{ ease: "linear", duration: 0.8 }}
                          style={{ backgroundColor: s.color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-5 pt-2 pb-1">
                {[
                  { color: "#22c55e", label: "Open" },
                  { color: "#f59e0b", label: "Moderate" },
                  { color: "#ef4444", label: "Busy" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#52525b]">{l.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* FOOD ────────────────────────────────────────────────────────────── */}
          {activeTab === "food" && (
            <motion.div
              key="food"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="flex flex-col gap-4"
            >
              <AnimatePresence mode="wait">
                {orderStep === "menu" && (
                  <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                    <h3 className="text-white font-medium text-sm uppercase tracking-tight mb-1">Order Food & Drinks</h3>
                    {MENU.map(item => (
                      <div key={item.id} className="bg-[#141416] border border-white/[0.04] rounded-xl p-5 flex items-center justify-between group hover:border-[#c2a87e]/20 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{item.icon}</span>
                          <div>
                            <p className="text-white font-medium text-xs tracking-tight">{item.name}</p>
                            <p className="text-[#c2a87e] font-bold text-xs mt-0.5">${item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateCart(item.id, -1)} disabled={!cart[item.id]}
                            aria-label={`Remove ${item.name}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#09090b] border border-white/5 text-[#52525b] hover:text-white transition-all disabled:opacity-20">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center tabular-nums text-white">{cart[item.id] || 0}</span>
                          <button onClick={() => updateCart(item.id, 1)}
                            aria-label={`Add ${item.name}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#c2a87e]/10 border border-[#c2a87e]/20 text-[#c2a87e] hover:bg-[#c2a87e] hover:text-black transition-all">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <AnimatePresence>
                      {cartAmount > 0 && (
                        <motion.button
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                          onClick={placeOrder}
                          className="w-full bg-white text-black font-bold p-5 rounded-xl flex justify-between items-center shadow-xl uppercase text-[10px] tracking-[0.2em] hover:bg-[#fafafa] transition-all"
                          aria-label={`Confirm order — $${cartTotal.toFixed(2)}`}
                        >
                          <div className="flex items-center gap-3"><ShoppingBag className="w-4 h-4" /> Confirm</div>
                          <div className="bg-[#f0f0f0] px-3 py-1 rounded-lg tabular-nums border border-black/5">${cartTotal.toFixed(2)}</div>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {orderStep === "processing" && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16" aria-live="polite">
                    <div className="relative w-16 h-16 mb-8">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full rounded-full border-2 border-transparent border-t-[#c2a87e] border-r-[#c2a87e]" />
                      <CreditCard className="w-5 h-5 text-[#c2a87e] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
                    </div>
                    <p className="text-white font-bold text-[9px] uppercase tracking-[0.4em] animate-pulse">Processing</p>
                  </motion.div>
                )}

                {orderStep === "pickup" && (
                  <motion.div key="pickup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-5 py-6" aria-live="polite">
                    <div className="p-4 bg-[#c2a87e]/10 rounded-2xl border border-[#c2a87e]/20 text-[#c2a87e]">
                      <Coffee className="w-7 h-7" />
                    </div>
                    <p className="text-white font-light text-xl tracking-tighter uppercase">
                      #{Math.floor(Math.random() * 8999) + 1000}-ST
                    </p>
                    <div className="bg-white p-6 rounded-[1.5rem] w-32 h-32 flex items-center justify-center border-[6px] border-black/5 opacity-80">
                      <QrCode className="w-full h-full text-black" strokeWidth={1.5} />
                    </div>
                    <p className="text-[9px] text-[#52525b] font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                      Show this QR at the collection point
                    </p>
                    <button onClick={resetOrder}
                      className="w-full bg-[#141416] border border-white/5 rounded-xl py-4 text-[9px] text-[#52525b] hover:text-white uppercase font-bold tracking-[0.3em] transition-all">
                      Order Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* SOS ─────────────────────────────────────────────────────────────── */}
          {activeTab === "sos" && (
            <motion.div
              key="sos"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="flex flex-col gap-5"
            >
              <EmergencySOS />
              <div className="p-6 bg-[#141416] rounded-2xl border border-[#991b1b]/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2.5 bg-[#991b1b]/10 rounded-xl border border-[#991b1b]/20">
                    <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                  </div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#fafafa]">Authorization Note</h4>
                </div>
                <p className="text-[9px] text-[#71717a] leading-relaxed font-bold uppercase tracking-[0.15em]">
                  All signals are logged and prioritized. Only use for genuine emergencies.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Bottom navigation ───────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-6 pt-3 border-t border-white/[0.04] bg-[#09090b]">
        <nav className="bg-[#141416] border border-white/[0.04] rounded-2xl p-2 flex" aria-label="Attendee portal navigation">
          {([
            { id: "ticket", label: "Ticket", Icon: Ticket   },
            { id: "status", label: "Status", Icon: Activity  },
            { id: "food",   label: "Food",   Icon: UtensilsCrossed },
            { id: "sos",    label: "SOS",    Icon: Radio     },
          ] as { id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              aria-label={label}
              aria-pressed={activeTab === id}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all duration-300 ${
                id === "sos"
                  ? activeTab === id ? "text-[#ef4444] bg-[#991b1b]/10" : "text-[#52525b] hover:text-[#a1a1aa]"
                  : activeTab === id ? "text-[#c2a87e] bg-[#c2a87e]/10" : "text-[#52525b] hover:text-[#a1a1aa]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[7px] font-bold uppercase tracking-[0.2em]">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
});

export default AttendeePortalPanel;
