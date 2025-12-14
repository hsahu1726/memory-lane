"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaAnchor, FaMagic, FaCloudUploadAlt } from "react-icons/fa";
import axios from "axios";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // New State for all features
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    unlockDate: "",
    recipientEmail: "",
    theme: "General",
    contributors: "",
    eventType: "None"
  });
  const [file, setFile] = useState<File | null>(null);

  // ✨ AI FUNCTION
  const handleAIPolish = async () => {
    if (!formData.message) return alert("Write something first, Captain!");
    setAiLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai-polish", {
        text: formData.message,
        mode: "pirate" // Change to "poetic" or "standard" if you want
      });
      setFormData({ ...formData, message: res.data.polishedText });
    } catch (error) {
      alert("The AI parrot is sleeping. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // 📨 FORM SUBMIT (Handles Image + Data)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // We must use FormData for file uploads
    const data = new FormData();
    data.append("title", formData.title);
    data.append("message", formData.message);
    data.append("unlockDate", formData.unlockDate);
    data.append("recipientEmail", formData.recipientEmail);
    data.append("theme", formData.theme);
    data.append("contributors", formData.contributors);
    data.append("eventType", formData.eventType);
    if (file) data.append("file", file);

    try {
      await axios.post("http://localhost:5000/api/capsules", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/");
    } catch (error) {
      alert("Arrgh! Server rejected the treasure.");
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
                    <input type="datetime-local" className="w-full bg-[#161b22] border border-gray-700 text-amber-100 p-2 rounded focus:border-amber-500 [&::-webkit-calendar-picker-indicator]:invert"
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