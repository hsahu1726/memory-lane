"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSignInAlt, FaAnchor, FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
      });

      const { token, user } = res.data; // ✅ FIXED

      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed.");
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

        <Link href="/" className="text-gray-500 hover:text-amber-500 flex items-center gap-2 mb-8 uppercase tracking-widest text-xs font-bold">
          Back to Ship
        </Link>

        <h2 className="text-3xl font-bold mb-6 text-amber-500 flex items-center gap-3">
          <FaSignInAlt /> Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full bg-[#0d1117] border border-gray-700 p-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full bg-[#0d1117] border border-gray-700 p-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold uppercase"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
