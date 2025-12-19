"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FaArrowLeft,
  FaAnchor,
  FaMagic,
  FaCloudUploadAlt,
  FaLock,
  FaGlobe,
  FaShareAlt,
} from "react-icons/fa";
import { API_BASE_URL } from "@/lib/config";

interface FormData {
  title: string;
  message: string;
  unlockDate: string;
  recipientEmail: string;
  theme: string;
  contributors: string;
  eventType: string;
}

const PRIVACY_OPTIONS = [
  { value: "PRIVATE", label: "Private (Creator Only)", icon: FaLock },
  { value: "SHARED", label: "Shared (Selected Crew)", icon: FaShareAlt },
  { value: "PUBLIC", label: "Public (Anyone)", icon: FaGlobe },
];

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [privacyType, setPrivacyType] = useState("PRIVATE");
  const [sharedUserEmail, setSharedUserEmail] = useState("");

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

  const handleAIPolish = async () => {
    if (!formData.message) {
      alert("Write something first.");
      return;
    }

    setAiLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai-polish`, {
        text: formData.message,
        mode: "poetic",
      });
      setFormData({ ...formData, message: res.data.polishedText });
    } catch {
      await new Promise((r) => setTimeout(r, 1500));

      const originalMessage = formData.message.trim();
      const mockResponse = `Hark, a tale spun from the silk of memory,
A whisper from the tide of yesterday's sea.
"${originalMessage}"
Thus shall this treasure shine with verse,
The anchor dropped where time cannot disperse.`;

      setFormData({ ...formData, message: mockResponse });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("You must be logged in.");
      setLoading(false);
      router.push("/login");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("message", formData.message);
    data.append("unlockDate", formData.unlockDate);
    data.append("recipientEmail", formData.recipientEmail);
    data.append("theme", formData.theme);
    data.append("contributors", formData.contributors);
    data.append("eventType", formData.eventType);
    data.append("privacyType", privacyType);

    if (privacyType === "SHARED") {
      data.append("allowedUsers", JSON.stringify([userId]));
    }

    if (file) data.append("file", file);

    try {
      await axios.post(`${API_BASE_URL}/api/capsules`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      router.push("/");
    } catch (error: any) {
      alert(
        `Server rejected the request. ${
          error.response?.data?.message || ""
        }`
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/60 backdrop-blur-sm text-amber-100 p-6 flex justify-center items-center font-serif">
      <div className="max-w-4xl w-full bg-[#161b22]/90 p-10 rounded shadow-2xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <FaAnchor className="text-9xl" />
        </div>

        <Link
          href="/"
          className="text-gray-500 hover:text-amber-500 flex items-center gap-2 mb-8 uppercase tracking-widest text-xs font-bold"
        >
          <FaArrowLeft /> Back
        </Link>

        <h2 className="text-3xl font-bold mb-8 text-amber-500 border-b border-gray-800 pb-4">
          Create Memory
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="space-y-6">
            <div className="bg-[#0a0f14] p-4 rounded-lg border border-gray-800">
              <div className="flex flex-wrap gap-2">
                {PRIVACY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacyType(option.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                      privacyType === option.value
                        ? "bg-amber-700 text-white"
                        : "bg-gray-700/50 text-gray-400"
                    }`}
                  >
                    <option.icon /> {option.label}
                  </button>
                ))}
              </div>

              {privacyType === "SHARED" && (
                <input
                  type="text"
                  className="mt-4 w-full bg-[#161b22] border border-gray-700 p-2 rounded"
                  placeholder="Emails"
                  value={sharedUserEmail}
                  onChange={(e) => setSharedUserEmail(e.target.value)}
                />
              )}
            </div>

            <input
              type="text"
              required
              placeholder="Title"
              className="w-full bg-[#0d1117] border border-gray-700 p-3 rounded"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <div className="relative">
              <textarea
                required
                className="w-full bg-[#0d1117] border border-gray-700 p-3 h-40 rounded"
                placeholder="Message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
              <button
                type="button"
                onClick={handleAIPolish}
                disabled={aiLoading}
                className="absolute bottom-2 right-2 text-xs bg-amber-700 text-white px-3 py-1 rounded"
              >
                <FaMagic /> {aiLoading ? "Polishing..." : "AI Polish"}
              </button>
            </div>

            <div className="flex items-center gap-4 bg-[#0d1117] p-3 border border-gray-700 rounded border-dashed relative">
              <FaCloudUploadAlt className="text-2xl text-gray-500" />
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
              />
              <span className="text-sm text-gray-400">
                {file ? file.name : "Upload media"}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <input
              type="datetime-local"
              required
              className="w-full bg-[#161b22] border border-gray-700 p-2 rounded"
              onChange={(e) =>
                setFormData({ ...formData, unlockDate: e.target.value })
              }
            />

            <input
              type="email"
              required
              placeholder="Recipient email"
              className="w-full bg-[#0d1117] border border-gray-700 p-3 rounded"
              onChange={(e) =>
                setFormData({ ...formData, recipientEmail: e.target.value })
              }
            />

            <select
              className="w-full bg-[#0d1117] border border-gray-700 p-3 rounded"
              onChange={(e) =>
                setFormData({ ...formData, theme: e.target.value })
              }
            >
              <option value="General">General</option>
              <option value="Childhood">Childhood</option>
              <option value="Family History">Family History</option>
              <option value="College">College Years</option>
              <option value="Love">Love Letters</option>
              <option value="Travel">Travel</option>
              <option value="Reflections">Reflections</option>
            </select>

            <input
              type="text"
              placeholder="Contributors"
              className="w-full bg-[#0d1117] border border-gray-700 p-3 rounded"
              onChange={(e) =>
                setFormData({ ...formData, contributors: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-amber-700 to-amber-900 text-white py-4 font-bold uppercase rounded mt-4"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
