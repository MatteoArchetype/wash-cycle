"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Minus, Home, Waves, Calendar, Wallet, User, CreditCard } from "lucide-react";

export default function WalletPage() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoading(false);
        return;
      }

      // Get user profile with wallet balance
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        if (profileError.code === "PGRST116") {
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              wallet_balance: 0,
            });
          if (insertError) {
            console.error("Error creating profile:", insertError);
          } else {
            setBalance(0);
          }
        }
      } else if (profile) {
        setBalance(profile.wallet_balance || 0);
      }

      // Get transactions
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

      // Get saved cards
      const { data: cardData, error: cardError } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (cardError) {
        console.error("Error fetching cards:", cardError);
      } else {
        setSavedCards(cardData || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }

    setLoading(false);
  }

  async function handleTopUp() {
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setError("Please log in first");
        setSubmitting(false);
        return;
      }

      const amountInOre = numAmount * 100;
      const newBalance = balance + amountInOre;

      const { error: updateError } = await supabase
        .from("users")
        .update({ wallet_balance: newBalance })
        .eq("id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        setError("Failed to top up: " + updateError.message);
        setSubmitting(false);
        return;
      }

      await supabase.from("transactions").insert({
        user_id: user.id,
        amount: amountInOre,
        type: "topup",
        description: `Top up ${numAmount} DKK`,
      });

      setSuccess(`✅ Successfully topped up ${numAmount} DKK!`);
      setBalance(newBalance);
      setAmount("");

      // Refresh transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (txData) {
        setTransactions(txData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    }

    setSubmitting(false);
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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] pb-24">
      {/* Header */}
      <div className="bg-[rgba(255,250,195,0.70)] backdrop-blur-md px-6 pt-8 pb-4 border-b border-[#EDE0D0]">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#3A2D22]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-[#3A2D22]">Wallet</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8A7060]">Loading wallet...</div>
        </div>
      ) : (
        <>
          {/* Balance */}
          <div className="px-6 pt-6">
            <div className="bg-[#3A2D22] p-6 rounded-2xl text-white">
              <p className="text-sm opacity-80">Current Balance</p>
              <p className="text-4xl font-bold">{formatPrice(balance)}</p>
              <div className="flex gap-3 mt-4">
                <Link href="/add-card">
                  <button className="px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-all">
                    + Add Card
                  </button>
                </Link>
                <button 
                  onClick={fetchWalletData}
                  className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-all"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Saved Cards */}
          {savedCards.length > 0 && (
            <div className="px-6 mt-6">
              <h2 className="font-semibold text-[#3A2D22] mb-3">Saved Cards</h2>
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-3 rounded-xl border border-[#E0CEBC] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#3A2D22]/10 rounded-lg">
                        <CreditCard size={16} className="text-[#3A2D22]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#3A2D22]">
                          {card.card_brand} •••• {card.card_last_four}
                        </p>
                        <p className="text-xs text-[#8A7060]">
                          Expires {String(card.expiry_month).padStart(2, "0")}/{String(card.expiry_year).toString().slice(-2)}
                        </p>
                      </div>
                    </div>
                    {card.is_default && (
                      <span className="px-2 py-0.5 bg-[#1B5E20]/10 text-[#1B5E20] text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/add-card">
                <button className="w-full mt-2 py-2 text-sm text-[#1A5F7A] font-medium hover:opacity-70 transition-all">
                  + Add another card
                </button>
              </Link>
            </div>
          )}

          {/* Error/Success messages */}
          {error && (
            <div className="px-6 mt-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            </div>
          )}
          {success && (
            <div className="px-6 mt-4">
              <div className="bg-green-100 border border-green-400 text-[#1B5E20] px-4 py-3 rounded-xl">
                {success}
              </div>
            </div>
          )}

          {/* Quick Top Up */}
          <div className="px-6 mt-6">
            <p className="text-sm font-medium text-[#6A5545] mb-2">Quick Top Up</p>
            <div className="flex gap-2">
              {[50, 100, 200].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v.toString())}
                  className={`flex-1 py-3 bg-[rgba(255,252,210,0.52)] border rounded-xl text-sm font-medium transition-all ${
                    amount === v.toString()
                      ? "border-[#3A2D22] bg-[rgba(255,252,210,0.80)]"
                      : "border-[#E0CEBC]"
                  }`}
                >
                  +{v} DKK
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount + Add */}
          <div className="px-6 mt-4">
            <div className="flex gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 input"
                placeholder="Enter amount..."
                min="1"
              />
              <button
                onClick={handleTopUp}
                disabled={submitting}
                className="px-6 py-3.5 bg-[#9DC4E8] text-[#1C3A52] rounded-xl font-semibold hover:opacity-80 transition-all disabled:opacity-50"
              >
                {submitting ? "..." : "Add"}
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="px-6 mt-6">
            <h2 className="font-semibold text-[#3A2D22] mb-3">Transaction History</h2>
            {transactions.length === 0 ? (
              <div className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-4 rounded-2xl border border-[#E0CEBC] text-center text-[#8A7060]">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="bg-[rgba(255,252,210,0.52)] backdrop-blur-sm p-3 rounded-xl border border-[#E0CEBC] flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          t.type === "topup" ? "bg-[#1B5E20]/10" : "bg-[#8A7060]/10"
                        }`}
                      >
                        {t.type === "topup" ? (
                          <Plus size={16} className="text-[#1B5E20]" />
                        ) : (
                          <Minus size={16} className="text-[#8A7060]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#3A2D22]">
                          {t.type === "topup" ? "Top up" : t.description || "Payment"}
                        </p>
                        <p className="text-xs text-[#8A7060]">{formatDate(t.created_at)}</p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        t.amount > 0 ? "text-[#1B5E20]" : "text-[#8A7060]"
                      }`}
                    >
                      {t.amount > 0 ? "+" : ""}{formatPrice(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
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