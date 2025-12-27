"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  FaArrowLeft,
  FaLock,
  FaCommentAlt,
  FaPaperPlane,
  FaAnchor,
} from "react-icons/fa";

interface CapsuleData {
  _id: string;
  title: string;
  message: string;
  image?: string;
  unlockDate: string;
  status: "LOCKED" | "UNLOCKED";
  theme: string;
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

export default function ViewMemory() {
  const { id } = useParams();
  const router = useRouter();

  const [capsule, setCapsule] = useState<CapsuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const isVideo = (path?: string) => path?.match(/\.(mp4|webm|ogg|mov)$/i);
  const isAudio = (path?: string) => path?.match(/\.(mp3|wav|ogg)$/i);

  useEffect(() => {
    if (!id) return;

    const fetchComments = async (capsuleId: string) => {
      try {
        const res = await axios.get(
          `${API}/api/capsules/${capsuleId}/comments`
        );
        setComments(res.data);
      } catch {}
    };

    const fetchCapsule = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.replace("/login");
          return;
        }

        const res = await axios.get(`${API}/api/capsules/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedCapsule: CapsuleData = res.data;
        setCapsule(fetchedCapsule);

        if (fetchedCapsule.status === "UNLOCKED") {
          fetchComments(fetchedCapsule._id);
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCapsule();
  }, [id, router, API]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!capsule) return;

    const token = localStorage.getItem("authToken");
    const userRaw = localStorage.getItem("user");
    const creatorName = userRaw ? JSON.parse(userRaw).name : null;

    if (!token || !creatorName) {
      router.push("/login");
      return;
    }

    setCommentLoading(true);

    try {
      const res = await axios.post(
        `${API}/api/capsules/${capsule._id}/comments`,
        { content: newCommentContent, creatorName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => [...prev, res.data]);
      setNewCommentContent("");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-amber-500 font-serif tracking-widest">
        DIGGING UP TREASURE...
      </div>
    );
  }

  if (!capsule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Not found
      </div>
    );
  }

  if (
    capsule.status === "LOCKED" &&
    new Date(capsule.unlockDate).getTime() > Date.now()
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="p-8 border border-gray-700 bg-black/70 backdrop-blur-sm text-center">
          <FaLock className="mx-auto mb-4" />
          <p>Locked until {new Date(capsule.unlockDate).toLocaleString()}</p>
          <Link href="/" className="block mt-4 underline">
            Return
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-serif text-amber-100">
      <div className="max-w-4xl w-full p-10 border border-amber-600/30 bg-black/70 backdrop-blur-sm relative">
        <Link href="/" className="absolute top-6 left-6 text-xs underline">
          <FaArrowLeft /> Back
        </Link>

        <h1 className="text-4xl text-center mb-8 uppercase tracking-widest">
          {capsule.title}
        </h1>

        <p className="text-lg italic text-center mb-8">
          "{capsule.message}"
        </p>

        {capsule.image && (
          <div className="mb-10">
            {isVideo(capsule.image) ? (
              <video controls className="w-full" src={`${API}${capsule.image}`} />
            ) : isAudio(capsule.image) ? (
              <audio controls className="w-full" src={`${API}${capsule.image}`} />
            ) : (
              <img
                src={`${API}${capsule.image}`}
                alt="Memory"
                className="w-full"
              />
            )}
          </div>
        )}

        <div className="mt-10">
          <h3 className="text-xl mb-4 flex items-center gap-2">
            <FaCommentAlt /> Reflections ({comments.length})
          </h3>

          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              required
              className="w-full bg-black/60 border border-gray-700 p-3"
            />
            <button
              disabled={commentLoading}
              className="mt-2 px-4 py-2 border"
            >
              <FaPaperPlane /> {commentLoading ? "Sending" : "Post"}
            </button>
          </form>

          {comments.map((c) => (
            <div
              key={c._id}
              className="border border-gray-800 p-4 mb-2 bg-black/50"
            >
              <p className="text-sm flex items-center gap-2">
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
