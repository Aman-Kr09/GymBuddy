"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await authAPI.login(form);
      localStorage.setItem("gymbuddy_token", data.token);
      localStorage.setItem("gymbuddy_user", JSON.stringify(data.user));
      router.push("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[rgba(57,255,20,0.03)] rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-[#39FF14] to-[#2bcc10] rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(57,255,20,0.3)]">
              <Dumbbell className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-white">
              Gym<span className="text-[#39FF14]">Buddy</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-[#888] text-sm">
            Sign in to continue your fitness journey
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#ccc] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-dark !pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#ccc] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-dark !pl-11 !pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#aaa] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-[#39FF14] text-xs font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 text-center">
            <p className="text-[#666] text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#39FF14] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
