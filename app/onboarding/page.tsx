"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const steps = [
  { title: "Find available machines", description: "See which washers and dryers are free in your building", emoji: "🔍" },
  { title: "Book your time slot", description: "Reserve a machine for when you need it", emoji: "📅" },
  { title: "Start when you're ready", description: "Pay only when you start the machine", emoji: "💳" },
  { title: "Get notified", description: "We'll remind you 30 minutes before your slot", emoji: "🔔" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen bg-[#FAF4EC] flex flex-col">
      <div className="px-6 pt-8">
        <div className="flex gap-1.5 justify-center mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? "bg-[#3A2D22] w-8" : "bg-[#E0CEBC] w-6"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col items-center justify-center">
        <div className="text-7xl mb-8">{steps[step].emoji}</div>
        <h2 className="text-2xl font-bold text-[#3A2D22] text-center mb-3">{steps[step].title}</h2>
        <p className="text-[#8A7060] text-center text-lg max-w-xs">{steps[step].description}</p>
      </div>

      <div className="px-6 pb-10 space-y-4">
        <div className="flex gap-4">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 border-2 border-[#E0CEBC] rounded-2xl font-medium flex items-center justify-center gap-1"
            >
              <ChevronLeft size={20} /> Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold flex items-center justify-center gap-1"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <Link href="/home" className="flex-1">
              <button className="w-full py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold flex items-center justify-center gap-1">
                Get Started <Check size={20} />
              </button>
            </Link>
          )}
        </div>
        {step < steps.length - 1 && (
          <button onClick={() => setStep(steps.length - 1)} className="w-full text-center text-sm text-[#8A7060]">
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
