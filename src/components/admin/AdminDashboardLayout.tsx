"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Award,
  ImageIcon,
  Megaphone,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Volunteers",
    icon: Users,
    href: "/admin/volunteers",
  },
  {
    title: "Events",
    icon: CalendarDays,
    href: "/admin/events",
  },
  {
    title: "Attendance",
    icon: ClipboardList,
    href: "/admin/attendance",
  },
  {
    title: "Activities",
    icon: ClipboardList,
    href: "/admin/activities",
  },
  {
    title: "Certificates",
    icon: Award,
    href: "/admin/certificates",
  },
  {
    title: "Gallery",
    icon: ImageIcon,
    href: "/admin/gallery",
  },
  {
    title: "Announcements",
    icon: Megaphone,
    href: "/admin/announcements",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

interface Props {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({
  children,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);

      setLoggingOut(false);

      alert(
        "Unable to logout. Please try again."
      );

      return;
    }

    router.replace("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================
          MOBILE TOPBAR
      ===================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-[#0F2B7B] px-4 text-white shadow-lg lg:hidden">

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          className="rounded-lg p-2 transition hover:bg-white/10"
          aria-label="Open admin menu"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="mt-1.5 block h-0.5 w-6 bg-white" />
          <span className="mt-1.5 block h-0.5 w-6 bg-white" />
        </button>

        <div className="text-center">
          <p className="font-bold">
            ADC NSS
          </p>

          <p className="text-xs text-blue-200">
            Admin Portal
          </p>
        </div>

        <div className="w-10" />

      </header>

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-[#0F2B7B] text-white shadow-xl transition-transform duration-300 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >

        {/* Header */}

        <div className="flex items-center justify-between border-b border-white/20 p-5">

          <div>
            <h1 className="text-2xl font-bold">
              ADC NSS
            </h1>

            <p className="text-sm text-blue-200">
              Admin Portal
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            aria-label="Close admin menu"
          >
            <X size={22} />
          </button>

        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">

          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = isActive(
              menu.href
            );

            return (
              <Link
                key={menu.title}
                href={menu.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white text-[#0F2B7B] shadow-sm"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon size={20} />

                <span>
                  {menu.title}
                </span>
              </Link>
            );
          })}

        </nav>

        {/* Logout */}

        <div className="border-t border-white/20 p-4">

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={20} />

            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>

        </div>

      </aside>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="min-h-screen pt-16 lg:ml-72 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}