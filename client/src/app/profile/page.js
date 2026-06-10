"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Target, Heart, Clock, Camera,
  Save, Dumbbell, Shield, Award, Edit3, ChevronDown,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const fitnessGoalOptions = [
  "Weight Loss", "Muscle Gain", "Strength Training", "Bodybuilding",
  "Powerlifting", "Fat Loss", "General Fitness", "Cardio", "CrossFit", "Yoga",
];

const interestOptions = [
  "Morning Workout", "Evening Workout", "Home Workout",
  "Gym Workout", "Running", "Cycling", "Diet Planning",
];

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", mobile: "", gender: "", age: "",
    experienceLevel: "beginner", preferredWorkoutTime: "morning",
    genderPreference: "any", fitnessGoals: [], interests: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gymbuddy_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setForm({
            fullName: parsed.fullName || "",
            email: parsed.email || "",
            mobile: parsed.mobile || "",
            gender: parsed.gender || "",
            age: parsed.age || "",
            experienceLevel: parsed.experienceLevel || "beginner",
            preferredWorkoutTime: parsed.preferredWorkoutTime || "morning",
            genderPreference: parsed.genderPreference || "any",
            fitnessGoals: parsed.fitnessGoals || [],
            interests: parsed.interests || [],
          });
        } catch {}
      }
    }
  }, []);

  const toggleArrayItem = (key, item) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item],
    }));
  };

  const handleSave = () => {
    // Would call API to update profile
    const updatedUser = { ...user, ...form };
    localStorage.setItem("gymbuddy_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <section style={{ paddingTop: '100px' }} className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] mb-8 text-center relative"
          >
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black text-3xl font-black shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                {form.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center text-[#888] hover:text-[#39FF14] transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl font-black text-white mb-1">{form.fullName || "User"}</h1>
            <p className="text-[#888] text-sm flex items-center justify-center gap-1">
              <Mail className="w-3 h-3" /> {form.email}
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              {user?.badges?.length > 0 ? (
                user.badges.map((b, i) => (
                  <span key={i} className="tag !text-[10px]">{b}</span>
                ))
              ) : (
                <span className="tag !text-[10px]">
                  <Award className="w-3 h-3" /> New Member
                </span>
              )}
            </div>

            {/* Edit button */}
            <button
              onClick={() => setEditing(!editing)}
              className="absolute top-5 right-5 p-2.5 rounded-xl bg-[#111] border border-[#1a1a1a] text-[#888] hover:text-[#39FF14] hover:border-[rgba(57,255,20,0.2)] transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-10 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] space-y-8"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#39FF14]" /> Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  disabled={!editing}
                  className="input-dark disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="input-dark opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Mobile</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  disabled={!editing}
                  className="input-dark disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  disabled={!editing}
                  className="input-dark disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  disabled={!editing}
                  className="input-dark disabled:opacity-50"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Experience Level</label>
                <select
                  value={form.experienceLevel}
                  onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                  disabled={!editing}
                  className="input-dark disabled:opacity-50"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Preferred Workout Time</label>
                <select
                  value={form.preferredWorkoutTime}
                  onChange={(e) => setForm({ ...form, preferredWorkoutTime: e.target.value })}
                  disabled={!editing}
                  className="input-dark disabled:opacity-50"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888] mb-2">Buddy Gender Preference</label>
                <select
                  value={form.genderPreference}
                  onChange={(e) => setForm({ ...form, genderPreference: e.target.value })}
                  disabled={!editing}
                  className="input-dark disabled:opacity-50"
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Fitness Goals */}
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-[#39FF14]" /> Fitness Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {fitnessGoalOptions.map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => editing && toggleArrayItem("fitnessGoals", goal)}
                    disabled={!editing}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.fitnessGoals.includes(goal)
                        ? "bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[#39FF14]/30"
                        : "bg-[#111] text-[#777] border border-[#1a1a1a]"
                    } ${!editing ? "opacity-70 cursor-default" : "cursor-pointer hover:border-[#2a2a2a]"}`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-[#39FF14]" /> Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => editing && toggleArrayItem("interests", interest)}
                    disabled={!editing}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.interests.includes(interest)
                        ? "bg-[rgba(57,255,20,0.12)] text-[#39FF14] border border-[#39FF14]/30"
                        : "bg-[#111] text-[#777] border border-[#1a1a1a]"
                    } ${!editing ? "opacity-70 cursor-default" : "cursor-pointer hover:border-[#2a2a2a]"}`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 pt-2"
              >
                <button onClick={handleSave} className="btn-neon !py-3 flex-1">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-outline !py-3 flex-1"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
