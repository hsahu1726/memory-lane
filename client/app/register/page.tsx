"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaAnchor, FaEnvelope, FaLock, FaUserCircle } from "react-icons/fa"; // Added FaUserCircle for the name input
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
console.log("API URL:", API_BASE_URL);



export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // NEW STATE FOR NAME
    const [name, setName] = useState("");
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // UPDATED: Pass the 'name' state to the backend
            const res = await axios.post(`${API_BASE_URL}/api/register`, {
                name, // CRITICAL: Send the user's name
                email,
                password,
            });

            alert(`Welcome aboard, ${name}! You are registered. Now log in, Captain.`);
            router.push("/login"); // Redirect to login after successful registration
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Registration failed. Try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/60 backdrop-blur-sm text-amber-100 p-6 flex justify-center items-center font-serif">
            <div className="max-w-md w-full bg-[#161b22]/90 p-10 rounded shadow-2xl border border-gray-800 relative">

                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <FaAnchor className="text-9xl" />
                </div>

                <Link href="/" className="text-gray-500 hover:text-amber-500 flex items-center gap-2 mb-8 uppercase tracking-widest text-xs font-bold transition-colors">
                    Back to Ship
                </Link>

                <h2 className="text-3xl font-bold mb-6 text-amber-500 flex items-center gap-3">
                    <FaUserPlus /> Join the Crew
                </h2>

                <form onSubmit={handleRegister} className="space-y-6">
                    
                    {/* NEW PIRATE NAME INPUT FIELD */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Your Pirate Name</label>
                        <div className="relative">
                            <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input type="text" required className="w-full bg-[#0d1117] border border-gray-700 text-amber-100 p-3 pl-10 rounded focus:border-amber-500 focus:outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Captain Redbeard" />
                        </div>
                    </div>
                    {/* END NEW PIRATE NAME INPUT FIELD */}
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email (Your Ship Name)</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input type="email" required className="w-full bg-[#0d1117] border border-gray-700 text-amber-100 p-3 pl-10 rounded focus:border-amber-500 focus:outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password (Secret Map)</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input type="password" required className="w-full bg-[#0d1117] border border-gray-700 text-amber-100 p-3 pl-10 rounded focus:border-amber-500 focus:outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm italic font-sans">{error}</p>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-bold uppercase tracking-[0.2em] shadow-lg transition-all border border-amber-500/50 rounded-sm mt-4">
                        {loading ? "Signing Contract..." : "Register"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have a map? <Link href="/login" className="text-amber-500 hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    );
}