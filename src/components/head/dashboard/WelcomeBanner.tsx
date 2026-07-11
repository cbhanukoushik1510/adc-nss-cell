"use client";

import {
  Bell,
  Search,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-md">

      <div className="flex items-center gap-3 rounded-xl border px-4 py-3">

        <Search size={18} className="text-gray-500" />

        <input
          placeholder="Search..."
          className="outline-none"
        />

      </div>

      <div className="flex items-center gap-6">

        <button className="relative">

          <Bell size={24} />

          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></span>

        </button>

        <div className="text-right">

          <h3 className="font-semibold">
            Bhanu Koushik
          </h3>

          <p className="text-sm text-gray-500">
            NSS Wing Head • Unit 1
          </p>

        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F2B7B] text-lg font-bold text-white">

          BK

        </div>

      </div>

    </header>
  );
}