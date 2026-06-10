"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Dumbbell, MapPin, Plus, Trash2, Edit, Save, Star, Clock,
  Phone, Mail, Globe, Users, PlusCircle, CheckCircle2, ShieldAlert
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { gymAPI } from "@/lib/api";

const PREDEFINED_FACILITIES = [
  "AC", "Parking", "Personal Trainer", "Cardio Equipment",
  "Strength Equipment", "Locker Room", "Shower", "Wifi",
  "Yoga Studio", "Group Classes", "CrossFit Zone"
];

export default function GymOwnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myGym, setMyGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Form State for Registration / Details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [coordinates, setCoordinates] = useState("77.3410, 28.6439"); // default Vaishali coords
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [femaleFriendly, setFemaleFriendly] = useState(false);

  // Plan State
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ name: "", duration: "1 Month", price: "", features: "" });

  // Trainer State
  const [trainers, setTrainers] = useState([]);
  const [newTrainer, setNewTrainer] = useState({ name: "", specialization: "", experience: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("gymbuddy_token");
      const storedUser = localStorage.getItem("gymbuddy_user");
      if (!token || !storedUser) {
        router.push("/login");
        return;
      }
      const u = JSON.parse(storedUser);
      setUser(u);
      fetchOwnerGym(u);
    }
  }, []);

  const fetchOwnerGym = async (currentUser) => {
    try {
      setLoading(true);
      // Fetch all gyms (unfiltered) and search for owner matching currentUser._id
      const res = await gymAPI.search({ limit: 100 });
      if (res.data.success) {
        const foundGym = res.data.gyms.find(
          (g) => g.owner?._id === currentUser._id || g.owner === currentUser._id
        );
        if (foundGym) {
          setMyGym(foundGym);
          setName(foundGym.name || "");
          setDescription(foundGym.description || "");
          setAddress(foundGym.location?.address || "");
          setCity(foundGym.location?.city || "");
          setState(foundGym.location?.state || "");
          setContactPhone(foundGym.contactPhone || "");
          setContactEmail(foundGym.contactEmail || "");
          setWebsite(foundGym.website || "");
          setFacilities(foundGym.facilities || []);
          setFemaleFriendly(foundGym.femaleFriendly || false);
          setPlans(foundGym.membershipPlans || []);
          setTrainers(foundGym.trainers || []);
          
          if (foundGym.location?.coordinates) {
            setCoordinates(`${foundGym.location.coordinates[0]}, ${foundGym.location.coordinates[1]}`);
          }

          // Fetch reviews
          const revRes = await gymAPI.getReviews(foundGym._id);
          if (revRes.data.success) {
            setReviews(revRes.data.reviews);
          }
        }
      }
    } catch (err) {
      console.error("Error loading owner details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterGym = async (e) => {
    e.preventDefault();
    if (!name || !address || !city || !state || !contactPhone || !contactEmail) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const coords = coordinates.split(",").map(c => parseFloat(c.trim()));
      
      const gymData = {
        name,
        description,
        location: {
          type: "Point",
          coordinates: coords.length === 2 ? coords : [77.3410, 28.6439],
          address,
          city,
          state
        },
        facilities,
        membershipPlans: plans,
        trainers,
        femaleFriendly,
        contactPhone,
        contactEmail,
        website,
        openingHours: {
          monday: { open: "06:00", close: "22:00" },
          tuesday: { open: "06:00", close: "22:00" },
          wednesday: { open: "06:00", close: "22:00" },
          thursday: { open: "06:00", close: "22:00" },
          friday: { open: "06:00", close: "22:00" },
          saturday: { open: "06:00", close: "20:00" },
          sunday: { open: "07:00", close: "18:00" }
        }
      };

      const res = await gymAPI.create(gymData);
      if (res.data.success) {
        alert("Gym Registered Successfully! Verification pending by admin. 💪");
        
        // Update user local role since backend promotes to gymOwner
        const stored = localStorage.getItem("gymbuddy_user");
        if (stored) {
          const u = JSON.parse(stored);
          const updatedUser = { ...u, role: "gymOwner" };
          localStorage.setItem("gymbuddy_user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }

        fetchOwnerGym(user);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register gym.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGym = async () => {
    if (!myGym) return;
    try {
      setLoading(true);
      const coords = coordinates.split(",").map(c => parseFloat(c.trim()));
      const updateData = {
        name,
        description,
        location: {
          type: "Point",
          coordinates: coords.length === 2 ? coords : myGym.location.coordinates,
          address,
          city,
          state
        },
        facilities,
        membershipPlans: plans,
        trainers,
        femaleFriendly,
        contactPhone,
        contactEmail,
        website
      };

      const res = await gymAPI.update(myGym._id, updateData);
      if (res.data.success) {
        alert("Gym details updated successfully!");
        setMyGym(res.data.gym);
        setIsEditing(false);
        fetchOwnerGym(user);
      }
    } catch (err) {
      alert("Failed to update gym details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (fac) => {
    if (facilities.includes(fac)) {
      setFacilities(facilities.filter((f) => f !== fac));
    } else {
      setFacilities([...facilities, fac]);
    }
  };

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.price) {
      alert("Please fill name and price for plan");
      return;
    }
    const featuresArr = newPlan.features.split(",").map(f => f.trim()).filter(Boolean);
    const addedPlan = {
      name: newPlan.name,
      duration: newPlan.duration,
      price: parseFloat(newPlan.price),
      features: featuresArr
    };
    setPlans([...plans, addedPlan]);
    setNewPlan({ name: "", duration: "1 Month", price: "", features: "" });
  };

  const handleRemovePlan = (idx) => {
    setPlans(plans.filter((_, i) => i !== idx));
  };

  const handleAddTrainer = () => {
    if (!newTrainer.name || !newTrainer.specialization) {
      alert("Please enter trainer name and specialization");
      return;
    }
    setTrainers([...trainers, newTrainer]);
    setNewTrainer({ name: "", specialization: "", experience: "" });
  };

  const handleRemoveTrainer = (idx) => {
    setTrainers(trainers.filter((_, i) => i !== idx));
  };

  if (loading && !myGym) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Navbar />
        <div className="text-[#39FF14] text-xl font-bold flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#39FF14] animate-ping" /> Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      <section style={{ paddingTop: '100px' }} className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-8 border-b border-[#1a1a1a] pb-6">
            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3">
                <Dumbbell className="w-8 h-8 text-[#39FF14]" /> Gym Owner <span className="text-[#39FF14]">Dashboard</span>
              </h1>
              <p className="text-[#888] text-sm mt-1">Manage your listing, membership plans, and trainers</p>
            </div>
            {myGym && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-neon !px-5 !py-2.5 !text-xs !rounded-xl mx-auto"
              >
                <Edit className="w-4 h-4" /> Edit Gym Details
              </button>
            )}
          </div>

          {/* NOT REGISTERED FLOW */}
          {!myGym ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <PlusCircle className="text-[#39FF14] w-6 h-6" /> Register Your Gym Listing
              </h2>
              <form onSubmit={handleRegisterGym} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-[#888] mb-2 block">Gym Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-dark !rounded-xl" placeholder="e.g. Iron Paradise Gym" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] mb-2 block">Locality Address *</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="input-dark !rounded-xl" placeholder="e.g. B-12, Sector 3, Vaishali" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] mb-2 block">City *</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="input-dark !rounded-xl" placeholder="e.g. Ghaziabad" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] mb-2 block">State *</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} required className="input-dark !rounded-xl" placeholder="e.g. Uttar Pradesh" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] mb-2 block">Map Coordinates (Longitude, Latitude)</label>
                    <input type="text" value={coordinates} onChange={(e) => setCoordinates(e.target.value)} className="input-dark !rounded-xl" placeholder="e.g. 77.3410, 28.6439" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] mb-2 block">Contact Phone *</label>
                    <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required className="input-dark !rounded-xl" placeholder="e.g. +91 98765 43210" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] mb-2 block">Contact Email *</label>
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="input-dark !rounded-xl" placeholder="e.g. contact@gym.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#888] mb-2 block">Website Link</label>
                    <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-dark !rounded-xl" placeholder="e.g. https://mygym.com" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#888] mb-3 block">Description</label>
                  <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl text-white p-4 text-sm focus:border-[#39FF14] outline-none" placeholder="Provide a brief summary about your gym, facilities, and unique points..." />
                </div>

                {/* Facilities Selector */}
                <div>
                  <label className="text-xs font-semibold text-[#888] mb-4 block">Facilities Available</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {PREDEFINED_FACILITIES.map(fac => (
                      <label key={fac} className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border border-[#1a1a1a] bg-[#111] hover:border-[#39FF14] transition-all">
                        <input type="checkbox" checked={facilities.includes(fac)} onChange={() => handleFacilityToggle(fac)} className="w-4 h-4 accent-[#39FF14]" />
                        <span className="text-sm text-[#ccc]">{fac}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 py-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={femaleFriendly} onChange={(e) => setFemaleFriendly(e.target.checked)} className="w-4 h-4 accent-[#39FF14]" />
                    <span className="text-sm text-[#ccc] font-medium">Female Friendly Gym</span>
                  </label>
                </div>

                <button type="submit" className="btn-neon w-full !py-4 !text-base !font-bold mt-4">
                  Register Listing
                </button>
              </form>
            </motion.div>
          ) : (
            /* REGISTERED GYM DASHBOARD */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Gym Editor / Visuals */}
              <div className="lg:col-span-2 space-y-8">
                {isEditing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">Edit Gym Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-[#888] mb-1 block">Gym Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-dark !rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs text-[#888] mb-1 block">Locality Address</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-dark !rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs text-[#888] mb-1 block">Contact Phone</label>
                        <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="input-dark !rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs text-[#888] mb-1 block">Contact Email</label>
                        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input-dark !rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Description</label>
                      <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#111] border border-[#1a1a1a] rounded-xl text-white p-3 text-sm focus:border-[#39FF14] outline-none" />
                    </div>
                    {/* Facilities Selector */}
                    <div>
                      <label className="text-xs font-semibold text-[#888] mb-3 block">Facilities</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {PREDEFINED_FACILITIES.map(fac => (
                          <label key={fac} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#1a1a1a] bg-[#111]">
                            <input type="checkbox" checked={facilities.includes(fac)} onChange={() => handleFacilityToggle(fac)} className="w-4 h-4 accent-[#39FF14]" />
                            <span className="text-xs text-[#ccc]">{fac}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={handleUpdateGym} className="btn-neon !px-5 !py-2.5 !text-xs !rounded-xl">
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                      <button onClick={() => setIsEditing(false)} className="btn-outline !px-5 !py-2.5 !text-xs !rounded-xl">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-white">{myGym.name}</h2>
                      {myGym.isVerified ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-bold">✓ VERIFIED LISTING</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">PENDING VERIFICATION</span>
                      )}
                    </div>
                    <p className="text-[#888] text-sm">{myGym.description || "No description provided."}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-sm text-[#aaa]">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#39FF14]" /> {myGym.location.address}, {myGym.location.city}</div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#39FF14]" /> {myGym.contactPhone}</div>
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#39FF14]" /> {myGym.contactEmail}</div>
                    </div>
                  </div>
                )}

                {/* Membership Plans Configurator */}
                <div className="p-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] space-y-6">
                  <h3 className="text-xl font-bold text-white">Membership Plans</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {plans.map((plan, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#111] border border-[#1a1a1a] relative group">
                        <button onClick={() => handleRemovePlan(i)} className="absolute top-3 right-3 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#39FF14]/10 text-[#39FF14]">{plan.duration}</span>
                        </div>
                        <div className="text-xl font-black text-[#39FF14] mb-3">₹{plan.price}</div>
                        <ul className="text-xs text-[#888] space-y-1">
                          {(plan.features || []).map((f, j) => (
                            <li key={j} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]" /> {f}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Add Plan Form */}
                  <div className="p-4 rounded-xl border border-dashed border-[#2a2a2a] bg-black/30 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="text-[10px] text-[#888] block mb-1">Plan Name</label>
                      <input type="text" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} className="input-dark !rounded-lg !text-xs !py-2" placeholder="Basic / Premium" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] block mb-1">Duration</label>
                      <select value={newPlan.duration} onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })} className="input-dark !rounded-lg !text-xs !py-2">
                        <option value="1 Month">1 Month</option><option value="3 Months">3 Months</option><option value="6 Months">6 Months</option><option value="12 Months">12 Months</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] block mb-1">Price (₹)</label>
                      <input type="number" value={newPlan.price} onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })} className="input-dark !rounded-lg !text-xs !py-2" placeholder="Price" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] block mb-1">Features (comma separated)</label>
                      <input type="text" value={newPlan.features} onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })} className="input-dark !rounded-lg !text-xs !py-2" placeholder="Gym Access, Locker" />
                    </div>
                    <button onClick={handleAddPlan} className="btn-neon sm:col-span-4 !py-2 !text-xs !rounded-lg">
                      <Plus className="w-3.5 h-3.5" /> Add Membership Plan
                    </button>
                  </div>
                </div>

                {/* Trainers Configurator */}
                <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] space-y-5">
                  <h3 className="text-lg font-bold text-white">Certificated Trainers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {trainers.map((trainer, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#111] border border-[#1a1a1a] text-center relative group">
                        <button onClick={() => handleRemoveTrainer(i)} className="absolute top-3 right-3 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-12 h-12 rounded-full bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14] font-black text-sm mx-auto mb-2">
                          {trainer.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <h4 className="font-bold text-white text-sm">{trainer.name}</h4>
                        <p className="text-xs text-[#39FF14] mt-0.5">{trainer.specialization}</p>
                        <p className="text-[10px] text-[#666]">{trainer.experience}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Trainer Form */}
                  <div className="p-4 rounded-xl border border-dashed border-[#2a2a2a] bg-black/30 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-[10px] text-[#888] block mb-1">Trainer Name</label>
                      <input type="text" value={newTrainer.name} onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })} className="input-dark !rounded-lg !text-xs !py-2" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] block mb-1">Specialization</label>
                      <input type="text" value={newTrainer.specialization} onChange={(e) => setNewTrainer({ ...newTrainer, specialization: e.target.value })} className="input-dark !rounded-lg !text-xs !py-2" placeholder="Yoga, CrossFit" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#888] block mb-1">Experience (e.g. 5 Years)</label>
                      <input type="text" value={newTrainer.experience} onChange={(e) => setNewTrainer({ ...newTrainer, experience: e.target.value })} className="input-dark !rounded-lg !text-xs !py-2" placeholder="5 Years" />
                    </div>
                    <button onClick={handleAddTrainer} className="btn-neon sm:col-span-3 !py-2 !text-xs !rounded-lg">
                      <Plus className="w-3.5 h-3.5" /> Add Trainer
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar stats & Reviews */}
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] text-center">
                  <div className="text-xs text-[#888] mb-1">Gym Overall Rating</div>
                  <div className="text-4xl font-black text-white flex items-center justify-center gap-2 mb-2">
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" /> {myGym.ratings?.overall || "0"}
                  </div>
                  <div className="text-[10px] text-[#666]">Based on {myGym.ratings?.totalReviews || "0"} user reviews</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-[#1a1a1a] pb-2">Recent Customer Reviews</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev._id} className="p-3 bg-[#111] rounded-lg border border-[#1a1a1a] text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-white">{rev.user?.fullName || "GymBuddy User"}</span>
                            <span className="text-yellow-400">★ {rev.rating?.overall}</span>
                          </div>
                          <p className="text-[#888]">{rev.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#555] text-center py-4">No reviews submitted yet.</p>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] space-y-3 text-xs">
                  <h3 className="font-bold text-white">Opening Hours</h3>
                  {Object.entries(myGym.openingHours || {}).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-[#888]">
                      <span className="capitalize">{day}</span>
                      <span className="text-white">{hours.open} - {hours.close}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
