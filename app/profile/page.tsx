"use client";

import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut, Home, Waves, Calendar, Wallet } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-[#FAF4EC] pb-24">
      <div className="bg-[rgba(255,250,195,0.70)] backdrop-blur-md px-6 pt-8 pb-4 border-b border-[#EDE0D0]">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#3A2D22]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#3A2D22]">Profile</h1>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-[#1B5E20] rounded-full flex items-center justify-center text-white text-3xl font-bold">
            M
          </div>
          <h2 className="text-xl font-bold text-[#3A2D22] mt-3">Matteo</h2>
          <p className="text-[#8A7060] text-sm">matteo@example.com</p>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-3">
        <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC] flex items-center gap-3">
          <Mail size={20} className="text-[#8A7060]" />
          <div>
            <p className="text-xs text-[#8A7060]">Email</p>
            <p className="font-medium">matteo@example.com</p>
          </div>
        </div>
        <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC] flex items-center gap-3">
          <Phone size={20} className="text-[#8A7060]" />
          <div>
            <p className="text-xs text-[#8A7060]">Phone</p>
            <p className="font-medium">+45 XX XX XX XX</p>
          </div>
        </div>
        <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC] flex items-center gap-3">
          <MapPin size={20} className="text-[#8A7060]" />
          <div>
            <p className="text-xs text-[#8A7060]">Address</p>
            <p className="font-medium">Copenhagen, Denmark</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        <button className="w-full py-4 border-2 border-[#8A7060] text-[#8A7060] rounded-2xl font-semibold flex items-center justify-center gap-2">
          <LogOut size={20} />
          Log Out
        </button>
      </div>

      {/* Bottom navigation */}
      <div className="bottom-nav">
        <div className="max-w-[428px] mx-auto flex justify-around">
          <Link href="/home" className="nav-item">
            <Home size={24} />
            <span className="nav-label">Home</span>
          </Link>
          <Link href="/machines" className="nav-item">
            <Waves size={24} />
            <span className="nav-label">Machines</span>
          </Link>
          <Link href="/bookings" className="nav-item">
            <Calendar size={24} />
            <span className="nav-label">Bookings</span>
          </Link>
          <Link href="/wallet" className="nav-item">
            <Wallet size={24} />
            <span className="nav-label">Wallet</span>
          </Link>
          <button className="nav-item-active">
            <User size={24} />
            <span className="nav-label-active">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
