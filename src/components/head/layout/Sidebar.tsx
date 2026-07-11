"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserCog,
  CheckSquare,
  FileText,
  Image,
  Megaphone,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    href: "/head/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Volunteers",
    href: "/volunteers",
    icon: Users,
  },
  {
    title: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    title: "Coordinators",
    href: "/coordinators",
    icon: UserCog,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: CheckSquare,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Gallery",
    href: "/gallery",
    icon: Image,
  },
  {
    title: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ClipboardCheck,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0F2B7B] text-white shadow-2xl">

      <div className="border-b border-white/10 p-6">

        <h1 className="text-2xl font-bold">
          NSS Wing Head
        </h1>

        <p className="mt-1 text-sm text-blue-200">
          Operations Portal
        </p>

      </div>

      <nav className="mt-6 px-4">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition
                ${
                  pathname === item.href
                    ? "bg-white text-[#0F2B7B]"
                    : "hover:bg-white/10"
                }`}
            >
              <Icon size={20} />

              {item.title}
            </Link>
          );
        })}

      </nav>

      <div className="absolute bottom-6 w-full px-4">

        <button className="flex w-full items-center gap-3 rounded-xl bg-red-500 px-4 py-3 transition hover:bg-red-600">

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>
  );
}