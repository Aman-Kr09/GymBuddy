"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Star, Clock, Filter, Search, ChevronRight, Users,
  Dumbbell, Heart, Navigation, Sparkles, Zap, ArrowRight, CheckCircle2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { gymAPI, userAPI, chatAPI } from "@/lib/api";

/* ─── Gym Card ─── */
function GymCard({ gym, delay, isSaved, onToggleSave }) {
  const colors = ["from-emerald-500 to-teal-600", "from-blue-500 to-indigo-600", "from-purple-500 to-pink-600", "from-orange-500 to-red-600"];
  const bgColor = colors[Math.abs(hashString(gym._id)) % colors.length];

  // Helper to hash string for color mapping
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  const overallRating = gym.ratings?.overall || 0;
  const totalReviews = gym.ratings?.totalReviews || 0;
  const locality = gym.location?.locality || "Unknown Locality";
  const city = gym.location?.city || "";
  const price = gym.membershipPlans?.[0]?.price || 0;
  const openTime = gym.openingHours?.monday?.open || "06:00";
  const closeTime = gym.openingHours?.monday?.close || "22:00";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group"
    >
      <div className="rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[rgba(57,255,20,0.2)] overflow-hidden transition-all duration-400 hover-lift">
        <Link href={`/gyms/${gym._id}`}>
          <div className={`h-44 bg-gradient-to-br ${bgColor} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="w-12 h-12 text-white/30" />
            </div>
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {gym.isVerified && (
                <span className="px-2.5 py-1 rounded-full bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-bold backdrop-blur-sm">
                  ✓ VERIFIED
                </span>
              )}
              {gym.femaleFriendly && (
                <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold backdrop-blur-sm">
                  FEMALE FRIENDLY
                </span>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(gym._id);
              }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors ${
                isSaved ? "text-red-400 hover:text-white" : "text-white/70 hover:text-red-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-red-400" : ""}`} />
            </button>

            {/* Distance */}
            {gym.distance && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1">
                <Navigation className="w-3 h-3" /> {gym.distance}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-bold text-white group-hover:text-[#39FF14] transition-colors line-clamp-1">
                {gym.name}
              </h3>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-sm font-semibold">{overallRating}</span>
                <span className="text-[#666] text-xs">({totalReviews})</span>
              </div>
            </div>

            <p className="text-[#666] text-xs flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3" /> {locality}{city ? `, ${city}` : ""}
            </p>

            {/* Facilities */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(gym.facilities || []).slice(0, 3).map((f) => (
                <span key={f} className="px-2 py-0.5 rounded-md bg-[#111] border border-[#1a1a1a] text-[#888] text-[10px]">
                  {f}
                </span>
              ))}
              {(gym.facilities || []).length > 3 && (
                <span className="px-2 py-0.5 rounded-md bg-[#111] border border-[#1a1a1a] text-[#666] text-[10px]">
                  +{(gym.facilities || []).length - 3}
                </span>
              )}
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
              <div>
                <span className="text-[#39FF14] text-lg font-bold">
                  ₹{price}
                </span>
                <span className="text-[#666] text-xs">/month</span>
              </div>
              <div className="flex items-center gap-1 text-[#666] text-xs">
                <Clock className="w-3 h-3" />
                {openTime} - {closeTime}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Buddy Card ─── */
function BuddyCard({ buddy, delay, onConnect, onMessage, connectionSent }) {
  const locality = buddy.location?.locality || "Vaishali";
  const fitnessGoals = buddy.fitnessGoals || [];
  const workoutTime = buddy.preferredWorkoutTime || "morning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[rgba(57,255,20,0.2)] transition-all duration-300 hover-lift"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black font-bold text-lg shrink-0">
          {buddy.fullName?.split(" ").map((n) => n[0]).join("") || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">{buddy.fullName}</h3>
          <p className="text-[#666] text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {locality} {buddy.distance && `· ${buddy.distance}`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[#39FF14] text-lg font-black">{buddy.compatibility || 85}%</div>
          <div className="text-[#666] text-[10px]">Match</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {fitnessGoals.map((g) => (
          <span key={g} className="tag !text-[10px] !py-0.5 !px-2">{g}</span>
        ))}
        <span className="px-2 py-0.5 rounded-full bg-[#111] border border-[#1a1a1a] text-[#888] text-[10px] capitalize">
          {workoutTime}
        </span>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onConnect(buddy._id)}
          disabled={connectionSent}
          className={`flex-1 !py-2 !text-xs !rounded-xl transition-all ${
            connectionSent 
              ? "bg-[#111] border border-[#1a1a1a] text-[#555] cursor-not-allowed" 
              : "btn-neon"
          }`}
        >
          {connectionSent ? "Requested" : "Connect"}
        </button>
        <button 
          onClick={() => onMessage(buddy._id)}
          className="btn-outline flex-1 !py-2 !text-xs !rounded-xl"
        >
          Message
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════ HOME PAGE ═══════════ */
export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nearbyGyms, setNearbyGyms] = useState([]);
  const [recommendedGyms, setRecommendedGyms] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [savedGymIds, setSavedGymIds] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle, loading, success, error

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("gymbuddy_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const storedUser = localStorage.getItem("gymbuddy_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setSavedGymIds(parsed.savedGyms || []);
          
          // Request browser geolocation to find gyms/buddies nearby
          requestLocation(parsed);
        } catch (err) {
          router.push("/login");
        }
      }
    }
  }, []);

  const requestLocation = (currentUser) => {
    if (navigator.geolocation) {
      setLocationStatus("loading");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;
          setLocationStatus("success");
          try {
            // Update location in backend
            const locRes = await userAPI.updateLocation({
              longitude,
              latitude,
              city: "Ghaziabad",
              locality: "Vaishali"
            });
            
            if (locRes.data.success) {
              const updatedUser = locRes.data.user;
              localStorage.setItem("gymbuddy_user", JSON.stringify(updatedUser));
              setUser(updatedUser);
              fetchHomeData(longitude, latitude);
            } else {
              // Fallback if update fails
              fetchHomeData(longitude, latitude);
            }
          } catch (err) {
            console.error("Failed to save geolocated coordinates:", err);
            fetchHomeData(longitude, latitude);
          }
        },
        (error) => {
          console.warn("Geolocation permission denied or failed. Using profile default coordinates.");
          setLocationStatus("error");
          // Use user's profile location coordinates or default Ghaziabad coords
          const coords = currentUser.location?.coordinates || [77.3410, 28.6439];
          fetchHomeData(coords[0], coords[1]);
        }
      );
    } else {
      setLocationStatus("error");
      const coords = currentUser.location?.coordinates || [77.3410, 28.6439];
      fetchHomeData(coords[0], coords[1]);
    }
  };

  const fetchHomeData = async (lng, lat) => {
    try {
      setLoading(true);
      const [nearbyRes, recRes, buddiesRes, requestsRes] = await Promise.all([
        gymAPI.getNearby({ longitude: lng, latitude: lat, limit: 4 }),
        gymAPI.getRecommended(),
        userAPI.getBuddies({ maxDistance: 15000, limit: 3 }),
        userAPI.getFriends() // fetch friends list or request status if needed
      ]);

      if (nearbyRes.data.success) {
        setNearbyGyms(nearbyRes.data.gyms);
      }
      if (recRes.data.success) {
        setRecommendedGyms(recRes.data.gyms);
      }
      if (buddiesRes.data.success) {
        setBuddies(buddiesRes.data.buddies);
      }
      
      // Fetch friend requests to track sent requests
      const reqRes = await apiGetFriendRequests();
      if (reqRes) {
        setSentRequests(reqRes.sent.map(r => r._id));
      }
    } catch (error) {
      console.error("Error loading home page details:", error);
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
        const updatedUser = { ...user, savedGyms: updatedSaved };
        localStorage.setItem("gymbuddy_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Error saving/unsaving gym:", error);
    }
  };

  const handleSendFriendRequest = async (buddyId) => {
    try {
      const res = await userAPI.sendFriendRequest(buddyId);
      if (res.data.success) {
        setSentRequests([...sentRequests, buddyId]);
        alert("Friend request sent successfully! 💪");
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/gyms?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      {/* Hero Banner */}
      <section style={{ paddingTop: '100px' }} className="pb-8 px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-[rgba(57,255,20,0.03)] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center flex flex-col items-center"
          >
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              {user ? (
                <>
                  Hey{" "}
                  <span className="text-[#39FF14]">{user.fullName?.split(" ")[0]}</span> 👋
                </>
              ) : (
                <>Discover <span className="text-[#39FF14]">Gyms</span> Near You</>
              )}
            </h1>
            <p className="text-[#888] text-sm mb-3">
              Find the best gyms and workout partners in your area
            </p>
            <Link
              href="/gym-owner"
              className="mb-6 text-xs text-[#39FF14] hover:underline flex items-center justify-center gap-1"
            >
              Own a gym? Add it to GymBuddy
            </Link>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
            <input
              id="home-search"
              type="text"
              placeholder="Search gyms, locations, or facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-14 pr-28 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl text-white text-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[rgba(57,255,20,0.2)] outline-none transition-all"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-neon !py-2.5 !px-5 !text-xs !rounded-xl">
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* Geolocation Loading Indicators */}
      {locationStatus === "loading" && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="text-xs text-[#39FF14] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
            Detecting your current location for gyms and partners...
          </div>
        </div>
      )}

      {/* Nearby Gyms */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#39FF14]" /> Nearby Gyms
              </h2>
              <p className="text-[#666] text-xs mt-1">Based on your location</p>
            </div>
            <Link
              href="/gyms"
              className="text-[#39FF14] text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-72 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : nearbyGyms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyGyms.map((gym, i) => (
                <GymCard
                  key={gym._id}
                  gym={gym}
                  delay={i * 0.08}
                  isSaved={savedGymIds.includes(gym._id)}
                  onToggleSave={handleToggleSaveGym}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
              <Dumbbell className="w-12 h-12 text-[#333] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No gyms found near you</h3>
              <p className="text-[#666] text-sm mb-4">Try checking your geolocation settings</p>
              <Link href="/gyms" className="btn-outline !py-2 !px-4 !text-xs">
                Browse All Gyms
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#39FF14]" /> AI Recommended Gyms
              </h2>
              <p className="text-[#666] text-xs mt-1">Personalized matching your goals</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2].map(n => (
                <div key={n} className="h-72 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : recommendedGyms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {recommendedGyms.slice(0, 4).map((gym, i) => (
                <GymCard
                  key={gym._id}
                  gym={gym}
                  delay={i * 0.08}
                  isSaved={savedGymIds.includes(gym._id)}
                  onToggleSave={handleToggleSaveGym}
                />
              ))}
            </div>
          ) : null}

          <div className="p-8 rounded-2xl bg-gradient-to-r from-[#0d0d0d] to-[#111] border border-[#1a1a1a] flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-white mb-1">
                Explore Workout Partners & Buddies
              </h3>
              <p className="text-[#888] text-sm">
                Our compatibility matching system calculates match scores based on your workout schedules, interests, levels, and gyms.
              </p>
            </div>
            <Link href="/buddies" className="btn-neon !text-sm shrink-0">
              Find Partners <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended Buddies */}
      <section className="py-12 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#39FF14]" /> Compatible Workout Buddies
              </h2>
              <p className="text-[#666] text-xs mt-1">People who fit your fitness preferences</p>
            </div>
            <Link
              href="/buddies"
              className="text-[#39FF14] text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-56 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : buddies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {buddies.map((buddy, i) => (
                <BuddyCard
                  key={buddy._id}
                  buddy={buddy}
                  delay={i * 0.08}
                  onConnect={handleSendFriendRequest}
                  onMessage={handleStartMessage}
                  connectionSent={sentRequests.includes(buddy._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
              <Users className="w-12 h-12 text-[#333] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No buddies found</h3>
              <p className="text-[#666] text-sm">Update your fitness interests in profile to match with others.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
