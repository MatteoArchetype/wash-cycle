"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create user profile in the users table
      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: email,
          full_name: name,
          wallet_balance: 0,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Even if profile fails, the auth user exists
        setError("Account created but profile setup failed. Please try logging in.");
        setLoading(false);
        return;
      }

      // 3. Success! Redirect to onboarding
      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] px-6 py-8">
      <div className="max-w-sm mx-auto">
        <Link href="/" className="inline-flex items-center text-[#3A2D22] mb-8">
          <ArrowLeft size={20} className="mr-1" />
          Back
        </Link>

        <h1 className="text-2xl font-bold text-[#3A2D22] mb-2">Create account</h1>
        <p className="text-[#8A7060] mb-8">Start booking your laundry today</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6A5545] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#9DC4E8] text-[#1C3A52] rounded-2xl font-semibold text-lg hover:opacity-80 transition-all disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-[#8A7060]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3A2D22] font-medium">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
