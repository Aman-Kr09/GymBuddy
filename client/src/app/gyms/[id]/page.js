"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Star, Clock, Phone, Mail, Globe, Navigation, Heart,
  Dumbbell, Shield, ChevronLeft, ExternalLink, Share2,
  Snowflake, Car, Wifi, User, Award, CheckCircle2, Send
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { gymAPI, userAPI } from "@/lib/api";

const facilityIcons = {
  AC: Snowflake, Parking: Car, Wifi: Wifi,
  "Personal Trainer": User, "Cardio Equipment": Dumbbell,
  "Strength Equipment": Dumbbell, "Locker Room": Shield,
  Shower: Shield,
};

export default function GymDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gymId = params.id;

  const [gym, setGym] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(0);

  // Review Form state
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingFacilities, setRatingFacilities] = useState(5);
  const [ratingTrainers, setRatingTrainers] = useState(5);
  const [ratingCleanliness, setRatingCleanliness] = useState(5);
  const [ratingEnvironment, setRatingEnvironment] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Leaflet map mounting
  const [mapMounted, setMapMounted] = useState(false);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    setMapMounted(true);
    fetchGymDetails();
  }, [gymId]);

  useEffect(() => {
    if (!mapMounted || typeof window === "undefined" || !gym?.location?.coordinates) return;

    // Load leaflet client-side
    import("leaflet").then((L) => {
      // Fix leaflet icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const container = document.getElementById("leaflet-gym-detail-map");
      if (!container) return;

      // Clear existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const coords = gym.location.coordinates; // [lng, lat]
      const latLng = [coords[1], coords[0]];

      const map = L.map(container).setView(latLng, 15);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(map);

      L.marker(latLng)
        .addTo(map)
        .bindPopup(`<strong style="color: black;">${gym.name}</strong><br/><span style="color: black;">${gym.location.address || ""}</span>`)
        .openPopup();
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [gym, mapMounted]);

  const fetchGymDetails = async () => {
    try {
      setLoading(true);
      const [gymRes, reviewsRes] = await Promise.all([
        gymAPI.getById(gymId),
        gymAPI.getReviews(gymId)
      ]);

      if (gymRes.data.success) {
        setGym(gymRes.data.gym);
        
        // Check if gym is saved by reading user profile
        const stored = localStorage.getItem("gymbuddy_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            setSaved((u.savedGyms || []).includes(gymRes.data.gym._id));
          } catch {}
        }
      }

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching gym details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    try {
      const res = await userAPI.toggleSaveGym(gymId);
      if (res.data.success) {
        setSaved(res.data.saved);
        
        // Update user storage locally
        const stored = localStorage.getItem("gymbuddy_user");
        if (stored) {
          const u = JSON.parse(stored);
          let updatedSaved = u.savedGyms || [];
          if (res.data.saved) {
            updatedSaved = [...updatedSaved, gymId];
          } else {
            updatedSaved = updatedSaved.filter(id => id !== gymId);
          }
          const updatedUser = { ...u, savedGyms: updatedSaved };
          localStorage.setItem("gymbuddy_user", JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error saving/unsaving gym:", error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const data = {
        rating: {
          overall: ratingOverall,
          facilities: ratingFacilities,
          trainers: ratingTrainers,
          cleanliness: ratingCleanliness,
          environment: ratingEnvironment
        },
        text: reviewText
      };

      const res = await gymAPI.addReview(gymId, data);
      if (res.data.success) {
        alert("Review submitted successfully! Thank you!");
        setReviewText("");
        // Reload details and reviews
        fetchGymDetails();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review. Have you already reviewed this gym?");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Navbar />
        <div className="text-[#39FF14] text-xl font-bold flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#39FF14] animate-ping" /> Loading gym details...
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <Navbar />
        <h2 className="text-white text-2xl font-bold mb-4">Gym not found</h2>
        <Link href="/gyms" className="btn-neon !px-5 !py-3">
          Back to Gyms
        </Link>
      </div>
    );
  }

  const facilities = gym.facilities || [];
  const membershipPlans = gym.membershipPlans || [];
  const trainers = gym.trainers || [];
  const openingHours = gym.openingHours || {};
  const ratings = gym.ratings || { overall: 0, facilities: 0, trainers: 0, cleanliness: 0, environment: 0, totalReviews: 0 };
  const overallVal = ratings.overall || 0;
  const colors = ["from-emerald-500 to-teal-600", "from-blue-500 to-indigo-600", "from-purple-500 to-pink-600"];

  return (
    <div className="min-h-screen bg-[#050505]">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <Navbar />

      {/* Back Button */}
      <div style={{ paddingTop: '100px' }} className="px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/gyms"
            className="inline-flex items-center gap-2 text-[#888] text-sm hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Gyms
          </Link>
        </div>
      </div>

      {/* Gallery */}
      <section className="px-4 mb-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[300px] md:h-[400px]">
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Dumbbell className="w-20 h-20 text-white/20" />
              </div>
              {gym.isVerified && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#39FF14]/20 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                  <span className="text-[#39FF14] text-xs font-bold">VERIFIED</span>
                </div>
              )}
            </div>
            <div className="hidden md:grid grid-rows-2 gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="w-10 h-10 text-white/20" />
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="w-10 h-10 text-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{gym.name}</h1>
                  <p className="text-[#888] text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {gym.location?.address || ""}, {gym.location?.city || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSave}
                    className={`p-3 rounded-xl border transition-all ${
                      saved
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-[#111] border-[#1a1a1a] text-[#666] hover:text-white"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${saved ? "fill-red-400" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a]">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-lg">{overallVal}</span>
                  <span className="text-[#666] text-sm">({ratings.totalReviews || 0} reviews)</span>
                </div>
                {gym.femaleFriendly && (
                  <span className="tag !text-xs !bg-pink-500/10 !text-pink-400 !border-pink-500/20">Female Friendly</span>
                )}
              </div>
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-xl font-bold text-white mb-3">About</h2>
              <p className="text-[#888] text-sm leading-relaxed">{gym.description}</p>
            </motion.div>

            {/* Facilities */}
            {facilities.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h2 className="text-xl font-bold text-white mb-4">Facilities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {facilities.map((f) => {
                    const Icon = facilityIcons[f] || Shield;
                    return (
                      <div key={f} className="flex items-center gap-3 p-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a]">
                        <Icon className="w-5 h-5 text-[#39FF14] shrink-0" />
                        <span className="text-[#ccc] text-xs font-medium">{f}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Membership Plans */}
            {membershipPlans.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-xl font-bold text-white mb-4">Membership Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {membershipPlans.map((plan, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedPlan(i)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all ${
                        selectedPlan === i
                          ? "bg-[rgba(57,255,20,0.05)] border-[#39FF14]/30 shadow-[0_0_20px_rgba(57,255,20,0.1)]"
                          : "bg-[#0d0d0d] border-[#1a1a1a] hover:border-[#2a2a2a]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-white">{plan.name}</h3>
                        <span className="tag !text-[10px]">{plan.duration}</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-[#39FF14] text-3xl font-black">₹{plan.price}</span>
                        <span className="text-[#666] text-sm ml-1">/{plan.duration.toLowerCase()}</span>
                      </div>
                      <ul className="space-y-2">
                        {(plan.features || []).map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-[#aaa] text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trainers */}
            {trainers.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="text-xl font-bold text-white mb-4">Trainers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {trainers.map((trainer, i) => (
                    <div key={i} className="p-5 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] text-center">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black font-bold text-xl mb-3">
                        {trainer.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">{trainer.name}</h3>
                      <p className="text-[#39FF14] text-xs font-medium mb-1">{trainer.specialization}</p>
                      <p className="text-[#666] text-xs">{trainer.experience}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
              <h2 className="text-xl font-bold text-white">Reviews & Ratings</h2>

              {/* Rating Breakdown */}
              <div className="p-5 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Facilities", value: ratings.facilities || 0 },
                  { label: "Trainers", value: ratings.trainers || 0 },
                  { label: "Cleanliness", value: ratings.cleanliness || 0 },
                  { label: "Environment", value: ratings.environment || 0 },
                ].map((r) => (
                  <div key={r.label} className="text-center">
                    <div className="text-2xl font-black text-white mb-1">{r.value}</div>
                    <div className="text-[#666] text-xs">{r.label}</div>
                    <div className="mt-2 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#39FF14] rounded-full"
                        style={{ width: `${((r.value || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Review Form */}
              <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
                <h3 className="text-base font-bold text-white mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Overall", value: ratingOverall, setter: setRatingOverall },
                      { label: "Facilities", value: ratingFacilities, setter: setRatingFacilities },
                      { label: "Trainers", value: ratingTrainers, setter: setRatingTrainers },
                      { label: "Cleanliness", value: ratingCleanliness, setter: setRatingCleanliness },
                      { label: "Environment", value: ratingEnvironment, setter: setRatingEnvironment }
                    ].map(r => (
                      <div key={r.label}>
                        <label className="text-[10px] text-[#666] uppercase block mb-1">{r.label}</label>
                        <select
                          value={r.value}
                          onChange={(e) => r.setter(parseInt(e.target.value))}
                          className="input-dark !rounded-lg !text-xs !py-1.5"
                        >
                          {[5, 4, 3, 2, 1].map(n => (
                            <option key={n} value={n}>{n} ★</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-[#888] block mb-2">Share your experience</label>
                    <textarea
                      rows={3}
                      placeholder="What did you like or dislike about this gym?"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl text-white p-3 text-sm focus:border-[#39FF14] outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-neon !py-2.5 !text-xs !rounded-xl"
                  >
                    <Send className="w-3.5 h-3.5" /> {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="p-5 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black text-xs font-bold">
                            {review.user?.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">{review.user?.fullName || "GymBuddy User"}</h4>
                            <p className="text-[#666] text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < (review.rating?.overall || 0) ? "text-yellow-400 fill-yellow-400" : "text-[#333]"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#aaa] text-sm leading-relaxed">{review.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#555] text-center text-sm py-6">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sticky top-24 space-y-5"
            >
              <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
                <h3 className="text-lg font-bold text-white mb-4">Get Started</h3>
                {membershipPlans.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-[#888] mb-1">Selected Plan: <strong className="text-white">{membershipPlans[selectedPlan]?.name}</strong></p>
                    <span className="text-[#39FF14] text-2xl font-black">₹{membershipPlans[selectedPlan]?.price}</span>
                    <span className="text-[#666] text-xs">/{membershipPlans[selectedPlan]?.duration.toLowerCase()}</span>
                  </div>
                )}
                <button
                  onClick={() => alert("Registration session successfully created. Meet your buddies at the gym! 💪")}
                  className="btn-neon w-full !py-3.5 mb-3"
                >
                  <Dumbbell className="w-4 h-4" /> Join Gym
                </button>
              </div>

              {/* Map Integration */}
              <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
                <h3 className="text-lg font-bold text-white mb-4">Location Map</h3>
                <div 
                  id="leaflet-gym-detail-map" 
                  className="h-44 w-full rounded-xl"
                  style={{ background: "#050505" }}
                />
              </div>

              {/* Contact Card */}
              <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
                <h3 className="text-lg font-bold text-white mb-4">Contact Details</h3>
                <div className="space-y-3">
                  {gym.contactPhone && (
                    <a href={`tel:${gym.contactPhone}`} className="flex items-center gap-3 text-[#aaa] text-sm hover:text-[#39FF14] transition-colors">
                      <Phone className="w-4 h-4 text-[#39FF14]" /> {gym.contactPhone}
                    </a>
                  )}
                  {gym.contactEmail && (
                    <a href={`mailto:${gym.contactEmail}`} className="flex items-center gap-3 text-[#aaa] text-sm hover:text-[#39FF14] transition-colors">
                      <Mail className="w-4 h-4 text-[#39FF14]" /> {gym.contactEmail}
                    </a>
                  )}
                  {gym.website && (
                    <a href={gym.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[#aaa] text-sm hover:text-[#39FF14] transition-colors">
                      <Globe className="w-4 h-4 text-[#39FF14]" /> Visit Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Hours Card */}
              {Object.keys(openingHours).length > 0 && (
                <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#39FF14]" /> Opening Hours
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(openingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-[#aaa] text-xs capitalize">{day}</span>
                        <span className="text-white text-xs font-medium">
                          {hours?.open || "06:00"} - {hours?.close || "22:00"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
