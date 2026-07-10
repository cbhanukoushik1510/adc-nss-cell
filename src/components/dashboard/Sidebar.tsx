"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  CalendarDays,
  ClipboardList,
  Award,
  ImageIcon,
  Settings,
  LogOut,
} from "lucide-react";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/volunteer/dashboard",
  },
  {
    title: "Profile",
    icon: User,
    href: "/volunteer/profile",
  },
  {
    title: "Attendance",
    icon: CalendarDays,
    href: "/volunteer/attendance",
  },
  {
    title: "Activities",
    icon: ClipboardList,
    href: "/volunteer/activities",
  },
  {
    title: "Certificates",
    icon: Award,
    href: "/volunteer/certificates",
  },
  {
    title: "Gallery",
    icon: ImageIcon,
    href: "/volunteer/gallery",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/volunteer/settings",
  },
];

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    // Later we'll add Supabase signOut() here
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-[#0F2B7B] text-white shadow-xl">

      {/* Header */}
      <div className="border-b border-white/20 p-6">
        <h1 className="text-2xl font-bold">ADC NSS</h1>
        <p className="text-sm text-blue-200">
          Volunteer Portal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <Link
              key={menu.title}
              href={menu.href}
              className="flex items-center gap-4 rounded-xl px-4 py-3 transition hover:bg-white/10"
            >
              <Icon size={20} />
              <span>{menu.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/20 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}