"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaArrowLeft, FaAnchor, FaMagic, FaCloudUploadAlt, FaLock, FaGlobe, FaShareAlt } from "react-icons/fa";

// Define the structure for the form data
interface FormData {
    title: string;
    message: string;
    unlockDate: string;
    recipientEmail: string;
    theme: string;
    contributors: string;
    eventType: string;
}

// Define Privacy Options for UI
const PRIVACY_OPTIONS = [
    { value: 'PRIVATE', label: 'Private (Creator Only)', icon: FaLock },
    { value: 'SHARED', label: 'Shared (Selected Crew)', icon: FaShareAlt },
    { value: 'PUBLIC', label: 'Public (Anyone)', icon: FaGlobe },
];

export default function CreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    
    // NEW STATES for Privacy
    const [privacyType, setPrivacyType] = useState('PRIVATE'); // Default is PRIVATE
    const [sharedUserEmail, setSharedUserEmail] = useState(''); // To specify who to share with
    
    // Form data and file states
    const [formData, setFormData] = useState<FormData>({
        title: "",
        message: "",
        unlockDate: "",
        recipientEmail: "",
        theme: "General",
        contributors: "",
        eventType: "None",
    });
    const [file, setFile] = useState<File | null>(null);

    // --- AI POLISH LOGIC (Same as before) ---
    const handleAIPolish = async () => {
        if (!formData.message) return alert("Write something first, Captain!");
        setAiLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/ai-polish", {
                text: formData.message,
                mode: "poetic" // Using poetic tone
            });
            setFormData({ ...formData, message: res.data.polishedText });
        } catch (error) {
            alert("The AI parrot is sleeping. Try again.");
            console.error(error);
        } finally {
            setAiLoading(false);
        }
    };

    // --- SUBMISSION LOGIC (Corrected and Integrated) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        // 1. ENFORCE LOGIN
        if (!token || !userId) {
            alert("You must be logged in to seal a new treasure.");
            setLoading(false);
            return router.push("/login");
        }
        
        // 2. Build FormData
        const data = new FormData();
        data.append("title", formData.title);
        data.append("message", formData.message);
        data.append("unlockDate", formData.unlockDate);
        data.append("recipientEmail", formData.recipientEmail);
        data.append("theme", formData.theme);
        data.append("contributors", formData.contributors);
        data.append("eventType", formData.eventType);
        if (file) data.append("file", file);

        // 3. ADD PRIVACY FIELDS
        data.append("privacyType", privacyType);
        
        if (privacyType === 'SHARED') {
            // CRITICAL: We pass the creator's ID to the allowedUsers array 
            // to ensure the creator can still see it in the 'SHARED' state.
            // (In a complete app, you would look up the IDs of the emails in sharedUserEmail).
            data.append("allowedUsers", JSON.stringify([userId])); 
        }

        // 4. API Call
        try {
            await axios.post("http://localhost:5000/api/capsules", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            });
            router.push("/");
        } catch (error: any) {
            console.error("Creation Error:", error);
            alert(`Arrgh! Server rejected the treasure. ${error.response?.data?.message || ""}`);
            
            if (error.response?.status === 401) {
                 localStorage.removeItem('authToken');
                 router.push("/login"); 
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/60 backdrop-blur-sm text-amber-100 p-6 flex justify-center items-center font-serif">
            <div className="max-w-4xl w-full bg-[#161b22]/90 p-10 rounded shadow-2xl border border-gray-800 relative overflow-hidden">
                
                {/* Background Icon */}
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <FaAnchor className="text-9xl" />
                </div>

                <Link href="/" className="text-gray-500 hover:text-amber-500 flex items-center gap-2 mb-8 uppercase tracking-widest text-xs font-bold transition-colors">
                    <FaArrowLeft /> Back to Ship
                </Link>

                <h2 className="text-3xl font-bold mb-8 text-amber-500 border-b border-gray-800 pb-4">Bury a Multimedia Memory</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN */}
                    <div className="space-y-6">
                        
                        {/* NEW: PRIVACY CONTROLS UI */}
                        <div className="bg-[#0a0f14] p-4 rounded-lg border border-gray-800 shadow-inner">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FaLock /> Privacy Settings
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {PRIVACY_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setPrivacyType(option.value)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                                            privacyType === option.value
                                                ? 'bg-amber-700 text-white shadow-md'
                                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                        }`}
                                    >
                                        <option.icon /> {option.label}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Shared User Input (Appears only when SHARED is selected) */}
                            {privacyType === 'SHARED' && (
                                <div className="mt-4 pt-3 border-t border-gray-700">
                                    <label className="block text-xs text-gray-500 mb-1">Share with (Emails):</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-[#161b22] border border-gray-700 text-amber-100 p-2 rounded focus:border-amber-500"
                                        placeholder="crewmate1@example.com, crewmate2@example.com"
                                        value={sharedUserEmail}
                                        onChange={(e) => setSharedUserEmail(e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-600 mt-1">Note: This currently only marks the capsule as 'SHARED'.</p>
                                </div>
                            )}
                        </div>
                        {/* END NEW: PRIVACY CONTROLS UI */}
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Treasure Title</label>
                            <input type="text" required className="w-full bg-[#0d1117] border border-gray-700 text-amber-100 p-3 rounded focus:border-amber-500 focus:outline-none"
                              placeholder="Graduation Day 2025..."
                              onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">The Story (Message)</label>
                            <div className="relative">
                                <textarea required className="w-full bg-[#0d1117] border border-gray-700 text-amber-100 p-3 h-40 rounded focus:border-amber-500 focus:outline-none"
                                placeholder="We laughed so hard when..."
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})} />
                                
                                {/* ✨ AI BUTTON */}
                                <button type="button" onClick={handleAIPolish} disabled={aiLoading}
                                    className="absolute bottom-2 right-2 text-xs bg-amber-700 hover:bg-amber-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-all">
                                    <FaMagic /> {aiLoading ? "Polishing..." : "AI Polish"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Upload Photo (Memory)</label>
                            <div className="flex items-center gap-4 bg-[#0d1117] p-3 border border-gray-700 rounded border-dashed hover:border-amber-500 cursor-pointer transition-colors relative">
                                <FaCloudUploadAlt className="text-2xl text-gray-500" />
                                <input type="file" accept="image/*,video/*,audio/*" className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                                <span className="text-sm text-gray-400">{file ? file.name : "Drag & Drop or Click to Upload"}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        {/* 📆 UNLOCK CONDITIONS */}
                        <div className="bg-[#0d1117] p-4 rounded border border-gray-700">
                            <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Unlock Conditions</label>
                            
                            <div className="mb-4">
                                <label className="block text-xs text-gray-500 mb-1">When to open?</label>
                                <input type="datetime-local" required className="w-full bg-[#161b22] border border-gray-700 text-amber-100 p-2 rounded focus:border-amber-500 [&::-webkit-calendar-picker-indicator]:invert"
                                onChange={(e) => setFormData({...formData, unlockDate: e.target.value})} />
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Or unlock on Life Event:</label>
                                <select className="w-full bg-[#161b22] border border-gray-700 text-gray-400 p-2 rounded focus:border-amber-500"
                                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}>
                                    <option value="None">No Event (Use Date)</option>
                                    <option value="Graduation"> Graduation</option>
                                    <option value="Wedding"> Wedding</option>
                                    <option value="18th Birthday"> 18th Birthday</option>
                                    <option value="First Job"> First Job</option>
                                    <option value="Travel"> Travel</option>
                                    <option value="Milestone"> Milestone</option>
                                </select>
                            </div>
                        </div>

                        {/* 📧 RECIPIENT & THEME */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Recipient Email</label>
                            <input type="email" required className="w-full bg-[#0d1117] border border-gray-700 text-amber-100 p-3 rounded focus:border-amber-500 focus:outline-none"
                            placeholder="future.me@example.com"
                            onChange={(e) => setFormData({...formData, recipientEmail: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Theme</label>
                                <select className="w-full bg-[#0d1117] border border-gray-700 text-amber-100 p-3 rounded focus:border-amber-500"
                                    onChange={(e) => setFormData({...formData, theme: e.target.value})}>
                                    <option value="General">General</option>
                                    <option value="Childhood">Childhood</option>
                                    <option value="Family History">Family History</option>
                                    <option value="College">College Years</option>
                                    <option value="Love">Love Letters</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Reflections">Reflections</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contributors</label>
                                <input type="text" className="w-full bg-[#0d1117] border border-gray-700 text-amber-100 p-3 rounded focus:border-amber-500"
                                placeholder="Mom, Dad..."
                                onChange={(e) => setFormData({...formData, contributors: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                      className="col-span-1 md:col-span-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white py-4 font-bold uppercase tracking-[0.2em] shadow-lg transition-all border border-amber-500/50 rounded mt-4">
                      {loading ? "Sealing Capsule..." : "🔒 Seal The Treasure"}
                    </button>
                </form>
            </div>
        </div>
    );
}