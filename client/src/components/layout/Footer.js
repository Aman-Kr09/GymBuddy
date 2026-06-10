"use client";

import Link from "next/link";
import { Dumbbell, Globe, Link2, Share2, Mail, Heart } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Discover Gyms", href: "/gyms" },
    { label: "Find Buddies", href: "/buddies" },
    { label: "AI Recommendations", href: "/home" },
    { label: "Chat", href: "/chat" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-[#39FF14] to-[#2bcc10] rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white">
                Gym<span className="text-[#39FF14]">Buddy</span>
              </span>
            </Link>
            <p className="text-[#666] text-sm leading-relaxed mb-6">
              AI-powered gym discovery and workout partner platform. Find your
              perfect gym and fitness buddy today.
            </p>
            <div className="flex gap-3">
              {[Globe, Link2, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-[#111] border border-[#1a1a1a] flex items-center justify-center text-[#666] hover:text-[#39FF14] hover:border-[rgba(57,255,20,0.2)] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#666] text-sm hover:text-[#39FF14] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#555] text-xs">
            © {new Date().getFullYear()} GymBuddy. All rights reserved.
          </p>
          <p className="text-[#555] text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for fitness lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
