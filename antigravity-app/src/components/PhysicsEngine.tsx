"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Maximize2, Zap, Radio } from "lucide-react";
import ClientNotification from "./ClientNotification";

export default function PhysicsEngine() {
  const sceneRef = useRef<HTMLDivElement>(null);
  // Matter.js core references
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const gatesRef = useRef<{ [key: string]: Matter.Body }>({});
  const particlesRef = useRef<Matter.Body[]>([]);

  // Simulation State
  const [densities, setDensities] = useState({ gateA: 0.1, gateB: 0.5, gateC: 0.2 });
  const [antiGravity, setAntiGravity] = useState({ gateA: false, gateB: false, gateC: false });
  const [repulsiveField, setRepulsiveField] = useState({ gateA: false, gateB: false, gateC: false });
  const [showClientAlert, setShowClientAlert] = useState(false);

  // 1. Initialize Engine & Static World
  useEffect(() => {
    if (!sceneRef.current) return;

    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1;
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent",
      },
    });
    renderRef.current = render;

    // Boundary walls
    const wallOptions = { isStatic: true, render: { fillStyle: "#1a1a1a" } };
    Matter.World.add(engine.world, [
      Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, wallOptions),
      Matter.Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, wallOptions),
      Matter.Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, wallOptions),
    ]);

    // Gate bodies
    const gateOptions = { isStatic: false, density: 0.05, frictionAir: 0.1, render: { fillStyle: "#27272a", strokeStyle: "#c2a87e", lineWidth: 1 } };
    const gateA = Matter.Bodies.rectangle(window.innerWidth * 0.2, window.innerHeight * 0.6, 200, 80, { ...gateOptions, label: "Gate A" });
    const gateB = Matter.Bodies.rectangle(window.innerWidth * 0.5, window.innerHeight * 0.6, 200, 80, { ...gateOptions, label: "Gate B" });
    const gateC = Matter.Bodies.rectangle(window.innerWidth * 0.8, window.innerHeight * 0.6, 200, 80, { ...gateOptions, label: "Gate C" });
    
    gatesRef.current = { gateA, gateB, gateC };

    // Constraints (Tethers)
    const attach = (body: Matter.Body, x: number, y: number) => Matter.Constraint.create({
      pointA: { x, y }, bodyB: body, stiffness: 0.005, damping: 0.1, render: { visible: false }
    });

    Matter.World.add(engine.world, [
      gateA, gateB, gateC,
      attach(gateA, window.innerWidth * 0.2, window.innerHeight * 0.4),
      attach(gateB, window.innerWidth * 0.5, window.innerHeight * 0.4),
      attach(gateC, window.innerWidth * 0.8, window.innerHeight * 0.4),
    ]);

    // Mouse Interaction
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    Matter.Runner.run(engine);
    Matter.Render.run(render);

    // Particle Emitter
    const interval = setInterval(() => {
      const x = window.innerWidth * 0.5 + (Math.random() * 600 - 300);
      const particle = Matter.Bodies.circle(x, -20, Math.random() * 3 + 2, {
        friction: 0, restitution: 0.8, render: { fillStyle: "#a1a1aa", opacity: 0.4 }
      });
      Matter.World.add(engine.world, particle);
      particlesRef.current.push(particle);
      
      // Cleanup off-screen particles
      if (particlesRef.current.length > 50) {
        const oldest = particlesRef.current.shift();
        if (oldest) Matter.World.remove(engine.world, oldest);
      }
    }, 400);

    return () => {
      clearInterval(interval);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
    };
  }, []); // Once on mount

  // 2. Dynamic State Updates (The "Update Loop")
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const updateLoop = () => {
      const gates = gatesRef.current;
      if (!gates) return;

      // Handle Gate B (surges/anti-gravity)
      if (antiGravity.gateB) {
        Matter.Body.applyForce(gates.gateB, gates.gateB.position, { x: 0, y: -0.06 });
        gates.gateB.render.strokeStyle = "#22c55e"; // Success Green
        gates.gateB.render.lineWidth = 3;
      } else if (densities.gateB > 0.8) {
        Matter.Body.applyForce(gates.gateB, gates.gateB.position, { x: 0, y: 0.1 }); // Sinking
        gates.gateB.render.strokeStyle = "#ef4444"; // Danger Red
        gates.gateB.render.lineWidth = 3;
      } else {
        gates.gateB.render.strokeStyle = "#c2a87e";
        gates.gateB.render.lineWidth = 1;
      }

      // Repulsive Field logic for particles
      if (repulsiveField.gateB) {
        const allBodies = Matter.Composite.allBodies(engine.world);
        allBodies.forEach(body => {
          if (body.label === "Gate B" || body.isStatic) return;
          const dist = Matter.Vector.magnitude(Matter.Vector.sub(gates.gateB.position, body.position));
          if (dist < 320) {
            const force = 0.007 * (320 - dist) / 320;
            Matter.Body.applyForce(body, body.position, {
              x: body.position.x < gates.gateB.position.x ? -force : force, y: -force * 0.5
            });
          }
        });
      }
    };

    Matter.Events.on(engine, 'beforeUpdate', updateLoop);
    return () => Matter.Events.off(engine, 'beforeUpdate', updateLoop);
  }, [antiGravity, densities, repulsiveField]);

  const triggerSurge = () => {
      setDensities(prev => ({ ...prev, gateB: 0.9 })); 
      setTimeout(() => setRepulsiveField(prev => ({ ...prev, gateB: true })), 2000);
  };

  const triggerAntiGravity = () => {
      setAntiGravity(prev => ({ ...prev, gateB: true }));
      setShowClientAlert(true);
      setTimeout(() => setShowClientAlert(false), 8000);
  };

  const resetSimulation = () => {
      setDensities(prev => ({ ...prev, gateB: 0.5 }));
      setAntiGravity(prev => ({ ...prev, gateB: false }));
      setRepulsiveField(prev => ({ ...prev, gateB: false }));
      setShowClientAlert(false);
  }

  return (
    <div className="relative w-full h-screen bg-[#09090b] overflow-hidden font-sans text-white">
      <div ref={sceneRef} className="absolute inset-0 z-0 pointer-events-auto" />

      <div className="absolute inset-0 z-10 pointer-events-none p-12 flex flex-col justify-between">
        <header className="flex justify-between items-start">
          <div className="bg-[#141416]/80 backdrop-blur-xl border border-white/[0.05] p-8 rounded-2xl max-w-lg pointer-events-auto shadow-2xl">
            <h1 className="text-2xl font-medium tracking-tight mb-2 text-[#fafafa] flex items-center gap-4">
              <Radio className="w-5 h-5 text-[#c2a87e]" />
              Equilibrium Orchestration
            </h1>
            <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest leading-relaxed">
              Kinematic System Domain. Load balancing active. 
              Deploy structural assets to modulate pressure points.
            </p>
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={triggerSurge}
                className="px-8 py-3 bg-[#991b1b]/10 hover:bg-[#991b1b]/20 text-[#ef4444] border border-[#991b1b]/30 rounded-xl transition text-[10px] font-bold uppercase tracking-widest"
              >
                  Simulate Breach
              </button>
              <button 
                onClick={resetSimulation}
                className="px-8 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-[#a1a1aa] border border-white/[0.05] rounded-xl transition text-[10px] font-bold uppercase tracking-widest"
              >
                  Reset Topology
              </button>
          </div>
        </header>

        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-4 pointer-events-auto">
          {densities.gateB > 0.8 && !antiGravity.gateB && (
              <motion.button 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ scale: 1.02, backgroundColor: '#c2a87e', color: '#000' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={triggerAntiGravity}
                  className="bg-white text-black font-bold px-12 py-5 rounded-2xl flex items-center gap-4 shadow-2xl uppercase tracking-[0.2em] text-xs transition-all"
              >
                  <Maximize2 className="w-5 h-5" />
                  INITIATE SYSTEM EQUILIBRIUM
              </motion.button>
          )}

          {repulsiveField.gateB && (
               <div className="bg-[#2d1515] px-10 py-5 rounded-2xl flex items-center gap-4 text-[#ef4444] font-bold border border-[#991b1b]/30 uppercase tracking-[0.2em] text-xs shadow-lg">
                 <ShieldAlert className="w-5 h-5" />
                 Redirection System Engaged
               </div>
          )}
        </div>
      </div>

      <div className="absolute left-12 bottom-1/2 transform translate-y-1/2 bg-[#141416]/80 backdrop-blur-xl p-6 rounded-2xl pointer-events-auto flex flex-col gap-4 border border-white/5 shadow-2xl">
          <h3 className="text-[9px] uppercase text-[#52525b] font-bold tracking-widest mb-2">Tactical Assets</h3>
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa] hover:bg-white/[0.08] transition-all">
              Security Detachment
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa] hover:bg-white/[0.08] transition-all">
              Crowd Logistics Unit
          </div>
      </div>

      <AnimatePresence>
        {showClientAlert && <ClientNotification />}
      </AnimatePresence>
    </div>
  );
}
