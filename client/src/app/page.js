"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Dumbbell,
  MapPin,
  Users,
  Brain,
  Star,
  MessageCircle,
  Shield,
  Zap,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  Heart,
  Search,
  UserPlus,
  CalendarCheck,
} from "lucide-react";
import Footer from "@/components/layout/Footer";

/* ─── Animated Counter ─── */
function Counter({ end, suffix = "", label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="text-center">
      <motion.div
        className="text-4xl md:text-5xl font-black text-white mb-2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, type: "spring" }}
      >
        {isInView ? end : 0}
        <span className="text-[#39FF14]">{suffix}</span>
      </motion.div>
      <p className="text-[#666] text-sm font-medium">{label}</p>
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative p-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[rgba(57,255,20,0.2)] transition-all duration-500 hover-lift"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[rgba(57,255,20,0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-[rgba(57,255,20,0.08)] border border-[rgba(57,255,20,0.1)] flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(57,255,20,0.15)] transition-shadow duration-500">
          <Icon className="w-7 h-7 text-[#39FF14]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-[#888] text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* ─── Step Card ─── */
function StepCard({ number, icon: Icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative text-center"
    >
      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
        <Icon className="w-9 h-9 text-black" strokeWidth={2} />
      </div>
      <div className="absolute -top-3 -right-3 md:right-auto md:left-1/2 md:ml-8 w-8 h-8 rounded-full bg-[#111] border-2 border-[#39FF14] flex items-center justify-center text-[#39FF14] text-xs font-bold">
        {number}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-[#888] text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
    </motion.div>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({ name, role, text, avatar, rating, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-7 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all"
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-[#333]"}`}
          />
        ))}
      </div>
      <p className="text-[#ccc] text-sm leading-relaxed mb-6 italic">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black font-bold text-sm">
          {avatar}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{name}</p>
          <p className="text-[#666] text-xs">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════ LANDING PAGE ═══════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden">
      {/* ─── Top Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-[#1a1a1a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#39FF14] to-[#2bcc10] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)]">
              <Dumbbell className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-white">
              Gym<span className="text-[#39FF14]">Buddy</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-[#a0a0a0] hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex btn-outline !py-2 !px-5 !text-xs">
              Log In
            </Link>
            <Link href="/signup" className="btn-neon !py-2 !px-5 !text-xs">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 grid-pattern">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[rgba(57,255,20,0.03)] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[rgba(57,255,20,0.02)] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(57,255,20,0.06)] border border-[rgba(57,255,20,0.12)] mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#39FF14]" />
            <span className="text-[#39FF14] text-xs font-semibold tracking-wide">
              AI-POWERED FITNESS PLATFORM
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-8"
          >
            <span className="text-white">Find Your</span>
            <br />
            <span className="text-shimmer">Perfect Gym</span>
            <br />
            <span className="text-white">&amp; </span>
            <span className="text-[#39FF14]" style={{ textShadow: "0 0 40px rgba(57,255,20,0.3)" }}>
              Workout Buddy
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="max-w-2xl mx-auto text-[#888] text-lg md:text-xl leading-relaxed mb-10"
          >
            Discover top-rated gyms near you, match with workout partners who share your
            fitness goals, and get AI-powered recommendations — all in one platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/signup" className="btn-neon !py-3.5 !px-8 !text-base group">
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="btn-outline !py-3.5 !px-8 !text-base">
              Explore Features
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: "500", suffix: "+", label: "Gyms Listed" },
              { value: "10K", suffix: "+", label: "Active Users" },
              { value: "95", suffix: "%", label: "Match Rate" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-white">
                  {stat.value}
                  <span className="text-[#39FF14]">{stat.suffix}</span>
                </div>
                <p className="text-[#666] text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#333] flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-[#39FF14]" />
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="section-padding relative">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="tag mb-4 inline-block">
              <Zap className="w-3 h-3 mr-1" /> FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything You Need to{" "}
              <span className="text-[#39FF14]">Level Up</span>
            </h2>
            <p className="text-[#888] text-base max-w-xl mx-auto">
              From finding the perfect gym to matching with your ideal workout
              partner — GymBuddy has you covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={MapPin}
              title="Location-Based Discovery"
              description="Find gyms near your exact location with real-time distance, ratings, photos, and pricing — so you always know what's nearby."
              delay={0}
            />
            <FeatureCard
              icon={Brain}
              title="AI Recommendations"
              description="Our machine learning engine analyzes your goals, budget, and preferences to recommend the best gyms and workout partners."
              delay={0.1}
            />
            <FeatureCard
              icon={Users}
              title="Buddy Matching"
              description="Get matched with workout partners based on fitness goals, gym preference, schedule, and compatibility score."
              delay={0.2}
            />
            <FeatureCard
              icon={Star}
              title="Reviews & Ratings"
              description="Read and write honest reviews with multi-category ratings for facilities, trainers, cleanliness, and environment."
              delay={0.3}
            />
            <FeatureCard
              icon={MessageCircle}
              title="Real-Time Chat"
              description="Connect and chat with your gym buddies in real-time. Plan workouts, share progress, and stay motivated together."
              delay={0.4}
            />
            <FeatureCard
              icon={Shield}
              title="Verified Gyms"
              description="All gym listings are verified for accuracy. Browse trusted membership plans, facilities, and trainer profiles."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section
        id="how-it-works"
        className="section-padding bg-[#080808] border-t border-b border-[#1a1a1a]"
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="tag mb-4 inline-block">
              <Target className="w-3 h-3 mr-1" /> HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Get Started in{" "}
              <span className="text-[#39FF14]">3 Simple Steps</span>
            </h2>
            <p className="text-[#888] text-base max-w-xl mx-auto">
              From sign up to your first workout session — it takes less than 5 minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[rgba(57,255,20,0.2)] to-transparent" />

            <StepCard
              number="1"
              icon={Search}
              title="Create Your Profile"
              description="Sign up with your fitness goals, preferred workout times, and location to personalize your experience."
              delay={0}
            />
            <StepCard
              number="2"
              icon={UserPlus}
              title="Discover & Match"
              description="Browse nearby gyms with detailed info and get matched with compatible workout buddies near you."
              delay={0.15}
            />
            <StepCard
              number="3"
              icon={CalendarCheck}
              title="Connect & Train"
              description="Chat with your buddy, schedule workout sessions, and start your fitness journey together."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(57,255,20,0.03)] to-transparent" />
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          <Counter end="500" suffix="+" label="Gyms Listed" />
          <Counter end="10K" suffix="+" label="Active Users" />
          <Counter end="25K" suffix="+" label="Buddy Matches" />
          <Counter end="4.9" suffix="" label="App Rating" />
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section
        id="testimonials"
        className="section-padding bg-[#080808] border-t border-b border-[#1a1a1a]"
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="tag mb-4 inline-block">
              <Heart className="w-3 h-3 mr-1" /> TESTIMONIALS
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Loved by <span className="text-[#39FF14]">Fitness Enthusiasts</span>
            </h2>
            <p className="text-[#888] text-base max-w-xl mx-auto">
              See what our users have to say about their GymBuddy experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              name="Rahul Sharma"
              role="Bodybuilder, Delhi"
              text="GymBuddy helped me find an amazing gym near my office and a workout partner who pushes me to go harder every day. The AI recommendations are spot on!"
              avatar="RS"
              rating={5}
              delay={0}
            />
            <TestimonialCard
              name="Priya Patel"
              role="Yoga Enthusiast, Mumbai"
              text="I was looking for a female-friendly gym with yoga classes. GymBuddy found the perfect match within 2km of my home. Absolutely love this platform!"
              avatar="PP"
              rating={5}
              delay={0.1}
            />
            <TestimonialCard
              name="Arjun Reddy"
              role="CrossFit Athlete, Bangalore"
              text="The buddy matching feature is incredible. Found someone with the exact same fitness goals and schedule. We've been training together for 3 months now."
              avatar="AR"
              rating={5}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section-padding relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[rgba(57,255,20,0.04)] rounded-full blur-[120px]" />
        </div>
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center p-12 md:p-16 rounded-3xl bg-[#0d0d0d] border border-[#1a1a1a] relative overflow-hidden"
          >
            <div className="absolute inset-0 grid-pattern opacity-50" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(57,255,20,0.25)]">
                <Dumbbell className="w-8 h-8 text-black" strokeWidth={2} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ready to Transform Your{" "}
                <span className="text-[#39FF14]">Fitness Journey</span>?
              </h2>
              <p className="text-[#888] text-base mb-8 max-w-lg mx-auto">
                Join thousands of fitness enthusiasts who found their perfect gym
                and workout partner through GymBuddy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-neon !py-3.5 !px-8 !text-base group">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/gyms" className="btn-outline !py-3.5 !px-8 !text-base">
                  Browse Gyms
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}
