export const dynamic = 'force-dynamic';

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Clock, Home, Waves, Wallet, User, Zap } from "lucide-react";

export default function Booking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const machineId = searchParams.get("id");

  const [machine, setMachine] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("");
  const [weekly, setWeekly] = useState(false);
  const [addDryer, setAddDryer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingMode, setBookingMode] = useState<"now" | "later">("later");

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = getDates();

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
    const isToday = selectedDateObj && selectedDateObj.toDateString() === now.toDateString();

    // Generate all slots from 9 AM to 8 PM
    for (let hour = 9; hour <= 20; hour++) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      
      // For each hour, add :00 slot
      const slotTime = new Date(selectedDateObj || now);
      slotTime.setHours(hour, 0, 0, 0);
      
      // If it's today, only show future slots
      if (isToday && slotTime < now) {
        // Skip past slots
      } else {
        slots.push(`${displayHour}:00 ${period}`);
      }
      
      // Add :30 slot if not the last hour
      if (hour < 20) {
        const slotTime30 = new Date(selectedDateObj || now);
        slotTime30.setHours(hour, 30, 0, 0);
        if (!isToday || slotTime30 >= now) {
          slots.push(`${displayHour}:30 ${period}`);
        }
      }
    }
    
    return slots;
  };

  // Generate times based on selected date
  const times = generateTimeSlots();

  useEffect(() => {
    if (machineId) {
      fetchMachine();
    }
  }, [machineId]);

  // Update times when date changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      checkIfNow(selectedTime, selectedDate);
    }
  }, [selectedDate, selectedTime]);

  async function fetchMachine() {
    // Check if supabase is available
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("machines")
      .select("*")
      .eq("id", machineId)
      .single();

    if (error) {
      console.error("Error fetching machine:", error);
    } else {
      setMachine(data);
      const todayStr = dates[0].toDateString();
      setSelectedDate(todayStr);
      
      // Auto-select first available time
      const availableTimes = generateTimeSlots();
      if (availableTimes.length > 0) {
        setSelectedTime(availableTimes[0]);
        checkIfNow(availableTimes[0], todayStr);
      }
    }
    setLoading(false);
  }

  function checkIfNow(time: string, dateStr: string) {
    const selectedDateTime = getDateTimeFromSelection(dateStr, time);
    const now = new Date();
    const diffMinutes = (selectedDateTime.getTime() - now.getTime()) / 60000;
    setBookingMode(diffMinutes <= 15 ? "now" : "later");
  }

  function getDateTimeFromSelection(dateStr: string, timeStr: string) {
    const dateObj = new Date(dateStr);
    const hour = parseInt(timeStr.split(":")[0]);
    const minute = parseInt(timeStr.split(":")[1]?.split(" ")[0] || "0");
    const isPM = timeStr.includes("PM");
    const hour24 = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    const result = new Date(dateObj);
    result.setHours(hour24, minute, 0, 0);
    return result;
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    checkIfNow(time, selectedDate);
  }

  function handleDateSelect(dateStr: string) {
    setSelectedDate(dateStr);
    // Reset selected time when date changes
    const availableTimes = generateTimeSlots();
    if (availableTimes.length > 0) {
      setSelectedTime(availableTimes[0]);
      checkIfNow(availableTimes[0], dateStr);
    }
  }

  async function handleBooking() {
    if (!selectedTime) {
      alert("Please select a time");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    // Check if supabase is available
    if (!supabase) {
      alert("Please wait for the app to initialize");
      return;
    }

    setSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      alert("Please log in first");
      setSubmitting(false);
      return;
    }

    const dateObj = new Date(selectedDate);
    const timeStr = selectedTime;
    const hour = parseInt(timeStr.split(":")[0]);
    const minute = parseInt(timeStr.split(":")[1]?.split(" ")[0] || "0");
    const isPM = timeStr.includes("PM");
    const hour24 = isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);

    const startTime = new Date(dateObj);
    startTime.setHours(hour24, minute, 0, 0);

    const endTime = new Date(startTime);
    const duration = machine?.type === "washer" ? 70 : 50;
    endTime.setMinutes(endTime.getMinutes() + duration);

    const bookingData = {
      user_id: user.id,
      machine_id: machineId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "reserved",
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select();

    if (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking: " + error.message);
      setSubmitting(false);
    } else {
      const bookingId = data?.[0]?.id;
      
      if (bookingMode === "now") {
        router.push(`/payments?bookingId=${bookingId}`);
      } else {
        router.push(`/payment-confirmed?bookingId=${bookingId}&payLater=true`);
      }
    }

    setSubmitting(false);
  }

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(0) + " DKK";
  };

  const isWasher = machine?.type === "washer";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF4EC] flex items-center justify-center">
        <div className="text-[#8A7060]">Loading...</div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-[#FAF4EC] flex flex-col items-center justify-center px-6">
        <h1 className="text-xl font-bold text-[#3A2D22] mb-2">Machine not found</h1>
        <Link href="/machines" className="text-[#1A5F7A]">← Back to machines</Link>
      </div>
    );
  }

  const basePrice = machine.price_per_use;
  const dryerPrice = 2000;
  const totalPrice = addDryer ? basePrice + dryerPrice : basePrice;

  return (
    <div className="min-h-screen bg-[#FAF4EC] pb-32">
      <div className="bg-[rgba(255,250,195,0.70)] backdrop-blur-md px-6 pt-8 pb-4 border-b border-[#EDE0D0]">
        <div className="flex items-center gap-3">
          <Link href="/machines" className="text-[#3A2D22]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#3A2D22]">Make a Booking</h1>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-6">
        <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC]">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-[#8A7060]">Machine</p>
              <p className="font-semibold text-[#3A2D22]">{machine.name}</p>
              <p className="text-sm text-[#8A7060]">{machine.type === "washer" ? "1h 10m" : "50m"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#8A7060]">Price</p>
              <p className="font-semibold text-[#1B5E20]">{formatPrice(basePrice)}</p>
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${bookingMode === "now" ? "bg-[#9DC4E8]/20 border-[#9DC4E8]" : "bg-[#E0CEBC]/30 border-[#E0CEBC]"}`}>
          <div className="flex items-center gap-2 text-sm">
            <Zap size={16} className={bookingMode === "now" ? "text-[#1C3A52]" : "text-[#8A7060]"} />
            <span className={bookingMode === "now" ? "font-medium text-[#1C3A52]" : "text-[#8A7060]"}>
              {bookingMode === "now" 
                ? "🟢 Booking for now — you'll pay and start immediately" 
                : "📅 Booking for later — you'll pay when you arrive"}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#6A5545] mb-2">Select Date</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((d) => {
              const dateStr = d.toDateString();
              const isSelected = selectedDate === dateStr;
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateSelect(dateStr)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap min-w-[70px] ${
                    isSelected
                      ? "bg-[#3A2D22] text-white"
                      : "bg-[rgba(255,252,210,0.52)] border border-[#E0CEBC] text-[#3A2D22]"
                  }`}
                >
                  <div className="text-xs opacity-60">
                    {isToday ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-base font-bold">{d.getDate()}</div>
                  <div className="text-xs opacity-60">
                    {d.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#6A5545] mb-2">Select Time</label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {times.length === 0 ? (
              <div className="col-span-3 text-center py-4 text-[#8A7060]">
                No available times for this date
              </div>
            ) : (
              times.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTimeSelect(t)}
                  className={`py-2.5 rounded-xl text-sm font-medium ${
                    selectedTime === t
                      ? "bg-[#3A2D22] text-white"
                      : "bg-[rgba(255,252,210,0.52)] border border-[#E0CEBC] text-[#3A2D22]"
                  }`}
                >
                  {t}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC] space-y-3">
          <button
            onClick={() => setWeekly(!weekly)}
            className="w-full flex justify-between items-center"
          >
            <span className="flex items-center gap-2">
              <Calendar size={18} className="text-[#3A2D22]" />
              <span>Repeat weekly</span>
            </span>
            <div className={`w-11 h-6 rounded-full transition-colors ${weekly ? "bg-[#3A2D22]" : "bg-[#E8D8C4]"}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${weekly ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
            </div>
          </button>

          {isWasher && (
            <button
              onClick={() => setAddDryer(!addDryer)}
              className="w-full flex justify-between items-center"
            >
              <span className="flex items-center gap-2">
                <Clock size={18} className="text-[#3A2D22]" />
                <span>Add dryer slot (+20 DKK)</span>
              </span>
              <div className={`w-11 h-6 rounded-full transition-colors ${addDryer ? "bg-[#3A2D22]" : "bg-[#E8D8C4]"}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${addDryer ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
              </div>
            </button>
          )}
        </div>

        <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC]">
          <div className="flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-bold text-[#1B5E20]">{formatPrice(totalPrice)}</span>
          </div>
          <p className="text-xs text-[#8A7060] mt-1">
            {bookingMode === "now" 
              ? "💳 Payment will be taken now" 
              : "💳 Pay when you start the machine"}
          </p>
        </div>

        <button
          onClick={handleBooking}
          disabled={submitting || !selectedTime || !selectedDate}
          className="w-full py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold text-lg hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            "Booking..."
          ) : bookingMode === "now" ? (
            <>
              <Zap size={20} />
              Book & Pay Now
            </>
          ) : (
            "Confirm Booking"
          )}
        </button>
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