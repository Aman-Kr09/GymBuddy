"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, MapPin, Users, MessageCircle, Heart, Calendar,
  Dumbbell, Star, ChevronRight, Clock, Sparkles, Target, Bell, Plus, Check, X
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { userAPI, chatAPI, sessionAPI } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Data
  const [savedGymsCount, setSavedGymsCount] = useState(0);
  const [buddiesCount, setBuddiesCount] = useState(0);
  const [conversationsCount, setConversationsCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [savedGymsList, setSavedGymsList] = useState([]);

  // Schedule Form State
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleBuddy, setScheduleBuddy] = useState("");
  const [scheduleGym, setScheduleGym] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleType, setScheduleType] = useState("Push Day");
  const [submittingSession, setSubmittingSession] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gymbuddy_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setUser(u);
          fetchDashboardDetails(u);
        } catch {}
      }
    }
  }, []);

  const fetchDashboardDetails = async (currentUser) => {
    try {
      setLoading(true);
      const [gymsRes, friendsRes, chatRes, sessionsRes] = await Promise.all([
        userAPI.getSavedGyms(),
        userAPI.getFriends(),
        chatAPI.getConversations(),
        sessionAPI.getAll()
      ]);

      if (gymsRes.data.success) {
        setSavedGymsList(gymsRes.data.savedGyms);
        setSavedGymsCount(gymsRes.data.savedGyms.length);
      }
      if (friendsRes.data.success) {
        setFriendsList(friendsRes.data.friends);
        setBuddiesCount(friendsRes.data.friends.length);
      }
      if (chatRes.data.success) {
        setConversationsCount(chatRes.data.conversations.length);
      }
      if (sessionsRes.data.success) {
        setSessions(sessionsRes.data.sessions);
      }
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!scheduleBuddy || !scheduleGym || !scheduleDate || !scheduleTime || !scheduleType) {
      alert("Please fill all fields to schedule a session.");
      return;
    }

    try {
      setSubmittingSession(true);
      const res = await sessionAPI.create({
        buddyId: scheduleBuddy,
        gymId: scheduleGym,
        date: scheduleDate,
        time: scheduleTime,
        type: scheduleType
      });

      if (res.data.success) {
        alert("Workout Session Scheduled successfully! 💪");
        setShowScheduleForm(false);
        // Reset form
        setScheduleBuddy("");
        setScheduleGym("");
        setScheduleDate("");
        setScheduleTime("");
        setScheduleType("Push Day");
        // Reload sessions list
        const sessionsRes = await sessionAPI.getAll();
        if (sessionsRes.data.success) {
          setSessions(sessionsRes.data.sessions);
        }
      }
    } catch (error) {
      alert("Failed to schedule session.");
    } finally {
      setSubmittingSession(false);
    }
  };

  const handleUpdateSessionStatus = async (id, status) => {
    try {
      const res = await sessionAPI.updateStatus(id, status);
      if (res.data.success) {
        alert(`Session status updated to: ${status}!`);
        // Reload sessions
        const sessionsRes = await sessionAPI.getAll();
        if (sessionsRes.data.success) {
          setSessions(sessionsRes.data.sessions);
        }
      }
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const fitnessGoals = user?.fitnessGoals || ["General Fitness"];
  const quickStats = [
    { icon: Dumbbell, label: "Saved Gyms", value: savedGymsCount, color: "from-emerald-500 to-teal-600" },
    { icon: Users, label: "Buddies", value: buddiesCount, color: "from-blue-500 to-indigo-600" },
    { icon: MessageCircle, label: "Conversations", value: conversationsCount, color: "from-purple-500 to-pink-600" },
    { icon: Calendar, label: "Sessions", value: sessions.filter(s => s.status === 'scheduled').length, color: "from-orange-500 to-red-600" },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <section style={{ paddingTop: '100px' }} className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-5 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-3xl font-black text-white mb-1 flex items-center justify-center gap-3">
                <LayoutDashboard className="w-7 h-7 text-[#39FF14]" /> Dashboard
              </h1>
              <p className="text-[#888] text-sm">
                Welcome back{user ? `, ${user.fullName?.split(" ")[0]}` : ""}! Here&apos;s your fitness overview.
              </p>
            </motion.div>
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="btn-neon !py-2.5 !px-5 !text-xs !rounded-xl mx-auto"
            >
              <Plus className="w-4 h-4" /> Schedule Session
            </button>
          </div>

          {/* Schedule Session Form Modal */}
          {showScheduleForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] mb-8 max-w-2xl mx-auto"
            >
              <h3 className="text-base font-bold text-white mb-4">Schedule Workout Session</h3>
              <form onSubmit={handleCreateSession} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#888] mb-1.5 block">Select Buddy</label>
                  <select
                    value={scheduleBuddy}
                    onChange={(e) => setScheduleBuddy(e.target.value)}
                    required
                    className="input-dark !rounded-xl !text-sm"
                  >
                    <option value="">Choose Buddy...</option>
                    {friendsList.map(buddy => (
                      <option key={buddy._id} value={buddy._id}>{buddy.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#888] mb-1.5 block">Select Gym</label>
                  <select
                    value={scheduleGym}
                    onChange={(e) => setScheduleGym(e.target.value)}
                    required
                    className="input-dark !rounded-xl !text-sm"
                  >
                    <option value="">Choose Gym...</option>
                    {savedGymsList.map(gym => (
                      <option key={gym._id} value={gym._id}>{gym.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#888] mb-1.5 block">Workout Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    required
                    className="input-dark !rounded-xl !text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#888] mb-1.5 block">Workout Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                    className="input-dark !rounded-xl !text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#888] mb-1.5 block">Workout Split Split</label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    required
                    className="input-dark !rounded-xl !text-sm"
                  >
                    <option value="Push Day">Push Day</option>
                    <option value="Pull Day">Pull Day</option>
                    <option value="Leg Day">Leg Day</option>
                    <option value="Cardio Splitting">Cardio Splitting</option>
                    <option value="Yoga Routine">Yoga Routine</option>
                    <option value="CrossFit Circuit">CrossFit Circuit</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex gap-3 mt-4">
                  <button type="submit" disabled={submittingSession} className="btn-neon flex-1 !py-3">
                    {submittingSession ? "Scheduling..." : "Schedule Workout"}
                  </button>
                  <button type="button" onClick={() => setShowScheduleForm(false)} className="btn-outline flex-1 !py-3">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {quickStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[rgba(57,255,20,0.15)] transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-[#666] text-xs font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#39FF14]" /> Workout Sessions Schedule
                  </h2>
                </div>
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    sessions.map((session, i) => {
                      const buddyName = session.participants.find(p => p._id !== user?._id)?.fullName || "Workout Buddy";
                      const isUpcoming = session.status === "scheduled";
                      
                      return (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black shrink-0">
                              <Dumbbell className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-white">{session.type} with {buddyName}</h4>
                              <p className="text-[#888] text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.gym?.name || "Iron Paradise"}</span>
                                <span className="text-[#444]">•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(session.date).toLocaleDateString()} at {session.time}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {isUpcoming ? (
                              <>
                                <button
                                  onClick={() => handleUpdateSessionStatus(session._id, "completed")}
                                  className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-all border border-emerald-500/20"
                                  title="Mark Completed"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateSessionStatus(session._id, "cancelled")}
                                  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all border border-red-500/20"
                                  title="Cancel Workout"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase ${
                                session.status === "completed" 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}>
                                {session.status}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-[#555] text-sm">
                      No workout sessions scheduled yet. Use &quot;Schedule Session&quot; above to begin!
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Saved Gyms Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" /> My Saved Gyms
                  </h2>
                  <Link href="/gyms" className="text-[#39FF14] text-xs font-semibold flex items-center gap-1 hover:underline">
                    Find More <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedGymsList.length > 0 ? (
                    savedGymsList.map((gym, i) => (
                      <Link href={`/gyms/${gym._id}`} key={i}>
                        <div className="p-4 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all cursor-pointer">
                          <h4 className="text-sm font-semibold text-white mb-2">{gym.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-[#888]">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {gym.ratings?.overall || 0}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {gym.location?.locality || "Vaishali"}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-[#555] text-sm sm:col-span-2 text-center py-4">
                      No saved gyms yet. Save your favorite gyms to show them here!
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-8">
              {/* Goals Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                  <Target className="w-5 h-5 text-[#39FF14]" /> My Fitness Goals
                </h2>
                <div className="space-y-4">
                  {fitnessGoals.map((goal, i) => {
                    const progressVal = 40 + (i * 25) % 55; // generate nice dummy progress numbers
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#ccc] font-medium">{goal}</span>
                          <span className="text-[#39FF14] text-xs font-bold">{progressVal}%</span>
                        </div>
                        <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressVal}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                            className="h-full bg-gradient-to-r from-[#39FF14] to-[#2bcc10] rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Achievements widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-[#39FF14]" /> Badges & Achievements
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { badge: "Early Bird", desc: "6 AM workout", active: true },
                    { badge: "Buddy Maker", desc: "First connection", active: true },
                    { badge: "Iron Core", desc: "Weightlifter", active: false }
                  ].map((b, i) => (
                    <div key={i} className={`p-2 rounded-xl border text-center transition-all ${
                      b.active 
                        ? "bg-[#39FF14]/5 border-[#39FF14]/20 text-white" 
                        : "bg-black/20 border-[#1a1a1a] text-[#444]"
                    }`}>
                      <div className={`text-[10px] font-bold ${b.active ? "text-[#39FF14]" : "text-[#444]"}`}>{b.badge}</div>
                      <div className="text-[8px] text-[#666] mt-0.5 leading-tight">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
