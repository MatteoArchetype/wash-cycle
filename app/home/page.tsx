"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Home, Waves, Calendar, Wallet, User, Plus, Bell, Clock } from "lucide-react";
import { AlertCircle } from "lucide-react";

type Machine = {
  id: string;
  name: string;
  type: "washer" | "dryer";
  price_per_use: number;
  is_active: boolean;
};

type Booking = {
  id: string;
  machine_id: string;
  start_time: string;
  end_time: string;
  status: string;
};

export default function HomePage() {
  const [userName, setUserName] = useState("User");
  const [balance, setBalance] = useState(0);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Refresh data every 30 seconds
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAllData() {
    await Promise.all([
      fetchUserData(),
      fetchMachines(),
      fetchActiveBookings(),
    ]);
    setLoading(false);
  }

  async function fetchUserData() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, wallet_balance")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name || "User");
      setBalance(profile.wallet_balance || 0);
    }
  }

  async function fetchMachines() {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .eq("is_active", true);

  if (!error && data) {
    // Sort: Washer first, then Dryer
    const sorted = data.sort((a, b) => {
      // Washer comes before Dryer
      if (a.type === "washer" && b.type === "dryer") return -1;
      if (a.type === "dryer" && b.type === "washer") return 1;
      return 0;
    });
    setMachines(sorted);
  }
}

  async function fetchActiveBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .in("status", ["in_progress", "reserved"])
      .order("start_time", { ascending: true });

    if (!error && data) {
      setActiveBookings(data);
    }
  }

  function getMachineStatus(machineId: string) {
    const booking = activeBookings.find(b => b.machine_id === machineId);
    
    if (!booking) {
      return { 
        status: "available", 
        label: "Available", 
        timeRemaining: null, 
        color: "text-[#1B5E20]",
        badgeColor: "bg-[#1B5E20]/10 text-[#1B5E20]",
        badgeText: "Free"
      };
    }

    const now = currentTime;
    const endTime = new Date(booking.end_time);
    const startTime = new Date(booking.start_time);
    
    if (booking.status === "in_progress") {
      const timeLeftMs = endTime.getTime() - now.getTime();
      const timeLeftMin = Math.max(0, Math.floor(timeLeftMs / 60000));
      
      if (timeLeftMin <= 0) {
        return { 
          status: "available", 
          label: "Available", 
          timeRemaining: null, 
          color: "text-[#1B5E20]",
          badgeColor: "bg-[#1B5E20]/10 text-[#1B5E20]",
          badgeText: "Free"
        };
      }
      
      return { 
        status: "in_use", 
        label: `In use • ${timeLeftMin} min left`, 
        timeRemaining: timeLeftMin,
        color: "text-[#8A7060]",
        badgeColor: "bg-[#8A7060]/10 text-[#8A7060]",
        badgeText: "Busy"
      };
    }
    
    if (booking.status === "reserved") {
      const timeUntilStartMs = startTime.getTime() - now.getTime();
      const timeUntilStartMin = Math.max(0, Math.floor(timeUntilStartMs / 60000));
      
      if (timeUntilStartMin <= 0) {
        return { 
          status: "available", 
          label: "Available", 
          timeRemaining: null, 
          color: "text-[#1B5E20]",
          badgeColor: "bg-[#1B5E20]/10 text-[#1B5E20]",
          badgeText: "Free"
        };
      }
      
      const startTimeStr = startTime.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit" 
      });
      
      return { 
        status: "reserved", 
        label: `Reserved at ${startTimeStr}`, 
        timeRemaining: timeUntilStartMin,
        color: "text-[#F4A261]",
        badgeColor: "bg-[#F4A261]/10 text-[#F4A261]",
        badgeText: "Reserved"
      };
    }

    return { 
      status: "available", 
      label: "Available", 
      timeRemaining: null, 
      color: "text-[#1B5E20]",
      badgeColor: "bg-[#1B5E20]/10 text-[#1B5E20]",
      badgeText: "Free"
    };
  }

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(0) + " DKK";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] pb-24">
      {/* Header */}
      <div className="bg-[#3A2D22] px-6 pt-8 pb-6 rounded-b-[2rem]">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/70 text-sm">{getGreeting()} 👋</p>
            <h1 className="text-white text-xl font-bold">{userName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-4 py-2 rounded-xl text-white text-right">
              <p className="text-xs opacity-70">Wallet</p>
              <p className="font-semibold">{formatPrice(balance)}</p>
            </div>
            <button className="bg-white/20 p-2.5 rounded-full">
              <Bell size={22} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Machine status */}
      <div className="px-6 mt-6">
        <h2 className="font-semibold text-[#3A2D22] mb-3">Machine Availability</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-[#8A7060]">Loading machine status...</div>
          ) : (
            machines.map((machine) => {
              const status = getMachineStatus(machine.id);
              const isAvailable = status.status === "available";
              
              return (
                <div
                  key={machine.id}
                  className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#3A2D22]">{machine.name}</p>
                      <p className={`text-sm ${status.color} flex items-center gap-1`}>
                        {status.status === "in_use" && <Clock size={14} className="animate-pulse" />}
                        {status.status === "available" && <span>✅</span>}
                        {status.label}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${status.badgeColor}`}>
                      {status.badgeText}
                    </span>
                  </div>

                  {/* Book button inside each machine card */}
                  {isAvailable ? (
                    <Link href={`/booking?id=${machine.id}`}>
                      <button className="w-full mt-3 py-2.5 bg-[#9DC4E8] text-[#1C3A52] rounded-xl font-medium text-sm hover:opacity-80 transition-all flex items-center justify-center gap-1">
                        <Plus size={16} />
                        Book {machine.name}
                      </button>
                    </Link>
                  ) : (
                    <button className="w-full mt-3 py-2.5 bg-[#E0CEBC] text-[#8A7060] rounded-xl font-medium text-sm cursor-not-allowed flex items-center justify-center gap-1">
                      <Clock size={16} />
                      {status.status === "in_use" ? "In use" : "Reserved"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <Link href="/report-problem">
  <button className="text-sm text-[#8A7060] flex items-center gap-1 hover:text-[#3A2D22] transition-all">
    <AlertCircle size={14} />
    Report a problem
  </button>
</Link>

      {/* Bottom navigation */}
      <div className="bottom-nav">
        <div className="max-w-[428px] mx-auto flex justify-around">
          <button className="nav-item-active">
            <div className="w-6 h-6 flex items-center justify-center text-[#4A8FBF] text-xl">🏠</div>
            <span className="nav-label-active">Home</span>
          </button>
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
