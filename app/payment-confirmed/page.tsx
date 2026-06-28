"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Home, Calendar, ArrowLeft, Clock } from "lucide-react";

export default function PaymentConfirmed() {
  const searchParams = useSearchParams();
  // ✅ FIXED: Add null check with fallback
  const bookingId = searchParams?.get("bookingId") || null;
  const payLater = searchParams?.get("payLater") === "true";
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  async function fetchBooking() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        machines (
          name,
          type
        )
      `)
      .eq("id", bookingId)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
    } else {
      setBooking(data);
    }
    setLoading(false);
  }

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit" 
    });
  };

  const formatDateFull = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "long", 
      day: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] flex flex-col items-center justify-center px-6 pb-24">
      <Link href="/home" className="absolute top-8 left-6 text-[#3A2D22]">
        <ArrowLeft size={24} />
      </Link>

      <div className="text-center">
        <div className="w-24 h-24 bg-[#1B5E20]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-[#1B5E20]" />
        </div>

        <h1 className="text-2xl font-bold text-[#3A2D22] mb-2">
          {payLater ? "Booking Confirmed! 🎉" : "Payment Confirmed"}
        </h1>
        
        <p className="text-[#8A7060] mb-1">
          {payLater 
            ? "Your booking is locked in. Pay when you arrive." 
            : "Your booking is locked in. Payment successful."}
        </p>
        <p className="text-[#8A7060]">We'll remind you 30 min before your slot.</p>

        {!loading && booking && (
          <div className="mt-4 bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC] text-left">
            <p className="text-sm text-[#8A7060]">Booking Details</p>
            <p className="font-semibold text-[#3A2D22]">{booking.machines?.name}</p>
            <p className="text-sm text-[#8A7060]">
              {formatDateFull(booking.start_time)} at {formatDate(booking.start_time)}
            </p>
            {payLater && (
              <div className="mt-2 flex items-center gap-1 text-sm text-[#F4A261]">
                <Clock size={14} />
                <span>Pay when you arrive at the machine</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Link href="/home">
            <button className="w-full py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold flex items-center justify-center gap-2">
              <Home size={20} />
              Back to Home
            </button>
          </Link>
          <Link href="/bookings">
            <button className="w-full py-4 border-2 border-[#E0CEBC] text-[#3A2D22] rounded-2xl font-semibold flex items-center justify-center gap-2">
              <Calendar size={20} />
              View My Bookings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
