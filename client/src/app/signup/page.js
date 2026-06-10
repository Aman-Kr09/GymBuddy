"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  Loader2, User, Phone, Calendar, MapPin, Target, Heart, ChevronDown,
} from "lucide-react";
import { authAPI } from "@/lib/api";

const fitnessGoals = [
  "Weight Loss", "Muscle Gain", "Strength Training", "Bodybuilding",
  "Powerlifting", "Fat Loss", "General Fitness", "Cardio", "CrossFit", "Yoga",
];

const interestOptions = [
  "Morning Workout", "Evening Workout", "Home Workout",
  "Gym Workout", "Running", "Cycling", "Diet Planning",
];

const TOTAL_STEPS = 3;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    mobile: "",
    fitnessGoals: [],
    interests: [],
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const toggleArrayItem = (key, item) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((i) => i !== item)
        : [...prev[key], item],
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName.trim()) return "Full name is required";
      if (!form.email.trim()) return "Email is required";
      if (form.password.length < 6) return "Password must be at least 6 characters";
    }
    if (step === 2) {
      if (!form.gender) return "Please select your gender";
      if (!form.age || form.age < 13) return "Please enter a valid age (13+)";
      if (!form.mobile.trim()) return "Mobile number is required";
    }
    if (step === 3) {
      if (form.fitnessGoals.length === 0) return "Select at least one fitness goal";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");

    try {
      // Try to get location
      let location = { type: "Point", coordinates: [0, 0] };
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          location = {
            type: "Point",
            coordinates: [pos.coords.longitude, pos.coords.latitude],
          };
        } catch {}
      }

      const { data } = await authAPI.signup({ ...form, age: parseInt(form.age), location });
      localStorage.setItem("gymbuddy_token", data.token);
      localStorage.setItem("gymbuddy_user", JSON.stringify(data.user));
      router.push("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
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
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[rgba(57,255,20,0.03)] rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-[#39FF14] to-[#2bcc10] rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(57,255,20,0.3)]">
              <Dumbbell className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-white">
              Gym<span className="text-[#39FF14]">Buddy</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
          <p className="text-[#888] text-sm">Join the fitness community today</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i + 1 <= step ? "bg-[#39FF14]" : "bg-[#1a1a1a]"
                }`}
              />
            </div>
          ))}
          <span className="text-xs text-[#666] ml-2 whitespace-nowrap">
            Step {step}/{TOTAL_STEPS}
          </span>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] min-h-[420px]">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Account Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-[#39FF14]" /> Account Info
                </h2>
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={form.fullName}
                      onChange={(e) => updateForm("fullName", e.target.value)}
                      className="input-dark !pl-11"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className="input-dark !pl-11"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      className="input-dark !pl-11 !pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#aaa]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Personal Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-[#39FF14]" /> Personal Details
                </h2>
                <div>
                  <label className="block text-sm font-medium text-[#ccc] mb-2">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["male", "female", "other"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => updateForm("gender", g)}
                        className={`py-3 rounded-xl text-sm font-medium capitalize transition-all ${
                          form.gender === g
                            ? "bg-[rgba(57,255,20,0.1)] text-[#39FF14] border border-[#39FF14]/30"
                            : "bg-[#111] text-[#888] border border-[#1a1a1a] hover:border-[#2a2a2a]"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#ccc] mb-2">Age</label>
                    <input
                      id="signup-age"
                      type="number"
                      placeholder="25"
                      min="13"
                      max="100"
                      value={form.age}
                      onChange={(e) => updateForm("age", e.target.value)}
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#ccc] mb-2">Mobile</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                      <input
                        id="signup-mobile"
                        type="tel"
                        placeholder="+91 XXXXX"
                        value={form.mobile}
                        onChange={(e) => updateForm("mobile", e.target.value)}
                        className="input-dark !pl-11"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Fitness Goals & Interests */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                    <Target className="w-5 h-5 text-[#39FF14]" /> Fitness Goals
                  </h2>
                  <p className="text-[#666] text-xs mb-4">Select one or more goals</p>
                  <div className="flex flex-wrap gap-2">
                    {fitnessGoals.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleArrayItem("fitnessGoals", goal)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                          form.fitnessGoals.includes(goal)
                            ? "bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[#39FF14]/30"
                            : "bg-[#111] text-[#888] border border-[#1a1a1a] hover:border-[#2a2a2a]"
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-[#39FF14]" /> Interests
                  </h3>
                  <p className="text-[#666] text-xs mb-4">Optional — helps us find better matches</p>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleArrayItem("interests", interest)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                          form.interests.includes(interest)
                            ? "bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[#39FF14]/30"
                            : "bg-[#111] text-[#888] border border-[#1a1a1a] hover:border-[#2a2a2a]"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-[#aaa] hover:text-white hover:bg-[#141414] transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button onClick={nextStep} className="btn-neon !py-2.5 !px-6">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-neon !py-2.5 !px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-[#666] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#39FF14] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
