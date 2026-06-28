"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, Home, Waves, Calendar, Wallet, User } from "lucide-react";

export default function Assistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, type: "bot", text: "Hi! I'm your laundry assistant. How can I help you today?" },
    { id: 2, type: "user", text: "When is the washer free?" },
    { id: 3, type: "bot", text: "Let me check... Washer 1 is available at 2:30 PM and 4:00 PM. Would you like me to book it for you?" },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), type: "user", text: message }]);
    setMessage("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "bot", text: "Thanks for your message! I'll check that for you." },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] flex flex-col pb-24">
      <div className="bg-[rgba(255,250,195,0.70)] backdrop-blur-md px-6 pt-8 pb-4 border-b border-[#EDE0D0]">
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-[#3A2D22]">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#3A2D22]" />
            <h1 className="text-xl font-bold text-[#3A2D22]">Laundry Assistant</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-3 rounded-xl ${
              msg.type === "bot"
                ? "bg-[rgba(255,252,210,0.52)] backdrop-blur-sm border border-[#E0CEBC] text-[#3A2D22] self-start"
                : "bg-[#3A2D22] text-white self-end ml-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-[rgba(255,250,195,0.70)] backdrop-blur-md border-t border-[#EDE0D0]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#FAF4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9DC4E8] border border-[#E0CEBC]"
            placeholder="Ask me anything..."
          />
          <button
            type="submit"
            className="p-3 bg-[#9DC4E8] text-[#1C3A52] rounded-xl hover:opacity-80 transition-all"
          >
            <Send size={20} />
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
          <Link href="/payments" className="nav-item">
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
