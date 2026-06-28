"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, AlertCircle, Wrench, MessageCircle, Send, CheckCircle, Home, Waves, Calendar, Wallet, User } from "lucide-react";

type ProblemType = {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
};

const problemTypes: ProblemType[] = [
  {
    id: "machine_broken",
    label: "Machine is broken",
    icon: <Wrench size={20} />,
    description: "The machine won't start, is making noise, or isn't working properly",
  },
  {
    id: "machine_dirty",
    label: "Machine is dirty",
    icon: <AlertCircle size={20} />,
    description: "The machine has dirt, detergent residue, or foreign objects inside",
  },
  {
    id: "payment_issue",
    label: "Payment issue",
    icon: <AlertCircle size={20} />,
    description: "I was charged but the machine didn't start, or there's a problem with my wallet",
  },
  {
    id: "booking_issue",
    label: "Booking problem",
    icon: <AlertCircle size={20} />,
    description: "I can't book a slot, or my booking disappeared",
  },
  {
    id: "other",
    label: "Other",
    icon: <MessageCircle size={20} />,
    description: "Something else went wrong",
  },
];

export default function ReportProblem() {
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [description, setDescription] = useState("");
  const [machineNumber, setMachineNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProblem) {
      setError("Please select a problem type");
      return;
    }

    if (!description.trim() || description.length < 10) {
      setError("Please provide a detailed description (minimum 10 characters)");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setError("Please log in first");
        setSubmitting(false);
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      // Save to a "reports" table (we'll create this)
      const { error: insertError } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          user_name: profile?.full_name || "Unknown",
          user_email: profile?.email || user.email,
          problem_type: selectedProblem,
          machine_number: machineNumber || null,
          room_number: roomNumber || null,
          description: description,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error saving report:", insertError);
        setError("Failed to submit report. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF4EC] flex flex-col items-center justify-center px-6 pb-24">
        <Link href="/home" className="absolute top-8 left-6 text-[#3A2D22]">
          <ArrowLeft size={24} />
        </Link>

        <div className="text-center">
          <div className="w-24 h-24 bg-[#1B5E20]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-[#1B5E20]" />
          </div>

          <h1 className="text-2xl font-bold text-[#3A2D22] mb-2">Report Submitted! ✅</h1>
          <p className="text-[#8A7060] mb-1">Your problem has been reported.</p>
          <p className="text-[#8A7060]">The caretaker will look into it as soon as possible.</p>

          <div className="mt-4 bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC] text-left">
            <p className="text-sm text-[#8A7060]">Reference</p>
            <p className="font-mono text-sm text-[#3A2D22]">#{Date.now().toString().slice(-6)}</p>
            <p className="text-xs text-[#8A7060] mt-1">We'll notify you when the issue is resolved.</p>
          </div>

          <div className="mt-8 space-y-3">
            <Link href="/home">
              <button className="w-full py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold flex items-center justify-center gap-2">
                <Home size={20} />
                Back to Home
              </button>
            </Link>
            <Link href="/bookings">
              <button className="w-full py-4 border-2 border-[#E0CEBC] text-[#3A2D22] rounded-2xl font-semibold flex items-center justify-center gap-2">
                View My Bookings
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF4EC] pb-24">
      <div className="bg-[rgba(255,250,195,0.70)] backdrop-blur-md px-6 pt-8 pb-4 border-b border-[#EDE0D0]">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#3A2D22]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#3A2D22]">Report a Problem</h1>
        </div>
      </div>

      <div className="px-6 pt-6">
        <p className="text-[#8A7060] text-sm mb-6">
          Something not working? Let us know and the caretaker will get back to you.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Problem Type */}
          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-2">
              What's the problem?
            </label>
            <div className="space-y-2">
              {problemTypes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProblem(p.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedProblem === p.id
                      ? "border-[#3A2D22] bg-[rgba(255,252,210,0.80)] ring-2 ring-[#3A2D22]/20"
                      : "border-[#E0CEBC] bg-[rgba(255,252,210,0.52)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedProblem === p.id ? "bg-[#3A2D22] text-white" : "bg-[#E0CEBC] text-[#3A2D22]"
                    }`}>
                      {p.icon}
                    </div>
                    <div>
                      <p className="font-medium text-[#3A2D22]">{p.label}</p>
                      <p className="text-xs text-[#8A7060]">{p.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Machine Number */}
          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-1.5">
              Machine Number <span className="text-[#8A7060] text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={machineNumber}
              onChange={(e) => setMachineNumber(e.target.value)}
              className="input"
              placeholder="e.g., Washer 1, Dryer 2"
            />
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-1.5">
              Room Number <span className="text-[#8A7060] text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="input"
              placeholder="e.g., 3A, 12B"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[120px] resize-none"
              placeholder="Please describe what happened in detail..."
              required
            />
            <p className="text-xs text-[#8A7060] mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold text-lg hover:opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <Send size={20} />
                Submit Report
              </>
            )}
          </button>
        </form>
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
          <Link href="/profile" className="nav-item">
            <User size={24} />
            <span className="nav-label">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}