"use client";

import { useState } from "react";
import StadiumBlueprint from "@/components/StadiumBlueprint";
import CrowdMetrics from "@/components/CrowdMetrics";
import ConcessionsKiosk from "@/components/ConcessionsKiosk";
import ServiceStreams from "@/components/ServiceStreams";
import EmergencySOS from "@/components/EmergencySOS";
import CriticalCrowdAlert from "@/components/CriticalCrowdAlert";
import { StadiumState } from "@/lib/types";
import { useStadiumSimulation } from "@/lib/useStadiumSimulation";

const INITIAL_STATE: StadiumState = {
  stage: { id: "stage", name: "Stage restricted area", count: 150, capacity: 500, waitTime: 0 },
  vip: { id: "vip", name: "VIP Zone", count: 650, capacity: 1500, waitTime: 2 },
  zoneA: { id: "zoneA", name: "General Admission A", count: 2200, capacity: 5000, waitTime: 5 },
  zoneB: { id: "zoneB", name: "General Admission B", count: 2800, capacity: 5000, waitTime: 6 },
  foodCourt: { id: "foodCourt", name: "Food Court", count: 1200, capacity: 2500, waitTime: 12 },
  restrooms: { id: "restrooms", name: "Restrooms", count: 120, capacity: 300, waitTime: 5 }
};

export default function Home() {
  const { stadium, criticalZone, setCriticalZone } = useStadiumSimulation(INITIAL_STATE);
  const [selectedRouteZone, setSelectedRouteZone] = useState<string>("");

  return (
    <main className="w-full h-screen bg-[#09090b] overflow-hidden flex font-sans text-[#fafafa] relative">
      
      {/* Critical Modal Alert */}
      <CriticalCrowdAlert 
        isVisible={!!criticalZone} 
        zoneName={criticalZone?.name || ""} 
        density={criticalZone?.density || 0} 
        onClose={() => setCriticalZone(null)}
      />

      {/* Left HUD: Command Overview */}
      <div className="w-[440px] shrink-0 h-full relative z-20 shadow-[40px_0_100px_rgba(0,0,0,0.8)] border-r border-white/[0.03]">
        <CrowdMetrics stadium={stadium} selectedRouteZone={selectedRouteZone} onSelectRouteZone={setSelectedRouteZone} />
      </div>

      {/* Central Viewport: Strategic Map */}
      <div className="flex-grow h-full relative bg-[#09090b]">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         <StadiumBlueprint stadium={stadium} selectedRouteZone={selectedRouteZone} />
      </div>

      {/* Right HUD: Service & Emergency (Signal Nodes) */}
      <div className="w-[440px] shrink-0 h-full relative z-20 bg-[#141416] flex flex-col p-10 gap-10 border-l border-white/[0.03] shadow-[-40px_0_100px_rgba(0,0,0,0.8)] overflow-y-auto no-scrollbar">
          <div className="shrink-0"><ConcessionsKiosk /></div>
          <div className="shrink-0"><ServiceStreams /></div>
          <div className="shrink-0"><EmergencySOS /></div>
      </div>
      
    </main>
  );
}
