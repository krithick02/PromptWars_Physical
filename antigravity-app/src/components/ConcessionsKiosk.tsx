"use client";

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Plus, Minus, ShoppingBag, CreditCard, Coffee, QrCode, X } from "lucide-react";
import { useMemo } from "react";
import { trackEvent } from "@/lib/firebase";

const MENU = [
  { id: "v1", name: "Potable Water",  price: 3, desc: "Still mineral water",  icon: "💧" },
  { id: "v2", name: "Premium Cola",   price: 4, desc: "Classic caramel soda", icon: "🥤" },
  { id: "f1", name: "Salted Popcorn", price: 6, desc: "Buttered corn kernels",icon: "🍿" },
  { id: "f2", name: "Classic Hot Dog",price: 5, desc: "Beef sausage in bun",  icon: "🌭" },
];

type Step = "initial" | "menu" | "processing" | "pickup";

/**
 * ConcessionsKiosk — Food & Drinks ordering panel.
 *
 * Performance:
 *  - React.memo: skips re-render when no props change.
 *  - useCallback: stable references for updateCart, processOrder, resetOrder.
 *  - useMemo: cartTotal and cartAmount only recomputed when cart changes.
 *  - trackEvent: logs concession orders to Firebase Analytics.
 */
const ConcessionsKiosk = memo(function ConcessionsKiosk() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [step, setStep] = useState<Step>("initial");

  const updateCart = useCallback((id: string, diff: number) => {
    setCart(prev => {
      const next = { ...prev };
      next[id] = Math.max(0, (next[id] || 0) + diff);
      if (next[id] === 0) delete next[id];
      return next;
    });
  }, []);

  const cartTotal = useMemo(
    () => MENU.reduce((acc, item) => acc + item.price * (cart[item.id] || 0), 0),
    [cart]
  );

  const cartAmount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart]
  );

  const processOrder = useCallback(() => {
    setStep("processing");
    trackEvent("concession_order_placed", { items: Object.keys(cart).length, total: cartTotal });
    setTimeout(() => setStep("pickup"), 2500);
  }, [cart, cartTotal]);

  const resetOrder = useCallback(() => {
    setCart({});
    setStep("initial");
    trackEvent("concession_order_reset");
  }, []);

  return (
    <div className="w-full bg-[#1c1c1f] border border-white/[0.03] rounded-[2rem] p-10 relative overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            step === "initial" ? "mb-6" : "mb-8 pb-8 border-b border-white/[0.03]"
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#c2a87e]/10 rounded-2xl border border-[#c2a87e]/20 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-[#c2a87e]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[#fafafa] font-medium text-sm tracking-tight uppercase flex items-center gap-3">
                <div className="w-1 h-4 bg-[#c2a87e] rounded-full" />
                Food &amp; Drinks
              </h3>
              <p className="text-[10px] text-[#71717a] font-bold uppercase tracking-[0.3em] leading-none mt-2">
                Order Snacks
              </p>
            </div>
          </div>
          {step === "menu" && (
            <button
              onClick={() => setStep("initial")}
              className="p-3 text-[#52525b] hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Initial CTA */}
          {step === "initial" && (
            <motion.button
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep("menu")}
              className="w-full bg-[#c2a87e] text-black py-6 rounded-2xl flex items-center justify-center gap-4 transition-all font-bold uppercase tracking-[0.25em] text-xs shadow-executive"
              aria-label="Open food and drinks menu"
            >
              Order Now
            </motion.button>
          )}

          {/* Menu */}
          {step === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-5 max-h-[400px] overflow-y-auto no-scrollbar scroll-smooth pr-1"
              role="list"
              aria-label="Menu items"
            >
              {MENU.map(item => (
                <div
                  key={item.id}
                  role="listitem"
                  className="bg-[#09090b] border border-white/[0.03] p-6 rounded-2xl flex flex-col gap-6 group hover:border-[#c2a87e]/30 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-5">
                      <div
                        className="text-3xl filter grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                        aria-hidden="true"
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#fafafa] tracking-tight">{item.name}</h3>
                        <p className="text-[10px] text-[#52525b] font-bold uppercase tracking-[0.2em] mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#c2a87e] font-bold text-base tabular-nums" aria-label={`Price: $${item.price}`}>
                      ${item.price}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-5">
                    <button
                      onClick={() => updateCart(item.id, -1)}
                      disabled={!cart[item.id]}
                      aria-label={`Remove one ${item.name}`}
                      className="w-9 h-9 flex items-center justify-center bg-[#1c1c1f] border border-white/5 rounded-xl hover:bg-[#27272a] text-[#52525b] hover:text-white transition-all disabled:opacity-20"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      className="text-xs font-bold tabular-nums w-4 text-center text-white"
                      aria-label={`${cart[item.id] || 0} in cart`}
                    >
                      {cart[item.id] || 0}
                    </span>
                    <button
                      onClick={() => updateCart(item.id, 1)}
                      aria-label={`Add one ${item.name}`}
                      className="w-9 h-9 flex items-center justify-center bg-[#c2a87e]/10 border border-[#c2a87e]/20 rounded-xl hover:bg-[#c2a87e] text-[#c2a87e] hover:text-black transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Sticky checkout button */}
              <div className="sticky bottom-0 pt-5 mt-2 bg-gradient-to-t from-[#1c1c1f] to-transparent">
                <AnimatePresence>
                  {cartAmount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={processOrder}
                      className="w-full bg-white text-black font-bold p-6 rounded-2xl flex justify-between items-center shadow-xl hover:bg-[#fafafa] transition-all duration-300 uppercase text-xs tracking-[0.2em]"
                      aria-label={`Confirm order — total $${cartTotal.toFixed(2)}`}
                    >
                      <div className="flex items-center gap-4">
                        <ShoppingBag className="w-5 h-5" /> Confirm
                      </div>
                      <div className="bg-[#f0f0f0] px-4 py-1.5 rounded-lg tabular-nums text-black border border-black/5">
                        ${cartTotal.toFixed(2)}
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Processing */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 min-h-[220px]"
              aria-live="polite"
              aria-label="Processing your order"
            >
              <div className="relative w-20 h-20 mb-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full rounded-full border-[2px] border-transparent border-t-[#c2a87e] border-r-[#c2a87e]"
                />
                <CreditCard className="w-6 h-6 text-[#c2a87e] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
              </div>
              <h3 className="font-bold tracking-[0.4em] text-[#fafafa] text-[9px] uppercase animate-pulse">Ordering</h3>
              <p className="text-[9px] text-[#71717a] mt-6 text-center uppercase font-bold tracking-widest">Almost ready...</p>
            </motion.div>
          )}

          {/* Pickup confirmation */}
          {step === "pickup" && (
            <motion.div
              key="pickup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 items-center py-5"
              aria-live="polite"
            >
              <div className="p-5 bg-[#c2a87e]/10 rounded-2xl text-[#c2a87e] border border-[#c2a87e]/20 mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-white font-light text-2xl tracking-tighter uppercase">
                #{Math.floor(Math.random() * 8999) + 1000}-ST
              </h3>
              <div className="bg-white p-6 rounded-[2rem] w-full max-w-[140px] aspect-square mx-auto mb-6 shadow-inner relative border-[6px] border-black/5 opacity-80">
                <QrCode className="w-full h-full text-black" strokeWidth={1.5} />
              </div>
              <button
                onClick={resetOrder}
                className="w-full bg-[#09090b] border border-white/5 rounded-2xl py-5 text-[9px] text-[#52525b] hover:text-white uppercase font-bold tracking-[0.3em] transition-all"
              >
                Back Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default ConcessionsKiosk;
