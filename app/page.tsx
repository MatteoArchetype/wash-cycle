"use client";

import Link from "next/link";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#FAF4EC] flex flex-col">
      <div className="bg-[#3A2D22] h-48 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" className="w-full">
            <path fill="#FAF4EC" d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>
        <div className="flex items-center justify-center h-full pt-8">
          <div className="text-center text-white">
            <div className="text-6xl mb-3">🧺</div>
            <h1 className="text-3xl font-bold">Wash Cycle</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-10 flex flex-col justify-between">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#3A2D22] mb-2">Book your laundry</h2>
          <p className="text-[#8A7060] text-lg">Pay only when you start the machine</p>
        </div>
        <div className="space-y-4 pb-4">
          <Link href="/login">
            <button className="w-full py-4 px-6 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold text-lg hover:opacity-80 transition-all">
              Log In
            </button>
          </Link>
          <Link href="/signup">
            <button className="w-full py-4 px-6 border-2 border-[#E0CEBC] text-[#3A2D22] rounded-2xl font-semibold text-lg hover:bg-[#F0E8DC] transition-all">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
