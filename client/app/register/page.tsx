"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUserPlus,
  FaAnchor,
  FaEnvelope,
  FaLock,
  FaUserCircle
} from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false); // ✅ FIXED
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("REGISTER → API:", API_BASE_URL);

    try {
      await axios.post(`${API_BASE_URL}/api/register`, {
        name,
        email,
        password,
      });

      alert(`Welcome aboard, ${name}! Now log in, Captain.`);
      router.push("/login");
    } catch (err: any) {
      console.error("REGISTER ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/60 flex justify-center items-center font-serif">
      <div className="max-w-md w-full bg-[#161b22]/90 p-10 rounded shadow-2xl border border-gray-800">

        <Link href="/" className="text-gray-500 hover:text-amber-500 text-xs uppercase mb-6 block">
          Back to Ship
        </Link>

        <h2 className="text-3xl font-bold mb-6 text-amber-500 flex items-center gap-3">
          <FaUserPlus /> Join the Crew
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-xs text-gray-400 uppercase">Pirate Name</label>
            <div className="relative">
              <FaUserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                required
                className="w-full bg-[#0d1117] border border-gray-700 p-3 pl-10 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                className="w-full bg-[#0d1117] border border-gray-700 p-3 pl-10 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                className="w-full bg-[#0d1117] border border-gray-700 p-3 pl-10 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-800 hover:bg-amber-700 text-white uppercase tracking-widest"
          >
            {loading ? "Signing Contract..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
