"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield, Users, Dumbbell, Star, CheckCircle, Trash2, Search,
  Award, ShieldAlert, CheckSquare, XSquare, Settings, RefreshCw
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalGyms: 0, totalReviews: 0, verifiedGyms: 0, gymOwners: 0 });
  const [usersList, setUsersList] = useState([]);
  const [gymsList, setGymsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, gyms

  // Filters / Search
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [gymSearch, setGymSearch] = useState("");
  const [gymVerifiedFilter, setGymVerifiedFilter] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("gymbuddy_token");
      const storedUser = localStorage.getItem("gymbuddy_user");
      if (!token || !storedUser) {
        router.push("/login");
        return;
      }
      const u = JSON.parse(storedUser);
      if (u.role !== "admin") {
        router.push("/home");
        return;
      }
      setUser(u);
      loadAdminData();
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "gyms") {
      loadGyms();
    }
  }, [activeTab, userSearch, userRoleFilter, gymSearch, gymVerifiedFilter]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search: userSearch || undefined,
        role: userRoleFilter || undefined,
        limit: 50
      };
      const res = await api.get("/admin/users", { params });
      if (res.data.success) {
        setUsersList(res.data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadGyms = async () => {
    try {
      setLoading(true);
      const params = {
        search: gymSearch || undefined,
        verified: gymVerifiedFilter || undefined,
        limit: 50
      };
      const res = await api.get("/admin/gyms", { params });
      if (res.data.success) {
        setGymsList(res.data.gyms);
      }
    } catch (err) {
      console.error("Failed to load gyms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGym = async (gymId) => {
    try {
      const res = await api.put(`/admin/gyms/${gymId}/verify`);
      if (res.data.success) {
        alert(res.data.message);
        loadGyms();
        loadAdminData();
      }
    } catch (err) {
      alert("Failed to update gym verification.");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        alert("User role updated successfully!");
        loadUsers();
        loadAdminData();
      }
    } catch (err) {
      alert("Failed to update user role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        alert("User deleted successfully.");
        loadUsers();
        loadAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleDeleteGym = async (gymId) => {
    if (!confirm("Are you sure you want to delete this gym listing? This cannot be undone.")) return;
    try {
      const res = await api.delete(`/admin/gyms/${gymId}`);
      if (res.data.success) {
        alert("Gym deleted successfully.");
        loadGyms();
        loadAdminData();
      }
    } catch (err) {
      alert("Failed to delete gym listing.");
    }
  };

  if (loading && usersList.length === 0 && gymsList.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Navbar />
        <div className="text-[#39FF14] text-xl font-bold flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#39FF14] animate-ping" /> Loading Admin Panel...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <section style={{ paddingTop: '100px' }} className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-5 mb-10 border-b border-[#1a1a1a] pb-8">
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
                <Shield className="w-8 h-8 text-[#39FF14]" /> Admin <span className="text-[#39FF14]">Panel</span>
              </h1>
              <p className="text-[#888] text-sm mt-1">Manage users, gyms, roles, and platform verifications</p>
            </div>
            <button
              onClick={() => { loadAdminData(); if (activeTab === "users") loadUsers(); if (activeTab === "gyms") loadGyms(); }}
              className="btn-outline !rounded-xl !p-3 hover:text-[#39FF14] mx-auto"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-[#1a1a1a] mb-8 pb-3">
            {[
              { id: "overview", label: "Overview Stats" },
              { id: "users", label: "Manage Users" },
              { id: "gyms", label: "Manage Gyms" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-[rgba(57,255,20,0.08)] text-[#39FF14] border border-[#39FF14]/30"
                    : "text-[#888] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW STATS TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { icon: Users, label: "Total Users", value: stats.totalUsers, color: "from-blue-500 to-indigo-600" },
                  { icon: Dumbbell, label: "Total Gyms", value: stats.totalGyms, color: "from-emerald-500 to-teal-600" },
                  { icon: Award, label: "Verified Gyms", value: stats.verifiedGyms, color: "from-green-500 to-emerald-600" },
                  { icon: Settings, label: "Gym Owners", value: stats.gymOwners, color: "from-orange-500 to-red-600" },
                  { icon: Star, label: "Total Reviews", value: stats.totalReviews, color: "from-purple-500 to-pink-600" }
                ].map((s, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                      <s.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-black text-white">{s.value}</div>
                    <div className="text-[#666] text-[10px] uppercase font-semibold mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
                <h3 className="text-base font-bold text-white mb-4">Platform Insights</h3>
                <p className="text-xs text-[#888] leading-relaxed">
                  Welcome to the GymBuddy Admin Dashboard. You have full access to override user roles, verify gym listings, and delete inactive listings/accounts. Standard users can promote their account to Gym Owner by creating a new gym listing.
                </p>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="space-y-5">
              {/* Search / Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                  <input
                    type="text"
                    placeholder="Search user by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="input-dark !pl-11 !rounded-xl !text-sm"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="input-dark !rounded-xl !w-auto !text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="gymOwner">Gym Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-[#666] font-semibold bg-[#111]">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-center">Modify Role</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length > 0 ? (
                      usersList.map((usr) => (
                        <tr key={usr._id} className="border-b border-[#111] hover:bg-[#141414] transition-all">
                          <td className="p-4 font-bold text-white">{usr.fullName}</td>
                          <td className="p-4 text-[#888]">{usr.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              usr.role === "admin" ? "bg-red-500/10 text-red-400" :
                              usr.role === "gymOwner" ? "bg-orange-500/10 text-orange-400" :
                              "bg-[#39FF14]/10 text-[#39FF14]"
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={usr.role}
                              onChange={(e) => handleUpdateRole(usr._id, e.target.value)}
                              className="bg-[#111] text-xs text-white border border-[#222] rounded p-1 outline-none"
                            >
                              <option value="user">User</option>
                              <option value="gymOwner">Gym Owner</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(usr._id)}
                              className="text-red-500 hover:text-red-400 p-2 rounded-lg"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#555]">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GYMS TAB */}
          {activeTab === "gyms" && (
            <div className="space-y-5">
              {/* Search / Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                  <input
                    type="text"
                    placeholder="Search gyms by name..."
                    value={gymSearch}
                    onChange={(e) => setGymSearch(e.target.value)}
                    className="input-dark !pl-11 !rounded-xl !text-sm"
                  />
                </div>
                <select
                  value={gymVerifiedFilter}
                  onChange={(e) => setGymVerifiedFilter(e.target.value)}
                  className="input-dark !rounded-xl !w-auto !text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Pending Verification</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] text-[#666] font-semibold bg-[#111]">
                      <th className="p-4">Gym Name</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Location</th>
                      <th className="p-4 text-center">Verification</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gymsList.length > 0 ? (
                      gymsList.map((gym) => (
                        <tr key={gym._id} className="border-b border-[#111] hover:bg-[#141414] transition-all">
                          <td className="p-4 font-bold text-white">{gym.name}</td>
                          <td className="p-4 text-[#888]">{gym.owner?.fullName || "Unassigned"}</td>
                          <td className="p-4 text-[#888]">{gym.location?.city || "Ghaziabad"}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleVerifyGym(gym._id)}
                              className={`px-3 py-1 rounded-lg font-bold text-[10px] transition-all ${
                                gym.isVerified
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              }`}
                            >
                              {gym.isVerified ? "✓ Verified" : "Pending Verify"}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteGym(gym._id)}
                              className="text-red-500 hover:text-red-400 p-2 rounded-lg"
                              title="Delete Gym"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#555]">No gyms found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
