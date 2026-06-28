"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Smartphone, Wallet, Home, Waves, Calendar, User, Plus } from "lucide-react";

export default function Payments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [selected, setSelected] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [booking, setBooking] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
    fetchWalletData();
  }, [bookingId]);

  async function fetchBooking() {
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
      .eq("id", bookingId)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
    } else {
      setBooking(data);
    }
  }

  async function fetchWalletData() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else if (profile) {
      setBalance(profile.wallet_balance);
    }

    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (txError) {
      console.error("Error fetching transactions:", txError);
    } else {
      setTransactions(txData || []);
    }

    setLoading(false);
  }

  async function handlePayment() {
    if (!selected) {
      setError("Please select a payment method");
      return;
    }

    if (!booking) {
      setError("No booking found");
      return;
    }

    setProcessing(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setError("Please log in first");
      setProcessing(false);
      return;
    }

    const price = booking.machines.price_per_use;

    // Check if wallet balance is sufficient
    if (balance < price) {
      setError(`Insufficient balance. You need ${(price / 100).toFixed(0)} DKK. Please top up your wallet.`);
      setProcessing(false);
      return;
    }

    // Deduct from wallet
    const newBalance = balance - price;

    const { error: updateError } = await supabase
      .from("users")
      .update({ wallet_balance: newBalance })
      .eq("id", user.id);

    if (updateError) {
      setError("Failed to update wallet balance");
      setProcessing(false);
      return;
    }

    // Update booking status to "paid" or "in_progress"
    const { error: bookingUpdateError } = await supabase
      .from("bookings")
      .update({ status: "in_progress" })
      .eq("id", booking.id);

    if (bookingUpdateError) {
      setError("Failed to update booking");
      setProcessing(false);
      return;
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: user.id,
      booking_id: booking.id,
      amount: -price,
      type: "payment",
      description: booking.machines.name,
    });

    // ✅ Success! Redirect to payment confirmed
    router.push(`/payment-confirmed?bookingId=${booking.id}`);
  }

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(0) + " DKK";
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return "Today, " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + 
           d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const methods = [
    { id: "mobilepay", name: "MobilePay", icon: Smartphone },
    { id: "applepay", name: "Apple Pay", icon: Smartphone },
    { id: "wallet", name: "In-App Wallet", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-[#FAF4EC] pb-24">
      <div className="bg-[rgba(255,250,195,0.70)] backdrop-blur-md px-6 pt-8 pb-4 border-b border-[#EDE0D0]">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#3A2D22]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#3A2D22]">Payments</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8A7060]">Loading...</div>
        </div>
      ) : (
        <>
          {/* Booking summary */}
          {booking && (
            <div className="px-6 pt-6">
              <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC]">
                <p className="text-sm text-[#8A7060]">Booking Summary</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-semibold text-[#3A2D22]">{booking.machines?.name}</span>
                  <span className="font-bold text-[#1B5E20]">{formatPrice(booking.machines?.price_per_use)}</span>
                </div>
                <p className="text-xs text-[#8A7060] mt-1">
                  {formatDate(booking.start_time)}
                </p>
              </div>
            </div>
          )}

          {/* Balance */}
          <div className="px-6 pt-6">
            <div className="bg-[#3A2D22] p-6 rounded-2xl text-white">
              <p className="text-sm opacity-80">Wallet Balance</p>
              <p className="text-3xl font-bold">{formatPrice(balance)}</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-6 mt-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="px-6 mt-6">
            <h2 className="font-semibold text-[#3A2D22] mb-3">Payment Methods</h2>
            <div className="space-y-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`w-full bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border flex items-center justify-between ${
                    selected === m.id
                      ? "border-[#3A2D22] ring-2 ring-[#3A2D22]/20"
                      : "border-[#E0CEBC]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <m.icon size={20} className="text-[#3A2D22]" />
                    <span className="font-medium">{m.name}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      selected === m.id
                        ? "bg-[#3A2D22] border-[#3A2D22]"
                        : "border-[#E0CEBC]"
                    } flex items-center justify-center`}
                  >
                    {selected === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pay button */}
          <div className="px-6 mt-8">
            <button
              onClick={handlePayment}
              disabled={!selected || processing}
              className="w-full py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold text-lg hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : booking ? `Pay ${formatPrice(booking.machines?.price_per_use)}` : "Pay Now"}
            </button>
          </div>
        </>
      )}

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
          <button className="nav-item-active">
            <Wallet size={24} />
            <span className="nav-label-active">Wallet</span>
          </button>
          <Link href="/profile" className="nav-item">
            <User size={24} />
            <span className="nav-label">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
