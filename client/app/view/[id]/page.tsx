"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaArrowLeft, FaGem, FaScroll, FaQuoteRight, FaImage, FaUsers, FaCalendarAlt, FaVideo, FaMusic } from "react-icons/fa";
export default function ViewMemory() {
  const { id } = useParams();
  const [capsule, setCapsule] = useState<any>(null);
  const isVideo = (path: string) => path?.match(/\.(mp4|webm|ogg|mov)$/i);
  const isAudio = (path: string) => path?.match(/\.(mp3|wav|ogg)$/i);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/capsules/${id}`)
      .then(res => setCapsule(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!capsule) return <div className="min-h-screen bg-black/90 flex items-center justify-center text-amber-500 animate-pulse font-serif tracking-widest">DIGGING UP TREASURE...</div>;

  return (
    <div className="min-h-screen bg-black/70 backdrop-blur-sm text-amber-100 p-6 flex justify-center items-center font-serif">
      <div className="max-w-4xl w-full bg-[#161b22]/95 p-12 rounded-lg border border-amber-600/30 shadow-[0_0_50px_rgba(217,119,6,0.15)] relative overflow-hidden">
        
        {/* Background Texture */}
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <FaScroll className="text-9xl" />
        </div>

        {/* Back Button */}
        <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-amber-500 transition-colors flex items-center gap-2 uppercase tracking-widest text-xs font-bold">
          <FaArrowLeft /> Return to Map
        </Link>

        {/* 💎 Header Section */}
        <div className="mt-8 mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-900/20 text-amber-500 text-[10px] uppercase tracking-[0.3em] mb-4">
                <FaGem /> Treasure Unlocked
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-4 uppercase tracking-widest drop-shadow-sm">
                {capsule.title}
            </h1>
            
            <div className="flex justify-center gap-6 text-xs text-gray-500 font-mono">
                <span className="flex items-center gap-2"><FaCalendarAlt /> BURIED: {new Date(capsule.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-2 text-amber-700">|</span>
                <span className="flex items-center gap-2"><FaGem /> UNSEALED: {new Date().toLocaleDateString()}</span>
            </div>
        </div>

        {/* 📜 Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT: The Message */}
            <div className="space-y-6">
                <div className="relative bg-[#0d1117] p-8 rounded border border-gray-800 shadow-inner h-full">
                    <FaQuoteRight className="absolute top-6 right-6 text-gray-800 text-4xl" />
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FaScroll /> The Captain's Message
                    </h3>
                    <p className="text-lg leading-relaxed text-amber-50 italic font-serif">
                        "{capsule.message}"
                    </p>
                    
                    {/* Contributors */}
                    {capsule.contributors && (
                        <div className="mt-8 pt-4 border-t border-gray-800">
                             <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Crew Members (Contributors)</p>
                             <div className="flex items-center gap-2 text-sm text-amber-500/80">
                                <FaUsers /> {capsule.contributors}
                             </div>
                        </div>
                    )}
                </div>
            </div>

        
             {/* RIGHT: Visuals (Image & Metadata) */}
             <div className="space-y-6">

                 {/* 🖼️ The Visual Memory (Conditional Rendering) */}
                {capsule.image ? (
                    <div className="relative group w-full h-64 md:h-80 bg-black rounded border border-gray-700 overflow-hidden">
                        
                         { /* --- 1. RENDER VIDEO --- */
                            isVideo(capsule.image) ? (
                                <video 
                                    controls 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    src={`http://localhost:5000${capsule.image}`}
                                    // Set the MIME type dynamically if possible, or use mp4 as default
                                    // type="video/mp4" 
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : 
                        /* --- 2. RENDER AUDIO --- */
                        isAudio(capsule.image) ? (
                            <div className="flex flex-col items-center justify-center w-full h-full p-4">
                                <FaMusic className="text-6xl text-amber-500/50 mb-4 animate-pulse" />
                                <audio 
                                    controls 
                                    src={`http://localhost:5000${capsule.image}`}
                                    className="w-full"
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        ) :
                        /* --- 3. RENDER IMAGE (Default) --- */
                        (
                            <img 
                                src={`http://localhost:5000${capsule.image}`} 
                                alt="Memory" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        )}

                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                             <span className="text-xs text-white/80 flex items-center gap-2 uppercase tracking-widest">
                               {isVideo(capsule.image) ? <FaVideo /> : isAudio(capsule.image) ? <FaMusic /> : <FaImage />} Visual Memory
                             </span>
                         </div>
                     </div>
                 ) : (
// ... (The 'No visual artifact found' block remains unchanged)
                    <div className="w-full h-40 bg-[#0d1117] rounded border border-gray-800 border-dashed flex items-center justify-center text-gray-600 flex-col gap-2">
                        <FaImage className="text-2xl opacity-50" />
                        <span className="text-xs uppercase tracking-widest">No visual artifact found</span>
                    </div>
                )}

                {/* Metadata Box */}
                <div className="bg-[#0d1117] p-6 rounded border border-gray-800">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Voyage Details</h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-500">Theme</span>
                            <span className="text-amber-500 font-bold">{capsule.theme || "General"}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-500">Unlock Event</span>
                            <span className="text-amber-500 font-bold">{capsule.eventType === "None" ? "Date-Based" : capsule.eventType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Intended For</span>
                            <span className="text-amber-500 font-bold">{capsule.recipientEmail || "The Crew"}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}