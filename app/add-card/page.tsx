export const dynamic = 'force-dynamic';

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CreditCard, Calendar, Lock } from "lucide-react";

export default function AddCard() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(" ").slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 2) {
      return digits.slice(0, 2) + "/" + digits.slice(2, 4);
    }
    return digits;
  };

  const detectCardBrand = (number: string) => {
    const digits = number.replace(/\s/g, "");
    if (digits.startsWith("4")) return "Visa";
    if (digits.startsWith("5")) return "Mastercard";
    if (digits.startsWith("3")) return "Amex";
    if (digits.startsWith("6")) return "Discover";
    return "Card";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if supabase is available
    if (!supabase) {
      setError("Please wait for the app to initialize");
      return;
    }

    const cardDigits = cardNumber.replace(/\s/g, "");
    if (cardDigits.length < 15 || cardDigits.length > 16) {
      setError("Please enter a valid card number (15-16 digits)");
      return;
    }

    if (expiry.length < 5) {
      setError("Please enter a valid expiry date (MM/YY)");
      return;
    }

    if (cvv.length < 3) {
      setError("Please enter a valid CVV (3-4 digits)");
      return;
    }

    if (!cardholderName.trim()) {
      setError("Please enter the cardholder name");
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

      const expiryParts = expiry.split("/");
      const expiryMonth = parseInt(expiryParts[0]);
      const expiryYear = parseInt(expiryParts[1]) + 2000;
      const cardBrand = detectCardBrand(cardNumber);
      const lastFour = cardDigits.slice(-4);

      if (setAsDefault) {
        await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const { error: insertError } = await supabase
        .from("payment_methods")
        .insert({
          user_id: user.id,
          card_last_four: lastFour,
          card_brand: cardBrand,
          expiry_month: expiryMonth,
          expiry_year: expiryYear,
          is_default: setAsDefault,
        });

      if (insertError) {
        console.error("Error saving card:", insertError);
        setError("Failed to save card. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/wallet");
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] px-6 py-8">
      <div className="max-w-sm mx-auto">
        <Link href="/wallet" className="inline-flex items-center text-[#3A2D22] mb-6">
          <ArrowLeft size={20} className="mr-1" />
          Back
        </Link>

        <h1 className="text-2xl font-bold text-[#3A2D22] mb-2">Add Payment Method</h1>
        <p className="text-[#8A7060] mb-6">Securely save your card for future payments</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-1.5">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="input"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-1.5">
              Card Number
            </label>
            <div className="relative">
              <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7060]" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="input pl-12"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#6A5545] mb-1.5">
                Expiry Date
              </label>
              <div className="relative">
                <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7060]" />
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className="input pl-12"
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#6A5545] mb-1.5">
                CVV
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7060]" />
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="input pl-12"
                  placeholder="•••"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSetAsDefault(!setAsDefault)}
            className="w-full flex justify-between items-center p-4 bg-[rgba(255,252,210,0.52)] border border-[#E0CEBC] rounded-xl"
          >
            <span className="text-sm font-medium text-[#3A2D22]">Set as default payment method</span>
            <div className={`w-11 h-6 rounded-full transition-colors ${setAsDefault ? "bg-[#3A2D22]" : "bg-[#E8D8C4]"}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${setAsDefault ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
            </div>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#8A7060]">
            <Lock size={14} />
            <span>Your card details are encrypted and secure</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold text-lg hover:opacity-80 transition-all disabled:opacity-50 mt-4"
          >
            {submitting ? "Saving..." : "Add Card"}
          </button>
        </form>
      </div>
    </div>
  );
}