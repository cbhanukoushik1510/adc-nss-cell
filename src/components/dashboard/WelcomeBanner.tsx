"use client";

import {
  CalendarDays,
  GraduationCap,
  IdCard,
  ShieldCheck,
} from "lucide-react";

export default function WelcomeBanner() {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2B7B] to-[#1E40AF] p-8 text-white shadow-xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">

        {/* Left */}

        <div className="flex-1">

          <p className="text-lg text-blue-100">
            👋 {greeting},
          </p>

          <h2 className="mt-1 text-4xl font-bold">
            Bhanu Koushik
          </h2>

          <div className="mt-3 inline-flex rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur">
            NSS Volunteer
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div className="flex items-center gap-3">
              <IdCard size={20} />
              <span>ADC-NSS-2026-001</span>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap size={20} />
              <span>BCA • Final Year</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck size={20} />
              <span>Unit 1</span>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays size={20} />
              <span>Joined Jan 2026</span>
            </div>

          </div>

        </div>

        {/* Right */}

        <div className="w-full max-w-sm rounded-3xl bg-white/10 p-6 backdrop-blur">

          <h3 className="text-xl font-bold">
            Next Event
          </h3>

          <p className="mt-4 text-2xl font-semibold">
            🌱 Tree Plantation Drive
          </p>

          <p className="mt-2 text-blue-100">
            15 July • 9:00 AM
          </p>

          <div className="mt-8">

            <div className="mb-2 flex justify-between text-sm">
              <span>Profile Completion</span>
              <span>82%</span>
            </div>

            <div className="h-3 rounded-full bg-white/20">

              <div className="h-3 w-[82%] rounded-full bg-yellow-400" />

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}