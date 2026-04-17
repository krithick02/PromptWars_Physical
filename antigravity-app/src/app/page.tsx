"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import StadiumBlueprint from "@/components/StadiumBlueprint";
import CrowdMetrics from "@/components/CrowdMetrics";
import ConcessionsKiosk from "@/components/ConcessionsKiosk";
import ServiceStreams from "@/components/ServiceStreams";
import EmergencySOS from "@/components/EmergencySOS";
import CriticalCrowdAlert from "@/components/CriticalCrowdAlert";
import AttendeePortalPanel from "@/components/AttendeePortalPanel";
import { StadiumState } from "@/lib/types";
import { useStadiumSimulation } from "@/lib/useStadiumSimulation";
import { getPredictiveInsights } from "@/lib/googleServices";

const INITIAL_STATE: StadiumState = {
  stage:     { id: "stage",     name: "Stage restricted area", count: 150,  capacity: 500,  waitTime: 0 },
  vip:       { id: "vip",       name: "VIP Zone",              count: 650,  capacity: 1500, waitTime: 2 },
  zoneA:     { id: "zoneA",     name: "General Admission A",   count: 2200, capacity: 5000, waitTime: 5 },
  zoneB:     { id: "zoneB",     name: "General Admission B",   count: 2800, capacity: 5000, waitTime: 6 },
  foodCourt: { id: "foodCourt", name: "Food Court",            count: 1200, capacity: 2500, waitTime: 12 },
  restrooms: { id: "restrooms", name: "Restrooms",             count: 120,  capacity: 300,  waitTime: 5 },
};

export default function Home() {
  const { stadium, criticalZone, setCriticalZone } = useStadiumSimulation(INITIAL_STATE);
  const [selectedRouteZone, setSelectedRouteZone] = useState<string>("");
  const [showAttendeePortal, setShowAttendeePortal] = useState(false);

  const openAttendee  = useCallback(() => setShowAttendeePortal(true),  []);
  const closeAttendee = useCallback(() => setShowAttendeePortal(false), []);

  // Google Services: Trigger Gemini Predictive AI insights in the background for operations
  useEffect(() => {
    getPredictiveInsights(stadium).then((insights) => {
      if (insights) console.debug("Gemini Operations AI Active:", insights);
    });
  }, [stadium]);

  return (
    <main 
      className="w-full h-screen bg-[#09090b] overflow-hidden flex font-sans text-[#fafafa] relative"
      aria-label="Tactical Stadium Layout"
    >

      {/* ── Critical Modal Alert ─────────────────────────────────────────────── */}
      <CriticalCrowdAlert
        isVisible={!!criticalZone}
        zoneName={criticalZone?.name || ""}
        density={criticalZone?.density || 0}
        onClose={() => setCriticalZone(null)}
      />

      {/* ── Left HUD: Command Overview ───────────────────────────────────────── */}
      <div className="w-[440px] shrink-0 h-full relative z-20 shadow-[40px_0_100px_rgba(0,0,0,0.8)] border-r border-white/[0.03]">
        <CrowdMetrics
          stadium={stadium}
          selectedRouteZone={selectedRouteZone}
          onSelectRouteZone={setSelectedRouteZone}
        />
      </div>

      {/* ── Central Viewport: Strategic Map ─────────────────────────────────── */}
      <div className="flex-grow h-full relative bg-[#09090b]">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <StadiumBlueprint stadium={stadium} selectedRouteZone={selectedRouteZone} />

        {/* ── Attendee Portal Toggle Button ───────────────────────────────── */}
        <motion.button
          onClick={openAttendee}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="absolute top-6 right-6 z-30 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#c2a87e] text-black font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-[#d4ba90] transition-colors"
          aria-label="Open attendee portal"
          aria-expanded={showAttendeePortal}
        >
          <Users className="w-4 h-4" />
          Attendee View
        </motion.button>
      </div>

      {/* ── Right HUD: Service & Emergency ──────────────────────────────────── */}
      <div className="w-[440px] shrink-0 h-full relative z-20 bg-[#141416] flex flex-col p-10 gap-10 border-l border-white/[0.03] shadow-[-40px_0_100px_rgba(0,0,0,0.8)] overflow-y-auto no-scrollbar">
        
        {/* Google Cloud Branding Mock */}
        <div className="p-6 bg-[#0d0d0e] border border-[#4285f4]/30 rounded-2xl flex flex-col gap-4 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#4285f4] rounded-sm" />
                    <span className="text-[10px] font-bold text-[#fafafa] uppercase tracking-widest">Google Cloud Ops Manager</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest">Active</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 opacity-60">
                <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-[#71717a]">
                    <span>Firestore Streams</span>
                    <span className="text-[#fafafa]">6 active</span>
                </div>
                <div className="w-full bg-white/[0.05] h-1 rounded-full overflow-hidden">
                    <div className="bg-[#4285f4] h-full w-[85%] animate-pulse" />
                </div>
                <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-[#71717a] mt-1">
                    <span>GA4 Telemetry</span>
                    <span className="text-[#fafafa]">Synced</span>
                </div>
            </div>
        </div>

        <div className="shrink-0"><ConcessionsKiosk /></div>
        <div className="shrink-0"><ServiceStreams /></div>
        <div className="shrink-0"><EmergencySOS /></div>
      </div>

      {/* ── Attendee Portal Slide-in Panel ───────────────────────────────────── */}
      <AnimatePresence>
        {showAttendeePortal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={closeAttendee}
              aria-hidden="true"
            />
            {/* Panel */}
            <AttendeePortalPanel key="panel" onClose={closeAttendee} />
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
