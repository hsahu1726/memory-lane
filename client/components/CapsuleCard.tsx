"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSkull, FaGem, FaHourglassHalf, FaLock, FaUsers, FaImage } from "react-icons/fa";
import Link from "next/link";

interface CapsuleProps {
  _id: string;
  title: string;
  unlockDate: string;
  status: "LOCKED" | "UNLOCKED";
  // 🆕 NEW FIELDS
  image?: string;
  theme?: string;
  eventType?: string;
  contributors?: string;
}

export default function CapsuleCard({ capsule }: { capsule: CapsuleProps }) {
  // 1. LIVE COUNTDOWN STATE
  const [timeLeft, setTimeLeft] = useState("");
  const [isTimeUp, setIsTimeUp] = useState(capsule.status === "UNLOCKED");

  // 2. THE TICKING LOGIC
  useEffect(() => {
    if (isTimeUp) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const unlockTime = new Date(capsule.unlockDate).getTime();
      const distance = unlockTime - now;

      if (distance < 0) {
        setIsTimeUp(true);
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [capsule.unlockDate, isTimeUp]);

  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: -1 }}
      className={`relative p-6 rounded-xl border-4 shadow-2xl transition-all flex flex-col justify-between overflow-hidden
      ${!isTimeUp 
        ? "bg-[#0d1117] border-gray-800 text-gray-400"  // Locked Style
        : "bg-gradient-to-br from-[#161b22] to-[#0d1117] border-amber-600/50 text-amber-50" // Unlocked Style
      }`}
    >
      
      {/* 🏷️ META BADGES (Theme & Event) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Theme Badge */}
        <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-400">
            {capsule.theme || "General"}
        </span>
        
        {/* Event Badge (Only if specific event selected) */}
        {capsule.eventType && capsule.eventType !== "None" && (
            <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-900/30 px-2 py-1 rounded border border-amber-700/50 text-amber-500">
                {capsule.eventType}
            </span>
        )}

        {/* Has Image Indicator (Locked State) */}
        {capsule.image && !isTimeUp && (
            <span className="text-[9px] flex items-center gap-1 bg-blue-900/30 px-2 py-1 rounded border border-blue-700/50 text-blue-400">
                <FaImage /> Media Attached
            </span>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-2 border-b border-white/5 pb-3">
        <h3 className={`text-xl font-serif font-bold tracking-wider leading-tight ${isTimeUp ? "text-amber-100" : "text-gray-500"}`}>
          {capsule.title}
        </h3>
        <div className="text-xl pl-2">
          {!isTimeUp ? <FaLock className="text-gray-700" /> : <FaGem className="text-amber-500 animate-pulse" />}
        </div>
      </div>

      {/* Contributors (Collaboration Mode) */}
      {capsule.contributors && (
        <div className="text-[10px] text-gray-500 flex items-center gap-2 mb-4 italic">
            <FaUsers /> with {capsule.contributors}
        </div>
      )}

      {/* 🖼️ UNLOCKED IMAGE PREVIEW */}
      {isTimeUp && capsule.image && (
          <div className="w-full h-32 mb-4 rounded-lg overflow-hidden border border-amber-500/30 relative group">
              {/* Note: Ensure your server runs on localhost:5000 */}
              <img 
                src={`http://localhost:5000${capsule.image}`} 
                alt="Memory" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
          </div>
      )}

      {/* Countdown Section */}
      <div className="space-y-3 font-mono text-sm mt-auto">
        {!isTimeUp && (
            <>
                <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
                <FaHourglassHalf className="animate-spin-slow text-amber-700" />
                <span>Unsealing in:</span>
                </div>
                
                {/* The Live Timer */}
                <div className="text-xl font-bold text-red-500/80 font-mono tracking-widest bg-black/40 p-3 rounded text-center border border-red-900/30 shadow-inner">
                    {timeLeft || "Calculating..."}
                </div>
            </>
        )}

        {isTimeUp && (
             <div className="flex items-center gap-2 text-xs text-amber-500 uppercase tracking-widest mb-2">
                <FaSkull />
                <span>The seal is broken!</span>
             </div>
        )}
      </div>

      {/* The Button */}
      {isTimeUp && (
        <Link href={`/view/${capsule._id}`} className="mt-4 block">
            <button className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-serif font-bold tracking-[0.2em] uppercase border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all rounded-sm text-xs">
              Claim Treasure
            </button>
        </Link>
      )}
    </motion.div>
  );
}