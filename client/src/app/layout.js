import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "GymBuddy — AI-Powered Gym Discovery & Workout Partner",
  description:
    "Discover nearby gyms, find workout partners with similar fitness goals, get AI-powered recommendations, and connect with the fitness community near you.",
  keywords: "gym, fitness, workout partner, gym buddy, gym discovery, AI recommendations",
  openGraph: {
    title: "GymBuddy — AI-Powered Gym Discovery & Workout Partner",
    description: "Discover nearby gyms and find your perfect workout partner.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
