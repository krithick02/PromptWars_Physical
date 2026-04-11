"use client";

import { motion } from "framer-motion";
import { MapPin, ExternalLink } from "lucide-react";

/**
 * Tactical Venue Map integration using Google Maps Platform.
 * Displays the physical location of the stadium for geospatial operational context.
 */
export default function VenueMap() {
    // Standard stadium location (e.g., Wembley Stadium or a fictional one)
    const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15545.968037146549!2d80.201099151829!3d13.06733979848523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52668582046801%3A0xe536d5402013f982!2sJawaharlal%20Nehru%20Stadium!5e0!3m2!1sen!2sin!4v1712860000000!5m2!1sen!2sin";

    return (
        <div className="w-full bg-[#1c1c1f] rounded-[2rem] border border-white/[0.03] overflow-hidden shadow-executive">
            <div className="p-8 border-b border-white/[0.03] flex justify-between items-center">
                <div>
                    <h3 className="text-[#a1a1aa] font-bold text-[9px] tracking-[0.3em] uppercase opacity-60 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[#c2a87e]" /> Stadium Location
                    </h3>
                    <p className="text-[10px] text-[#fafafa] font-bold uppercase tracking-widest mt-2">Main Entrance</p>
                </div>
                <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl transition-all border border-white/5"
                    aria-label="Open full Google Maps view"
                >
                    <ExternalLink className="w-4 h-4 text-[#52525b]" />
                </a>
            </div>
            
            <div className="relative aspect-video w-full grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <iframe 
                    src={mapUrl}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true}
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Stadium Location Map"
                    className="absolute inset-0"
                />
                <div className="absolute inset-0 pointer-events-none shadow-[inner_0_0_40px_rgba(0,0,0,0.5)]" />
            </div>
            
            <div className="p-6 bg-[#09090b]/50">
                <div className="flex items-center gap-4 text-[9px] text-[#52525b] font-bold uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live Satellite Uplink Active
                </div>
            </div>
        </div>
    );
}
