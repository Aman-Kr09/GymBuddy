"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Star, Clock, Filter, Search, Dumbbell, Heart, Navigation,
  SlidersHorizontal, ChevronRight
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { gymAPI, userAPI } from "@/lib/api";

const colors = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600"
];

function GymsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [gyms, setGyms] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: "",
    minRating: "",
    femaleFriendly: false,
    hasAC: false,
    hasParking: false,
    hasPersonalTrainer: false
  });
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const [totalGyms, setTotalGyms] = useState(0);
  const [savedGymIds, setSavedGymIds] = useState([]);

  // Leaflet Map Refs
  const [mapMounted, setMapMounted] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Set mounted for browser-only map loading
    setMapMounted(true);
    
    // Get saved gyms list for the user
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gymbuddy_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setSavedGymIds(u.savedGyms || []);
        } catch {}
      }
    }
  }, []);

  // Fetch gyms whenever filters, search, or sorting changes
  useEffect(() => {
    fetchGyms();
  }, [searchQuery, filters, sortBy]);

  // Handle Leaflet Map Initialization and Updating
  useEffect(() => {
    if (!mapMounted || typeof window === "undefined" || !gyms.length) return;

    // Load leaflet client-side
    import("leaflet").then((L) => {
      // Fix leaflet icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      // Clear existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Default center coords (use first gym or Ghaziabad)
      const defaultCenter = [28.6439, 77.3410];
      const mapCenter = gyms[0]?.location?.coordinates 
        ? [gyms[0].location.coordinates[1], gyms[0].location.coordinates[0]] 
        : defaultCenter;

      const container = document.getElementById("leaflet-gyms-map");
      if (!container) return;

      const map = L.map(container).setView(mapCenter, 13);
      mapInstanceRef.current = map;

      // Add dark-theme tiles matching our aesthetics
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(map);

      // Add markers
      gyms.forEach((gym) => {
        if (gym.location?.coordinates && gym.location.coordinates[0] !== 0) {
          const lat = gym.location.coordinates[1];
          const lng = gym.location.coordinates[0];
          
          const marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(`
            <div style="color: black; font-family: sans-serif; font-size: 12px; padding: 4px;">
              <h4 style="margin: 0 0 4px; font-weight: bold;">${gym.name}</h4>
              <p style="margin: 0 0 6px; color: #555;">${gym.location.address || ""}</p>
              <a href="/gyms/${gym._id}" style="color: #2bcc10; font-weight: bold; text-decoration: none;">View Gym &rarr;</a>
            </div>
          `);
        }
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [gyms, mapMounted]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const params = {
        q: searchQuery || undefined,
        sortBy: sortBy,
        maxPrice: filters.maxPrice || undefined,
        minRating: filters.minRating || undefined,
        femaleFriendly: filters.femaleFriendly ? "true" : undefined,
        hasAC: filters.hasAC ? "true" : undefined,
        hasParking: filters.hasParking ? "true" : undefined,
        hasPersonalTrainer: filters.hasPersonalTrainer ? "true" : undefined,
        limit: 15
      };

      const res = await gymAPI.search(params);
      if (res.data.success) {
        setGyms(res.data.gyms);
        setTotalGyms(res.data.total || res.data.count);
      }
    } catch (error) {
      console.error("Error fetching gyms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSaveGym = async (gymId) => {
    try {
      const res = await userAPI.toggleSaveGym(gymId);
      if (res.data.success) {
        let updatedSaved;
        if (res.data.saved) {
          updatedSaved = [...savedGymIds, gymId];
        } else {
          updatedSaved = savedGymIds.filter(id => id !== gymId);
        }
        setSavedGymIds(updatedSaved);
        
        // Update user state locally
        const stored = localStorage.getItem("gymbuddy_user");
        if (stored) {
          const u = JSON.parse(stored);
          const updatedUser = { ...u, savedGyms: updatedSaved };
          localStorage.setItem("gymbuddy_user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error saving/unsaving gym:", error);
    }
  };

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Import Leaflet CSS directly */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <Navbar />

      <section style={{ paddingTop: '100px' }} className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center flex flex-col items-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center gap-3">
              <Dumbbell className="w-8 h-8 text-[#39FF14]" /> Browse <span className="text-[#39FF14]">Gyms</span>
            </h1>
            <p className="text-[#888] text-sm">Find and compare gyms near your location</p>
            <Link
              href="/gym-owner"
              className="mt-3 text-xs text-[#39FF14] hover:underline flex items-center gap-1"
            >
              Own a gym? Add it to GymBuddy
            </Link>
          </motion.div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto justify-center w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                id="gym-search"
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark !pl-11 !rounded-xl"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-dark !rounded-xl !w-auto !text-sm"
            >
              <option value="rating">Sort: Rating</option>
              <option value="price">Sort: Price</option>
              <option value="popularity">Sort: Popularity</option>
            </select>
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
              className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div>
                <label className="text-xs font-medium text-[#888] mb-2 block">Max Price (₹/month)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="input-dark !rounded-xl !text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#888] mb-2 block">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  className="input-dark !rounded-xl !text-sm"
                >
                  <option value="">Any</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.femaleFriendly}
                    onChange={(e) => setFilters({ ...filters, femaleFriendly: e.target.checked })}
                    className="w-4 h-4 accent-[#39FF14]"
                  />
                  <span className="text-sm text-[#ccc]">Female Friendly</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasAC}
                    onChange={(e) => setFilters({ ...filters, hasAC: e.target.checked })}
                    className="w-4 h-4 accent-[#39FF14]"
                  />
                  <span className="text-sm text-[#ccc]">AC Room</span>
                </label>
              </div>
            </motion.div>
          )}

          {/* Grid Layout (List + Map) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Gyms List */}
            <div className="lg:col-span-2 space-y-6">
              <p className="text-[#666] text-xs">{totalGyms} gyms found</p>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[1, 2, 4, 5].map(n => (
                    <div key={n} className="h-72 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
                  ))}
                </div>
              ) : gyms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {gyms.map((gym, i) => {
                    const isSaved = savedGymIds.includes(gym._id);
                    const cardColor = colors[Math.abs(hashString(gym._id)) % colors.length];
                    const price = gym.membershipPlans?.[0]?.price || 0;
                    const overallRating = gym.ratings?.overall || 0;
                    const totalReviews = gym.ratings?.totalReviews || 0;
                    const openTime = gym.openingHours?.monday?.open || "06:00";
                    const closeTime = gym.openingHours?.monday?.close || "22:00";

                    return (
                      <motion.div
                        key={gym._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                      >
                        <div className="rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[rgba(57,255,20,0.2)] overflow-hidden transition-all duration-400 hover-lift group">
                          <Link href={`/gyms/${gym._id}`}>
                            <div className={`h-40 bg-gradient-to-br ${cardColor} relative overflow-hidden`}>
                              <div className="absolute inset-0 bg-black/20" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Dumbbell className="w-12 h-12 text-white/20" />
                              </div>
                              <div className="absolute top-3 left-3 flex gap-2">
                                {gym.isVerified && <span className="px-2.5 py-1 rounded-full bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-bold backdrop-blur-sm">✓ VERIFIED</span>}
                                {gym.femaleFriendly && <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold backdrop-blur-sm">FEMALE FRIENDLY</span>}
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleToggleSaveGym(gym._id);
                                }}
                                className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors ${
                                  isSaved ? "text-red-400" : "text-white/70 hover:text-red-400"
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isSaved ? "fill-red-400" : ""}`} />
                              </button>
                            </div>

                            <div className="p-5">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base font-bold text-white group-hover:text-[#39FF14] transition-colors line-clamp-1">{gym.name}</h3>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                  <span className="text-white text-sm font-semibold">{overallRating}</span>
                                  <span className="text-[#666] text-xs">({totalReviews})</span>
                                </div>
                              </div>
                              <p className="text-[#666] text-xs flex items-center gap-1 mb-3">
                                <MapPin className="w-3 h-3" /> {gym.location?.locality || "Vaishali"}, {gym.location?.city || "Ghaziabad"}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {(gym.facilities || []).slice(0, 3).map(f => (
                                  <span key={f} className="px-2 py-0.5 rounded-md bg-[#111] border border-[#1a1a1a] text-[#888] text-[10px]">{f}</span>
                                ))}
                                {(gym.facilities || []).length > 3 && (
                                  <span className="px-2 py-0.5 rounded-md bg-[#111] border border-[#1a1a1a] text-[#666] text-[10px]">+{gym.facilities.length - 3}</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                                <div>
                                  <span className="text-[#39FF14] text-lg font-bold">₹{price}</span>
                                  <span className="text-[#666] text-xs">/month</span>
                                </div>
                                <div className="flex items-center gap-1 text-[#666] text-xs">
                                  <Clock className="w-3 h-3" /> {openTime} - {closeTime}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl">
                  <Dumbbell className="w-12 h-12 text-[#333] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">No gyms found</h3>
                  <p className="text-[#666] text-sm">Try adjusting your search query or filters</p>
                </div>
              )}
            </div>

            {/* Leaflet Map Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-[#1a1a1a] overflow-hidden bg-[#0d0d0d]">
                <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#39FF14]" /> Interactive Map
                  </h3>
                </div>
                <div 
                  id="leaflet-gyms-map" 
                  className="h-[480px] w-full"
                  style={{ background: "#050505" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function GymsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        Loading gyms module...
      </div>
    }>
      <GymsContent />
    </Suspense>
  );
}
