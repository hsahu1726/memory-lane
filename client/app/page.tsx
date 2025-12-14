"use client";
import { useEffect, useState } from "react";
import CapsuleCard from "../components/CapsuleCard";
import Link from "next/link";
import axios from "axios";
import { FaSkullCrossbones, FaMapMarkedAlt, FaSearch, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Home() {
  const [capsules, setCapsules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCapsules = async () => {
      // 1. CRITICAL: Retrieve the JWT token
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.warn("User not logged in. Cannot fetch personalized map.");
        // You might want to redirect to login here if you want to enforce auth on the homepage
        // router.push('/login'); 
        setCapsules([]); // Clear any old data
        return;
      }

      try {
        // 2. Send the token in the Authorization header
        const res = await axios.get("http://localhost:5000/api/capsules", {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
        setCapsules(res.data);
      } catch (error: any) {
        // If the token is invalid or expired, the server will return 401
        if (error.response && error.response.status === 401) {
            console.error("Session expired or invalid token. Redirecting to login.");
            localStorage.removeItem('authToken'); // Clean up bad token
            // router.push('/login'); // Uncomment if using useRouter
        } else {
            console.error("Error fetching treasures:", error);
        }
      }
    };
    fetchCapsules();
  }, []);

  // Filter Logic
  const filteredCapsules = capsules.filter((c: any) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black/50 text-gray-200 font-serif selection:bg-red-900 selection:text-white flex flex-col">

      {/* 🏴‍☠️ NAVBAR */}
      <header className="sticky top-0 z-50 px-8 py-5 border-b border-white/5 bg-black/60 backdrop-blur-md flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-all">

        {/* Logo */}
        <div className="flex items-center gap-4 group cursor-pointer min-w-[200px]">
            <div className="relative">
              <FaSkullCrossbones className="text-4xl text-amber-600 drop-shadow-[0_0_15px_rgba(217,119,6,0.3)] group-hover:animate-wiggle transition-transform" />
            </div>
            <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-gray-200 tracking-[0.2em] uppercase font-serif text-shadow-sm group-hover:text-amber-500 transition-colors">
                  Dead Man's Chest
                </h1>
            </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search for lost loot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0a0f14]/80 border border-gray-800 text-gray-300 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-amber-700/50 focus:ring-1 focus:ring-amber-900 font-serif tracking-wide placeholder-gray-600 transition-all shadow-inner"
                />
            </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
            <Link href="/create">
              <button className="hidden sm:flex relative overflow-hidden px-6 py-2.5 bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50 font-serif font-bold tracking-widest uppercase border border-amber-500/30 rounded shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:-translate-y-0.5 transition-all group">
                <span className="relative z-10 flex items-center gap-2 text-xs">
                   <FaMapMarkedAlt /> Bury Secret
                </span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              </button>
            </Link>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <div className="text-right hidden lg:block">
                    <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">Captain</p>
                    <p className="text-sm font-bold text-amber-500 font-serif">Jack Sparrow</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-900 border border-amber-700/50 p-0.5 overflow-hidden cursor-pointer hover:border-amber-400 transition-colors shadow-lg">
                    <img
                        src="https://ui-avatars.com/api/?name=Jack+Sparrow&background=d97706&color=fff"
                        alt="avatar"
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
            </div>
        </div>
      </header>

      {/* 🗺️ TREASURE GRID */}
      <div className="max-w-6xl mx-auto p-10 flex-grow w-full">
        {filteredCapsules.length === 0 ? (
          <div className="text-center mt-20 opacity-50">
            <FaSkullCrossbones className="text-6xl mx-auto mb-4" />
            <p className="text-xl">
                {searchTerm ? "No treasure found with that name." : "The map is empty, Captain."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCapsules.map((capsule: any) => (
              <CapsuleCard key={capsule._id} capsule={capsule} />
            ))}
          </div>
        )}
      </div>

      {/* ⚓ NEW GRID FOOTER */}
      <footer className="w-full border-t border-white/5 bg-[#05080a]/60 backdrop-blur-md mt-12 transition-all">
        {/* Changed to GRID to ensure perfect centering */}
        <div className="w-full px-8 py-6 grid grid-cols-1 md:grid-cols-3 items-center gap-4">

          {/* Left: Navigation Links */}
          <div className="flex gap-6 justify-center md:justify-start text-xs text-gray-400 tracking-widest uppercase font-bold">
             <Link href="/" className="hover:text-amber-500 transition-colors">Captain's Log</Link>
             <Link href="/create" className="hover:text-amber-500 transition-colors">Bury Treasure</Link>
             <span className="cursor-not-allowed opacity-50">Pirate Code</span>
          </div>

          {/* Center: Copyright */}
          <div className="text-gray-600 text-center text-[10px] tracking-[0.3em] uppercase">
             © 2025 Dead Man's Chest
          </div>

          {/* Right: Social Icons */}
          <div className="flex gap-4 justify-center md:justify-end">
             <a href="#" className="p-2 hover:text-amber-500 transition-all"><FaGithub size={18} /></a>
             <a href="#" className="p-2 hover:text-blue-500 transition-all"><FaLinkedin size={18} /></a>
             <a href="#" className="p-2 hover:text-sky-500 transition-all"><FaTwitter size={18} /></a>
          </div>

        </div>
      </footer>

    </main>
  );
}