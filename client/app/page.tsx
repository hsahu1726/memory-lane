"use client";
import { useEffect, useState } from "react";
import CapsuleCard from "../components/CapsuleCard";
import Link from "next/link";
import axios from "axios";
import { FaSkullCrossbones, FaMapMarkedAlt, FaSearch, FaGithub, FaSignInAlt, FaSignOutAlt, FaUserPlus, FaAnchor } from "react-icons/fa";
import { useRouter } from "next/navigation"; // Import useRouter

const THEMES = [
  "All Themes", // New option for no filter
  "General",
  "Travel",
  "Family",
  "Career",
  "Milestone",
  "Reflections",
];

export default function Home() {
    const router = useRouter();
    const [capsules, setCapsules] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeThemeFilter, setActiveThemeFilter] = useState("All Themes"); // New State
    const [isLoggedIn, setIsLoggedIn] = useState(false); // New Auth State
    const [userName, setUserName] = useState("Matey"); // New User State

    // --- AUTHENTICATED FETCH LOGIC (Updated to check for token) ---
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userEmail = localStorage.getItem('userEmail');
        
        setIsLoggedIn(!!token); // Set login status
        if (userEmail) {
             setUserName(userEmail.split('@')[0]); // Use email prefix as user name
        }

        const fetchCapsules = async () => {
            if (!token) {
                console.warn("User not logged in. Showing empty map.");
                setCapsules([]);
                return;
            }

            try {
                const res = await axios.get("http://localhost:5000/api/capsules", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCapsules(res.data);
            } catch (error: any) {
                if (error.response?.status === 401) {
                    console.error("Session expired. Please log in again.");
                    localStorage.clear();
                    setIsLoggedIn(false);
                    // router.push('/login'); // Optional redirect
                } else {
                    console.error("Error fetching treasures:", error);
                }
            }
        };
        fetchCapsules();
    }, [router]);


    // --- LOGOUT FUNCTION (Feature 2 Action) ---
    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setCapsules([]);
        alert("You have left the ship, Captain.");
        router.push("/login"); 
    };

    // --- FILTER LOGIC (Updated for Search Term AND Theme) ---
    const filteredCapsules = capsules.filter((c: any) => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTheme = activeThemeFilter === "All Themes" || c.theme === activeThemeFilter;
        return matchesSearch && matchesTheme;
    });

    return (
        <main className="min-h-screen bg-black/50 text-gray-200 font-serif selection:bg-red-900 selection:text-white flex flex-col">

            {/* 🏴‍☠️ NAVBAR (Updated in next step) */}
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

                {/* ACTIONS (Login/Logout/Create) - FEATURE 2 IMPLEMENTATION */}
                <div className="flex items-center gap-4">
                    
                    {/* Create Button (Only show if logged in) */}
                    {isLoggedIn && (
                        <Link href="/create">
                            <button className="hidden sm:flex relative overflow-hidden px-6 py-2.5 bg-gradient-to-b from-amber-700 to-amber-900 text-amber-50 font-serif font-bold tracking-widest uppercase border border-amber-500/30 rounded shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:-translate-y-0.5 transition-all group">
                                <span className="relative z-10 flex items-center gap-2 text-xs">
                                    <FaMapMarkedAlt /> Bury Secret
                                </span>
                                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                            </button>
                        </Link>
                    )}

                    {/* Authentication Links/Button */}
                    <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                        <div className="text-right hidden lg:block">
                            <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">Captain</p>
                            <p className="text-sm font-bold text-amber-500 font-serif">{isLoggedIn ? userName : "Guest"}</p>
                        </div>
                        
                        {isLoggedIn ? (
                            // LOGOUT BUTTON
                            <button onClick={handleLogout} className="h-10 w-10 flex items-center justify-center rounded-full bg-red-900/30 text-red-500 border border-red-700/50 p-2 cursor-pointer hover:border-red-400 transition-colors shadow-lg">
                                <FaSignOutAlt size={18} />
                            </button>
                        ) : (
                            // LOGIN/REGISTER BUTTONS
                            <div className="flex gap-2">
                                <Link href="/login">
                                    <button className="text-xs px-4 py-2 bg-gray-800 hover:bg-amber-800 rounded flex items-center gap-2 transition-colors">
                                        <FaSignInAlt /> Login
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="text-xs px-4 py-2 bg-amber-800 hover:bg-amber-700 rounded flex items-center gap-2 transition-colors">
                                        <FaUserPlus /> Register
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </header>
            
            {/* 🎨 THEME FILTERING BAR (FEATURE 1 IMPLEMENTATION) */}
            {isLoggedIn && (
                <div className="w-full bg-[#161b22]/90 backdrop-blur-md border-b border-white/5 py-3 shadow-inner">
                    <div className="max-w-6xl mx-auto flex gap-3 overflow-x-auto px-10">
                        {THEMES.map((theme) => (
                            <button
                                key={theme}
                                onClick={() => setActiveThemeFilter(theme)}
                                className={`text-xs whitespace-nowrap px-4 py-1.5 rounded-full font-bold transition-all ${
                                    activeThemeFilter === theme
                                        ? "bg-amber-700 text-white shadow-md"
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                }`}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 🗺️ TREASURE GRID */}
            <div className="max-w-6xl mx-auto p-10 flex-grow w-full">
                {!isLoggedIn ? (
                    <div className="text-center mt-20 p-10 bg-gray-900/50 rounded-lg border border-amber-800/30">
                         <FaAnchor className="text-6xl mx-auto mb-4 text-amber-500/50" />
                         <p className="text-xl text-amber-100">
                             Welcome, Stranger! <Link href="/login" className="text-amber-500 hover:underline font-bold">Log in</Link> or <Link href="/register" className="text-amber-500 hover:underline font-bold">Register</Link> to view your personal map.
                         </p>
                    </div>
                ) : filteredCapsules.length === 0 ? (
                    <div className="text-center mt-20 opacity-50">
                        <FaSkullCrossbones className="text-6xl mx-auto mb-4" />
                        <p className="text-xl">
                            {searchTerm ? `No "${activeThemeFilter}" treasure found with that name.` : `The map is empty, Captain. Go bury a secret!`}
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

            {/* ⚓ FOOTER (Same as before) */}
            <footer className="w-full border-t border-white/5 bg-[#05080a]/60 backdrop-blur-md mt-12 transition-all">
            {/* ... (Footer content remains the same) ... */}
            </footer>

        </main>
    );
}