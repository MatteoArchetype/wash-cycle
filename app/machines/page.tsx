"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, ChevronRight, Home, Waves, Calendar, Wallet, User } from "lucide-react";

type Machine = {
  id: string;
  name: string;
  type: "washer" | "dryer";
  price_per_use: number;
  is_active: boolean;
};

export default function Machines() {
  const [filter, setFilter] = useState<"all" | "washer" | "dryer">("all");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    setLoading(true);
    const { data, error } = await supabase
      .from("machines")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching machines:", error);
    } else {
      // Sort: Washer first, then Dryer
      const sorted = (data || []).sort((a, b) => {
        if (a.type === "washer" && b.type === "dryer") return -1;
        if (a.type === "dryer" && b.type === "washer") return 1;
        return 0;
      });
      setMachines(sorted);
    }
    setLoading(false);
  }

  const filteredMachines = machines.filter((m) =>
    filter === "all" ? true : m.type === filter
  );

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(0) + " DKK";
  };

  const getDuration = (type: string) => {
    return type === "washer" ? "1h 10m" : "50m";
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] pb-24">
      <div className="bg-[rgba(255,250,195,0.70)] backdrop-blur-md px-6 pt-8 pb-4 border-b border-[#EDE0D0]">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#3A2D22]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#3A2D22]">Available Machines</h1>
        </div>
      </div>

      <div className="px-6 py-4 flex gap-2 overflow-x-auto">
        {["all", "washer", "dryer"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === f
                ? "bg-[#3A2D22] text-white"
                : "bg-[rgba(255,252,210,0.52)] border border-[#E0CEBC] text-[#3A2D22]"
            }`}
          >
            {f === "all" ? "All" : f === "washer" ? "Washers" : "Dryers"}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-[#8A7060]">Loading machines...</div>
        ) : filteredMachines.length === 0 ? (
          <div className="text-center py-8 text-[#8A7060]">No machines available</div>
        ) : (
          filteredMachines.map((m) => (
            <Link href={`/booking?id=${m.id}`} key={m.id}>
              <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-[#3A2D22]">{m.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-[#1B5E20] font-medium">{formatPrice(m.price_per_use)}</span>
                      <span className="text-sm text-[#8A7060] flex items-center gap-1">
                        <Clock size={14} />
                        {getDuration(m.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-success">Available</span>
                    <ChevronRight size={20} className="text-[#8A7060]" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Bottom navigation */}
      <div className="bottom-nav">
        <div className="max-w-[428px] mx-auto flex justify-around">
          <Link href="/home" className="nav-item">
            <Home size={24} />
            <span className="nav-label">Home</span>
          </Link>
          <button className="nav-item-active">
            <Waves size={24} />
            <span className="nav-label-active">Machines</span>
          </button>
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