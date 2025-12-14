"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaArrowLeft, FaGem, FaScroll, FaQuoteRight, FaImage, FaUsers, FaCalendarAlt, FaVideo, FaMusic, FaLock, FaCommentAlt, FaPaperPlane, FaAnchor } from "react-icons/fa"; // Added necessary icons

// Interface for the fetched capsule data
interface CapsuleData {
    _id: string;
    title: string;
    message: string;
    image?: string;
    unlockDate: string;
    status: "LOCKED" | "UNLOCKED";
    theme: string;
    eventType: string;
    contributors: string;
    createdAt: string;
    recipientEmail?: string;
}

// Interface for comments
interface CommentData {
    _id: string;
    capsuleId: string;
    creatorName: string;
    content: string;
    createdAt: string;
}

export default function ViewMemory() {
    const { id } = useParams();
    const router = useRouter(); // Initialize useRouter
    const [capsule, setCapsule] = useState<CapsuleData | null>(null);
    const [comments, setComments] = useState<CommentData[]>([]); // NEW: State for comments
    const [newCommentContent, setNewCommentContent] = useState(""); // NEW: State for comment input
    const [commentLoading, setCommentLoading] = useState(false); // NEW: State for comment submission

    const isVideo = (path: string) => path?.match(/\.(mp4|webm|ogg|mov)$/i);
    const isAudio = (path: string) => path?.match(/\.(mp3|wav|ogg)$/i);

    // --- 1. FETCH CAPSULE AND COMMENTS ---
    useEffect(() => {
        const fetchCapsuleData = async () => {
            if (!id) return;

            try {
                // Fetch capsule data
                const res = await axios.get(`http://localhost:5000/api/capsules/${id}`);
                let fetchedCapsule = res.data;

                // 📌 CLIENT-SIDE UNLOCK FIX (UX Improvement) 
                // Check if the unlock date has passed, and override status locally
                const unlockTime = new Date(fetchedCapsule.unlockDate).getTime();
                const now = new Date().getTime();

                if (fetchedCapsule.status === 'LOCKED' && now >= unlockTime) {
                    console.log("UX Unlock Triggered: Time has passed. Showing UNLOCKED.");
                    // Create a new object with the updated status
                    fetchedCapsule = { ...fetchedCapsule, status: 'UNLOCKED' }; 
                }
                
                setCapsule(fetchedCapsule);
                
                // Fetch comments only if the capsule is considered UNLOCKED
                if (fetchedCapsule.status === 'UNLOCKED' || now >= unlockTime) {
                    fetchComments(fetchedCapsule._id);
                }

            } catch (err) {
                console.error("Error fetching capsule:", err);
            }
        };

        // Function to fetch comments
        const fetchComments = async (capsuleId: string) => {
            try {
                const res = await axios.get(`http://localhost:5000/api/capsules/${capsuleId}/comments`);
                setComments(res.data);
            } catch (err) {
                console.error("Error fetching comments:", err);
            }
        };

        fetchCapsuleData();
    }, [id]);

    // --- 2. COMMENT SUBMISSION LOGIC ---
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const creatorName = localStorage.getItem('userName'); // Get the user's display name

        if (!token || !creatorName) {
            alert("You must be logged in to leave a reflection.");
            return router.push("/login");
        }
        if (!capsule) return;

        setCommentLoading(true);

        try {
            const response = await axios.post(`http://localhost:5000/api/capsules/${capsule._id}/comments`, 
                {
                    content: newCommentContent,
                    creatorName: creatorName, 
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            // Update local state and clear form
            setComments([...comments, response.data]);
            setNewCommentContent('');

        } catch (error) {
            console.error("Failed to post comment:", error);
            alert("The message got lost at sea! Try again.");
        } finally {
            setCommentLoading(false);
        }
    };

    if (!capsule) return <div className="min-h-screen bg-black/90 flex items-center justify-center text-amber-500 animate-pulse font-serif tracking-widest">DIGGING UP TREASURE...</div>;

    // Check if capsule is LOCKED (even after the client-side override, if the time hasn't passed)
    if (capsule.status === 'LOCKED' && new Date(capsule.unlockDate).getTime() > new Date().getTime()) {
        return (
            <div className="min-h-screen bg-black/90 flex items-center justify-center text-gray-500 font-serif">
                <div className="text-center p-10 bg-[#0d1117] rounded-lg border border-gray-800 shadow-xl">
                    <FaLock className="text-6xl mx-auto mb-4 text-gray-700" />
                    <h1 className="text-2xl font-bold">This Treasure is Still Locked</h1>
                    <p className="mt-2 text-sm">It will be ready to open on: <strong>{new Date(capsule.unlockDate).toLocaleString()}</strong></p>
                    <Link href="/" className="mt-6 inline-flex items-center gap-2 text-amber-500 hover:underline">
                        <FaArrowLeft /> Return to Map
                    </Link>
                </div>
            </div>
        );
    }

    // Main unlocked view
    return (
        <div className="min-h-screen bg-black/70 backdrop-blur-sm text-amber-100 p-6 flex justify-center items-center font-serif">
            <div className="max-w-4xl w-full bg-[#161b22]/95 p-12 rounded-lg border border-amber-600/30 shadow-[0_0_50px_rgba(217,119,6,0.15)] relative overflow-hidden">
                
                {/* Header, Back Button, Content Grid, Media Rendering, Metadata (All same) */}
                
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><FaScroll className="text-9xl" /></div>
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
                            <p className="text-lg leading-relaxed text-amber-50 italic font-serif whitespace-pre-wrap">
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

                    {/* RIGHT: Visuals & Metadata */}
                    <div className="space-y-6">
                        {/* 🖼️ The Visual Memory */}
                        {capsule.image ? (
                            <div className="relative group w-full h-64 md:h-80 bg-black rounded border border-gray-700 overflow-hidden">
                                { isVideo(capsule.image) ? (
                                    <video controls className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={`http://localhost:5000${capsule.image}`}></video>
                                ) : isAudio(capsule.image) ? (
                                    <div className="flex flex-col items-center justify-center w-full h-full p-4"><FaMusic className="text-6xl text-amber-500/50 mb-4 animate-pulse" /><audio controls src={`http://localhost:5000${capsule.image}`} className="w-full"></audio></div>
                                ) : (
                                    <img src={`http://localhost:5000${capsule.image}`} alt="Memory" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                                    <span className="text-xs text-white/80 flex items-center gap-2 uppercase tracking-widest">
                                        {isVideo(capsule.image) ? <FaVideo /> : isAudio(capsule.image) ? <FaMusic /> : <FaImage />} Visual Memory
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-40 bg-[#0d1117] rounded border border-gray-800 border-dashed flex items-center justify-center text-gray-600 flex-col gap-2">
                                <FaImage className="text-2xl opacity-50" /><span className="text-xs uppercase tracking-widest">No visual artifact found</span>
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

                {/* 💬 POST-UNLOCK INTERACTION (COMMENTS) - NEW SECTION */}
                <div className="mt-12 p-8 bg-[#0d1117]/70 rounded-lg border border-gray-800">
                    <h3 className="text-2xl font-bold text-amber-500 mb-6 border-b border-gray-700 pb-3 flex items-center gap-3">
                        <FaCommentAlt /> Pirate's Reflections ({comments.length})
                    </h3>
                    
                    {/* NEW COMMENT FORM */}
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                        <textarea
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            required
                            placeholder="Share your reflection on this memory, Captain..."
                            className="w-full bg-[#161b22] border border-gray-700 text-amber-100 p-3 h-20 rounded focus:border-amber-500 focus:outline-none mb-3"
                        />
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded text-sm disabled:opacity-50 flex items-center gap-2"
                            disabled={commentLoading}
                        >
                            <FaPaperPlane /> {commentLoading ? "Sending Echo..." : "Post Reflection"}
                        </button>
                    </form>

                    {/* LIST OF EXISTING COMMENTS */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 italic">Be the first to leave a reflection on this treasure!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment._id} className="bg-[#161b22] p-4 rounded-lg border border-gray-800">
                                    <p className="text-xs text-amber-500 font-bold mb-1 flex items-center gap-2">
                                        <FaAnchor className="text-sm" /> {comment.creatorName}
                                    </p>
                                    <p className="text-gray-200">{comment.content}</p>
                                    <p className="text-[10px] text-gray-600 mt-2">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}