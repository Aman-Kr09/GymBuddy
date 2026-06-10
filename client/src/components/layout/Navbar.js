"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Menu,
  X,
  MapPin,
  Users,
  MessageCircle,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  Heart,
  Shield,
  Plus,
} from "lucide-react";

const navLinks = [
  { href: "/home", label: "Discover", icon: MapPin },
  { href: "/gyms", label: "Gyms", icon: Dumbbell },
  { href: "/buddies", label: "Buddies", icon: Users },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gymbuddy_user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("gymbuddy_token");
    localStorage.removeItem("gymbuddy_user");
    setUser(null);
    window.location.href = "/";
  };

  const links = [...navLinks];
  if (user?.role === "gymOwner") {
    links.push({ href: "/gym-owner", label: "Owner Panel", icon: Shield });
  } else if (user?.role === "admin") {
    links.push({ href: "/admin", label: "Admin Panel", icon: Shield });
  } else {
    links.push({ href: "/gym-owner", label: "Add Gym", icon: Plus });
  }

  // Don't show navbar on landing page
  if (pathname === "/") return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#050505]/90 backdrop-blur-xl border-b border-[#1a1a1a]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={user ? "/home" : "/"} className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#39FF14] to-[#2bcc10] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)] group-hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] transition-shadow">
                <Dumbbell className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white">
                Gym<span className="text-[#39FF14]">Buddy</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-[#39FF14] bg-[rgba(57,255,20,0.08)]"
                        : "text-[#a0a0a0] hover:text-white hover:bg-[#141414]"
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#a0a0a0] hover:text-white hover:bg-[#141414] transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#39FF14] to-[#2bcc10] flex items-center justify-center text-black text-xs font-bold">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="max-w-[100px] truncate">{user.fullName?.split(" ")[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-[#666] hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="btn-outline !py-2 !px-5 !text-xs">
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-neon !py-2 !px-5 !text-xs">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-[#141414] transition-all"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#050505]/98 backdrop-blur-xl pt-20 px-6 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? "text-[#39FF14] bg-[rgba(57,255,20,0.08)] border border-[rgba(57,255,20,0.15)]"
                        : "text-[#a0a0a0] hover:text-white hover:bg-[#141414]"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              <hr className="border-[#1a1a1a] my-3" />
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base text-[#a0a0a0] hover:text-white"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base text-red-400 hover:bg-red-400/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="btn-outline text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileOpen(false)}
                    className="btn-neon text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
