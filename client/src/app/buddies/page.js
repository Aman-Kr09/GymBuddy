"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, MapPin, Target, Clock, Filter, Search, Heart,
  MessageCircle, Dumbbell, Sparkles, SlidersHorizontal, X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { userAPI, chatAPI } from "@/lib/api";

export default function BuddiesPage() {
  const router = useRouter();
  const [buddies, setBuddies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGoal, setFilterGoal] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    // Check if token exists
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("gymbuddy_token");
      if (!token) {
        router.push("/login");
        return;
      }
    }
    fetchBuddies();
  }, [filterGoal, filterTime]);

  const fetchBuddies = async () => {
    try {
      setLoading(true);
      const params = {
        goal: filterGoal || undefined,
        time: filterTime || undefined,
        limit: 30
      };

      const res = await userAPI.getBuddies(params);
      if (res.data.success) {
        setBuddies(res.data.buddies);
      }

      // Fetch current friend requests to check sent status
      const reqRes = await apiGetFriendRequests();
      if (reqRes) {
        setSentRequests(reqRes.sent.map(r => r._id));
      }
    } catch (error) {
      console.error("Error fetching recommended buddies:", error);
    } finally {
      setLoading(false);
    }
  };

  const apiGetFriendRequests = async () => {
    try {
      const res = await userAPI.getFriendRequests();
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {}
    return null;
  };

  const handleSendFriendRequest = async (buddyId) => {
    try {
      const res = await userAPI.sendFriendRequest(buddyId);
      if (res.data.success) {
        setSentRequests([...sentRequests, buddyId]);
        alert("Friend request sent! 💪");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send request.");
    }
  };

  const handleStartMessage = async (buddyId) => {
    try {
      const res = await chatAPI.createConversation({ participantId: buddyId });
      if (res.data.success) {
        router.push(`/chat?conv=${res.data.conversation._id}`);
      }
    } catch (error) {
      console.error("Failed to initialize conversation:", error);
      router.push("/chat");
    }
  };

  const filtered = buddies.filter((b) => {
    if (searchQuery && !b.fullName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <section style={{ paddingTop: '100px' }} className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center gap-3">
              <Users className="w-8 h-8 text-[#39FF14]" /> Find Workout <span className="text-[#39FF14]">Buddies</span>
            </h1>
            <p className="text-[#888] text-sm">Match with fitness partners who share your goals</p>
          </motion.div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto justify-center w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                id="buddy-search"
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark !pl-11 !rounded-xl"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline !rounded-xl !px-5 ${showFilters ? "!bg-[rgba(57,255,20,0.08)]" : ""}`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-xs font-medium text-[#888] mb-2 block">Fitness Goal</label>
                <select
                  value={filterGoal}
                  onChange={(e) => setFilterGoal(e.target.value)}
                  className="input-dark !rounded-xl !text-sm"
                >
                  <option value="">All Goals</option>
                  {["Muscle Gain", "Weight Loss", "Yoga", "Bodybuilding", "CrossFit", "Cardio", "General Fitness", "Strength Training", "Powerlifting"].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#888] mb-2 block">Workout Time</label>
                <select
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  className="input-dark !rounded-xl !text-sm"
                >
                  <option value="">Any Time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Buddy Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-64 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((buddy, i) => {
                const connectionSent = sentRequests.includes(buddy._id);
                const compatibility = buddy.compatibility || 85;
                const distance = buddy.distance || "N/A";
                const fitnessGoals = buddy.fitnessGoals || [];
                const interests = buddy.interests || [];
                const age = buddy.age || 25;
                const locality = buddy.location?.locality || "Vaishali";

                return (
                  <motion.div
                    key={buddy._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[rgba(57,255,20,0.2)] transition-all duration-300 hover-lift"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black font-bold text-xl shrink-0 shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                        {buddy.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{buddy.fullName}</h3>
                        <p className="text-[#666] text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {locality} · {distance}
                        </p>
                        <p className="text-[#555] text-xs capitalize mt-0.5">
                          {buddy.experienceLevel || "intermediate"} · {age} yrs
                        </p>
                      </div>
                    </div>

                    {/* Compatibility */}
                    <div className="mb-4 p-3 rounded-xl bg-[rgba(57,255,20,0.04)] border border-[rgba(57,255,20,0.1)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#888] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#39FF14]" /> Compatibility
                        </span>
                        <span className="text-[#39FF14] text-lg font-black">{compatibility}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#39FF14] to-[#2bcc10] rounded-full transition-all duration-700"
                          style={{ width: `${compatibility}%` }}
                        />
                      </div>
                    </div>

                    {/* Goals & Interests */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {fitnessGoals.map(g => (
                        <span key={g} className="tag !text-[10px] !py-0.5 !px-2">{g}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {interests.slice(0, 2).map(i => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-[#111] border border-[#1a1a1a] text-[#777] text-[10px]">{i}</span>
                      ))}
                      <span className="px-2 py-0.5 rounded-full bg-[#111] border border-[#1a1a1a] text-[#777] text-[10px] capitalize flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {buddy.preferredWorkoutTime || "morning"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendFriendRequest(buddy._id)}
                        disabled={connectionSent}
                        className={`flex-1 !py-2.5 !text-xs !rounded-xl transition-all ${
                          connectionSent 
                            ? "bg-[#111] border border-[#1a1a1a] text-[#555] cursor-not-allowed" 
                            : "btn-neon"
                        }`}
                      >
                        {connectionSent ? "Requested" : "Connect"}
                      </button>
                      <button
                        onClick={() => handleStartMessage(buddy._id)}
                        className="btn-outline flex-1 !py-2.5 !text-xs !rounded-xl"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Message
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl">
              <Users className="w-12 h-12 text-[#333] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No buddies found</h3>
              <p className="text-[#666] text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
