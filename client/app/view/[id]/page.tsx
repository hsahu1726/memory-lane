"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  FaArrowLeft,
  FaGem,
  FaScroll,
  FaQuoteRight,
  FaImage,
  FaUsers,
  FaCalendarAlt,
  FaVideo,
  FaMusic,
  FaLock,
  FaCommentAlt,
  FaPaperPlane,
  FaAnchor,
} from "react-icons/fa";

// ------------------ TYPES ------------------
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

interface CommentData {
  _id: string;
  capsuleId: string;
  creatorName: string;
  content: string;
  createdAt: string;
}

// ------------------ COMPONENT ------------------
export default function ViewMemory() {
  const { id } = useParams();
  const router = useRouter();

  const [capsule, setCapsule] = useState<CapsuleData | null>(null);
  const [loading, setLoading] = useState(true); // 🔑 FIXED

  const [comments, setComments] = useState<CommentData[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const isVideo = (path?: string) => path?.match(/\.(mp4|webm|ogg|mov)$/i);
  const isAudio = (path?: string) => path?.match(/\.(mp3|wav|ogg)$/i);

  // ------------------ FETCH CAPSULE + COMMENTS ------------------
  useEffect(() => {
    if (!id) return;

    const fetchComments = async (capsuleId: string) => {
      try {
        const res = await axios.get(`${API}/api/capsules/${capsuleId}/comments`);
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    const fetchCapsule = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          router.replace("/login");
          return;
        }

        const res = await axios.get(`${API}/api/capsules/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let fetchedCapsule: CapsuleData = res.data;

        // ⏱️ Client-side unlock (UX only)
        const unlockTime = new Date(fetchedCapsule.unlockDate).getTime();
        const now = Date.now();

        if (fetchedCapsule.status === "LOCKED" && now >= unlockTime) {
          fetchedCapsule = { ...fetchedCapsule, status: "UNLOCKED" };
        }

        setCapsule(fetchedCapsule);

        if (fetchedCapsule.status === "UNLOCKED") {
          fetchComments(fetchedCapsule._id);
        }
      } catch (err) {
        console.error("Error fetching capsule:", err);
      } finally {
        setLoading(false); // 🔑 NEVER get stuck again
      }
    };

    fetchCapsule();
  }, [id, router, API]);

  // ------------------ COMMENT SUBMIT ------------------
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    const creatorName = localStorage.getItem("userName");

    if (!token || !creatorName) {
      alert("You must be logged in to comment.");
      router.push("/login");
      return;
    }

    if (!capsule) return;

    setCommentLoading(true);

    try {
      const res = await axios.post(
        `${API}/api/capsules/${capsule._id}/comments`,
        { content: newCommentContent, creatorName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => [...prev, res.data]);
      setNewCommentContent("");
    } catch (err) {
      console.error("Comment post failed:", err);
      alert("The message got lost at sea ☠️");
    } finally {
      setCommentLoading(false);
    }
  };

  // ------------------ STATES ------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center text-amber-500 animate-pulse font-serif tracking-widest">
        DIGGING UP TREASURE...
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Treasure not found ☠️
      </div>
    );
  }

  if (capsule.status === "LOCKED" && new Date(capsule.unlockDate).getTime() > Date.now()) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center text-gray-500 font-serif">
        <div className="text-center p-10 bg-[#0d1117] rounded-lg border border-gray-800 shadow-xl">
          <FaLock className="text-6xl mx-auto mb-4 text-gray-700" />
          <h1 className="text-2xl font-bold">This Treasure is Still Locked</h1>
          <p className="mt-2 text-sm">
            It will open on <strong>{new Date(capsule.unlockDate).toLocaleString()}</strong>
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-amber-500 hover:underline">
            <FaArrowLeft /> Return to Map
          </Link>
        </div>
      </div>
    );
  }

  // ------------------ MAIN VIEW ------------------
  return (
    <div className="min-h-screen bg-black/70 backdrop-blur-sm text-amber-100 p-6 flex justify-center items-center font-serif">
      <div className="max-w-4xl w-full bg-[#161b22]/95 p-12 rounded-lg border border-amber-600/30 shadow-[0_0_50px_rgba(217,119,6,0.15)] relative">
        <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-amber-500 flex items-center gap-2 text-xs">
          <FaArrowLeft /> Return to Map
        </Link>

        <div className="mt-8 mb-10 text-center">
          <h1 className="text-4xl font-bold text-amber-400 uppercase tracking-widest">
            {capsule.title}
          </h1>
        </div>

        <p className="text-lg italic text-center mb-10">"{capsule.message}"</p>

        {capsule.image && (
          <div className="mb-10">
            {isVideo(capsule.image) ? (
              <video controls className="w-full" src={`${API}${capsule.image}`} />
            ) : isAudio(capsule.image) ? (
              <audio controls className="w-full" src={`${API}${capsule.image}`} />
            ) : (
              <img src={`${API}${capsule.image}`} alt="Memory" className="w-full rounded" />
            )}
          </div>
        )}

        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaCommentAlt /> Reflections ({comments.length})
          </h3>

          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              required
              className="w-full bg-[#0d1117] border border-gray-700 p-3 rounded"
            />
            <button
              disabled={commentLoading}
              className="mt-2 px-4 py-2 bg-amber-700 rounded disabled:opacity-50"
            >
              <FaPaperPlane /> {commentLoading ? "Sending..." : "Post"}
            </button>
          </form>

          {comments.map((c) => (
            <div key={c._id} className="border border-gray-800 p-4 rounded mb-2">
              <p className="text-amber-500 text-sm flex items-center gap-2">
                <FaAnchor /> {c.creatorName}
              </p>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
