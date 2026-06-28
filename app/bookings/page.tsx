"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Clock, X, Home, Waves, Wallet, User, Play, RefreshCw } from "lucide-react";

type Booking = {
  id: string;
  machine_id: string;
  start_time: string;
  end_time: string;
  status: "reserved" | "cancelled" | "in_progress" | "completed";
  created_at: string;
  is_recurring?: boolean;
  machines: {
    name: string;
    type: string;
    price_per_use: number;
  };
};

export default function Bookings() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "recurring">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchBookings() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        machines (
          name,
          type,
          price_per_use
        )
      `)
      .eq("user_id", user.id)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } else {
      // ✅ FIXED: Added type annotation
      const enhanced = (data || []).map((b: any, index: number, arr: any[]) => {
        const isRecurring = arr.some((other, i) => {
          if (i === index) return false;
          const bTime = new Date(b.start_time);
          const oTime = new Date(other.start_time);
          return (
            bTime.getHours() === oTime.getHours() &&
            bTime.getMinutes() === oTime.getMinutes() &&
            b.machine_id === other.machine_id &&
            bTime.getDay() !== oTime.getDay()
          );
        });
        return { ...b, is_recurring: isRecurring };
      });
      setBookings(enhanced);
    }
    setLoading(false);
  }

  const now = new Date();
  
  const upcoming = bookings.filter(
    (b) => new Date(b.start_time) > now && b.status !== "cancelled"
  );
  
  const recurring = bookings.filter(
    (b) => b.is_recurring && b.status !== "cancelled"
  );

  const displayBookings = activeTab === "upcoming" ? upcoming : recurring;

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(0) + " DKK";
  };

  const canStartMachine = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMinutes = (start.getTime() - now.getTime()) / 60000;
    return diffMinutes <= 15 && diffMinutes > -30;
  };

  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (error) {
      alert("Failed to cancel booking: " + error.message);
    } else {
      fetchBookings();
    }
  }

  async function handleStartMachine(booking: Booking) {
    setProcessingId(booking.id);

    const now = new Date();
    const startTime = new Date(booking.start_time);
    const diffMinutes = (startTime.getTime() - now.getTime()) / 60000;

    if (diffMinutes > 15) {
      alert(`This booking starts at ${formatTime(booking.start_time)}. You can start it 15 minutes before the slot.`);
      setProcessingId(null);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      alert("Please log in first");
      setProcessingId(null);
      return;
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert("Error checking wallet balance");
      setProcessingId(null);
      return;
    }

    const price = booking.machines.price_per_use;

    if (userProfile.wallet_balance < price) {
      alert(`Insufficient balance. You need ${formatPrice(price)}. Please top up your wallet.`);
      setProcessingId(null);
      return;
    }

    const newBalance = userProfile.wallet_balance - price;

    const { error: updateError } = await supabase
      .from("users")
      .update({ wallet_balance: newBalance })
      .eq("id", user.id);

    if (updateError) {
      alert("Failed to update wallet balance");
      setProcessingId(null);
      return;
    }

    const { error: bookingUpdateError } = await supabase
      .from("bookings")
      .update({ status: "in_progress" })
      .eq("id", booking.id);

    if (bookingUpdateError) {
      alert("Failed to start machine");
      setProcessingId(null);
      return;
    }

    await supabase.from("transactions").insert({
      user_id: user.id,
      booking_id: booking.id,
      amount: -price,
      type: "payment",
      description: booking.machines.name,
    });

    alert(`✅ ${booking.machines.name} started! Payment of ${formatPrice(price)} deducted from wallet.`);
    setProcessingId(null);
    fetchBookings();
  }

  return (
    <div className="min-h-screen bg-[#FAF4EC] pb-24">
      <div className="bg-[rgba(255,250,195,0.70)] backdrop-blur-md px-6 pt-8 pb-4 border-b border-[#EDE0D0]">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#3A2D22]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#3A2D22]">My Bookings</h1>
        </div>
      </div>

      <div className="px-6 py-4 flex gap-2">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
            activeTab === "upcoming"
              ? "bg-[#3A2D22] text-white"
              : "bg-[rgba(255,252,210,0.52)] border border-[#E0CEBC] text-[#3A2D22]"
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab("recurring")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
            activeTab === "recurring"
              ? "bg-[#3A2D22] text-white"
              : "bg-[rgba(255,252,210,0.52)] border border-[#E0CEBC] text-[#3A2D22]"
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <RefreshCw size={14} />
            Recurring ({recurring.length})
          </span>
        </button>
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-[#8A7060]">Loading your bookings...</div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#8A7060]">
              {activeTab === "upcoming" 
                ? "No upcoming bookings" 
                : "No recurring bookings yet"}
            </p>
            {activeTab === "upcoming" && (
              <Link href="/machines" className="text-[#1A5F7A] text-sm mt-2 inline-block">
                Book a machine →
              </Link>
            )}
          </div>
        ) : (
          displayBookings.map((b) => {
            const canStart = b.status === "reserved" && canStartMachine(b.start_time);
            const isPast = new Date(b.start_time) < new Date();
            const isInProgress = b.status === "in_progress";

            return (
              <div
                key={b.id}
                className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#3A2D22]">{b.machines?.name || "Machine"}</p>
                      {b.is_recurring && (
                        <span className="flex items-center gap-1 text-xs text-[#1B5E20] bg-[#1B5E20]/10 px-2 py-0.5 rounded-full">
                          <RefreshCw size={12} />
                          Weekly
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[#8A7060]">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(b.start_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(b.start_time)}
                      </span>
                      <span>{formatDuration(b.start_time, b.end_time)}</span>
                      <span className="font-medium text-[#1B5E20]">
                        {formatPrice(b.machines?.price_per_use)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      b.status === "reserved"
                        ? "bg-[#1B5E20]/10 text-[#1B5E20]"
                        : b.status === "in_progress"
                        ? "bg-[#F4A261]/10 text-[#F4A261]"
                        : b.status === "cancelled"
                        ? "bg-[#8A7060]/10 text-[#8A7060]"
                        : "bg-[#8A7060]/10 text-[#8A7060]"
                    }`}
                  >
                    {b.status === "reserved"
                      ? isPast && !isInProgress
                        ? "Missed"
                        : "Confirmed"
                      : b.status === "in_progress"
                      ? "In Progress"
                      : b.status === "cancelled"
                      ? "Cancelled"
                      : "Completed"}
                  </span>
                </div>

                {b.status === "reserved" && !isPast && (
                  <div className="mt-3 pt-3 border-t border-[#EDE0D0] flex gap-3">
                    {canStart ? (
                      <button
                        onClick={() => handleStartMachine(b)}
                        disabled={processingId === b.id}
                        className="text-sm bg-[#1B5E20] text-white px-4 py-1.5 rounded-xl font-medium flex items-center gap-1 hover:opacity-80 transition-all disabled:opacity-50"
                      >
                        <Play size={14} />
                        {processingId === b.id ? "Starting..." : "Start Machine"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-sm bg-[#E0CEBC] text-[#8A7060] px-4 py-1.5 rounded-xl font-medium cursor-not-allowed flex items-center gap-1"
                      >
                        <Clock size={14} />
                        {new Date(b.start_time) > new Date() 
                          ? `Available at ${formatTime(b.start_time)}` 
                          : "Past slot"}
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-sm text-[#8A7060] font-medium flex items-center gap-1 hover:opacity-70 transition-all"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                )}

                {b.status === "reserved" && isPast && !isInProgress && (
                  <div className="mt-3 pt-3 border-t border-[#EDE0D0]">
                    <span className="text-sm text-[#8A7060]">This booking slot has passed</span>
                  </div>
                )}

                {b.status === "in_progress" && (
                  <div className="mt-3 pt-3 border-t border-[#EDE0D0]">
                    <span className="text-sm text-[#F4A261] font-medium flex items-center gap-1">
                      <Clock size={14} className="animate-pulse" />
                      Machine is currently running
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
          <button className="nav-item-active">
            <Calendar size={24} />
            <span className="nav-label-active">Bookings</span>
          </button>
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
