"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Mail, Lock, ArrowRight, ArrowLeft, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email"); return; }
    setLoading(true);
    setError("");
    try {
      await authAPI.forgotPassword({ email });
      setSuccess("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) { setError("Please enter the full 6-digit OTP"); return; }
    setLoading(true);
    setError("");
    try {
      await authAPI.verifyOtp({ email, otp: otpString });
      setSuccess("OTP verified successfully!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError("");
    try {
      await authAPI.resetPassword({ email, otp: otp.join(""), newPassword });
      setSuccess("Password reset successfully! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // OTP input handler
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    // Auto-focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const stepVariants = {
    enter: { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[rgba(57,255,20,0.03)] rounded-full blur-[120px]" />

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
          <h1 className="text-3xl font-black text-white mb-2">Reset Password</h1>
          <p className="text-[#888] text-sm">
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create a new password for your account"}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s <= step ? "bg-[#39FF14]" : "bg-[#1a1a1a]"
                }`}
              />
            </div>
          ))}
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
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-[rgba(57,255,20,0.08)] border border-[rgba(57,255,20,0.15)] text-[#39FF14] text-sm"
            >
              {success}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 1 && (
              <motion.form
                key="s1"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="input-dark !pl-11"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <motion.form
                key="s2"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-4 text-center">
                    Enter OTP sent to <span className="text-[#39FF14]">{email}</span>
                  </label>
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-bold input-dark rounded-xl"
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify OTP <ShieldCheck className="w-4 h-4" /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(["","","","","",""]); setSuccess(""); }}
                  className="w-full text-center text-[#666] text-sm hover:text-[#aaa] transition-colors"
                >
                  Didn&apos;t receive code? Go back
                </button>
              </motion.form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <motion.form
                key="s3"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      id="new-password"
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                      className="input-dark !pl-11"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      className="input-dark !pl-11"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-[#666] text-sm hover:text-[#aaa] inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
