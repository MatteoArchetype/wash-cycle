# 🧺 Wash Cycle — Laundry Room Booking App

<div align="center">

![Wash Cycle Logo](public/favicon.ico)

**A mobile-first web app for booking communal laundry machines in shared buildings.**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.9-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.43.0-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Screens](#screens)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

**Wash Cycle** solves the problem of coordinating laundry access in shared buildings. Instead of using physical sign-up sheets or waiting in laundry rooms, residents can:

- 🔍 See real-time machine availability
- 📅 Book time slots in advance
- 💳 Pay only when they start the machine
- 📱 Manage bookings from anywhere

Built for the **2026 AI Development / VibeCoding Internship**, this project demonstrates the complete lifecycle of an MVP from design to deployment.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Sign up and log in with email/password via Supabase |
| 🧺 **Machine Booking** | View available washers/dryers and book time slots |
| 💳 **Wallet System** | Top up wallet, view balance, and transaction history |
| 💰 **Pay-as-You-Go** | Payment deducted from wallet only when you start the machine |
| 📅 **Recurring Bookings** | Set up weekly repeat bookings |
| 📱 **Real-time Status** | See machine availability with time remaining |
| 🏷️ **Saved Cards** | Securely save payment methods |
| 📋 **Booking Management** | View upcoming, past, and recurring bookings |
| 🚨 **Report Problems** | Report issues to the caretaker |
| 🎨 **Warm Sand Design** | Custom design system with frosted glass effects |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS with custom design tokens |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Font** | DM Sans (Google Fonts) |
| **Icons** | Lucide React |
| **Deployment** | Vercel / Netlify |
| **Version Control** | GitHub |

---

## 🎨 Design System

### Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#FAF4EC` | Page background |
| Primary Text | `#3A2D22` | Headings and body text |
| Secondary Text | `#6A5545` | Labels and subtext |
| Muted Text | `#8A7060` | Placeholders and subtle text |
| Border | `#E0CEBC` | Cards and inputs |
| Card Surface | `rgba(255,252,210,0.52)` | Frosted glass effect |
| CTA Primary | `#9DC4E8` | Primary buttons and actions |
| CTA Secondary | `#C8E2F5` | Secondary buttons |
| Accent | `#1B5E20` | Prices and badges |

### Typography

- **Font**: DM Sans (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Visual Effects

- Frosted glass cards (`backdrop-filter: blur(8px)`)
- Bottom navigation blur (`backdrop-filter: blur(12px)`)
- Organic background blobs (`filter: blur(72px)`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (free tier)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/MatteoArchetype/wash-cycle.git
cd wash-cycle

2. Install dependencies

bash
npm install
3. Set up environment variables

4. Create a .env.local file in the root directory:

env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Set up Supabase

Run the following SQL in your Supabase SQL Editor to create the tables:
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  wallet_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Machines table
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('washer', 'dryer')),
  price_per_use INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  machine_id UUID NOT NULL REFERENCES public.machines(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'cancelled', 'in_progress', 'completed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  booking_id UUID REFERENCES public.bookings(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topup', 'payment')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  card_last_four TEXT NOT NULL,
  card_brand TEXT NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT,
  user_email TEXT,
  problem_type TEXT NOT NULL,
  machine_number TEXT,
  room_number TEXT,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP DEFAULT NOW()
);

5. Insert initial machines

sql
INSERT INTO public.machines (name, type, price_per_use, is_active) VALUES
('Washer 1', 'washer', 2500, true),
('Dryer 1', 'dryer', 2000, true);
6. Start the development server

bash
npm run dev
Open your browser
Navigate to http://localhost:3000

🔐 Environment Variables
Variable	Description	Required
NEXT_PUBLIC_SUPABASE_URL	Your Supabase project URL	✅ Yes
NEXT_PUBLIC_SUPABASE_ANON_KEY	Your Supabase anon public key	✅ Yes
📁 Project Structure
text
wash-cycle/
├── app/
│   ├── add-card/              # Add payment method screen
│   ├── assistant/              # Laundry assistant (chat UI)
│   ├── booking/                # Make a booking screen
│   ├── bookings/               # My bookings screen
│   ├── home/                   # Home dashboard
│   ├── login/                  # Login screen
│   ├── machines/               # Available machines screen
│   ├── onboarding/             # Onboarding flow (4 steps)
│   ├── payment-confirmed/      # Payment confirmation screen
│   ├── payments/               # Payments screen
│   ├── profile/                # User profile screen
│   ├── report-problem/         # Report a problem screen
│   ├── signup/                 # Sign up screen
│   ├── wallet/                 # Wallet screen
│   ├── globals.css             # Global styles with design tokens
│   ├── layout.tsx              # Root layout with DM Sans font
│   └── page.tsx                # Welcome screen
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── tokens.ts               # Design system tokens
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
🗄️ Database Schema
Entity Relationship Diagram
text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│  bookings   │>────│  machines   │
│─────────────│     │─────────────│     │─────────────│
│ id          │     │ id          │     │ id          │
│ email       │     │ user_id     │     │ name        │
│ full_name   │     │ machine_id  │     │ type        │
│ wallet_balance│   │ start_time  │     │ price_per_use│
│ created_at  │     │ end_time    │     │ is_active   │
└─────────────┘     │ status      │     │ created_at  │
                    │ created_at  │     └─────────────┘
                    └─────────────┘
                         │
                         │
                    ┌────▼────┐
                    │transactions│
                    │────────────│
                    │ id         │
                    │ user_id    │
                    │ booking_id │
                    │ amount     │
                    │ type       │
                    │ description│
                    │ created_at │
                    └────────────┘
Table Relationships
Table	Foreign Key	References
users	id	auth.users(id)
bookings	user_id	users(id)
bookings	machine_id	machines(id)
transactions	user_id	users(id)
transactions	booking_id	bookings(id)
payment_methods	user_id	auth.users(id)
reports	user_id	auth.users(id)
📱 Screens
Screen	Route	Description
Welcome	/	App entry with login/signup
Login	/login	Email/password login
Sign Up	/signup	Create new account
Onboarding	/onboarding	4-step intro flow
Home	/home	Dashboard with machine status
Machines	/machines	Browse available machines
Booking	/booking	Select date/time
My Bookings	/bookings	Upcoming and recurring bookings
Payments	/payments	Pay for a booking
Wallet	/wallet	View balance, top up, transaction history
Add Card	/add-card	Save payment method
Payment Confirmed	/payment-confirmed	Confirmation screen
Profile	/profile	User profile
Report Problem	/report-problem	Report issues to caretaker
Assistant	/assistant	Laundry assistant chat UI
🚢 Deployment
Future Improvements
Feature	Priority	Description
Push Notifications	🟡 Medium	Remind users 30 min before booking
Admin Dashboard	🟡 Medium	Manage machines, users, and reports
Real-time Machine Status	🟡 Medium	IoT sensors for live machine status
Online Payments	🟢 Low	MobilePay/Apple Pay integration
Dark Mode	🟢 Low	Theme toggle
Multi-language Support	🟢 Low	Danish and English
🤝 Contributing
This project was built as part of the 2026 AI Development / VibeCoding Internship. Contributions are welcome for educational purposes.

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

🙏 Acknowledgments
Internship Program: AI Development / VibeCoding 2026

Design: Original Figma prototype by Matteo

Fonts: DM Sans by Google Fonts

Icons: Lucide React

<div align="center">
Built with ❤️ by Matteo

From UX prototype to production-ready MVP

</div> ```
