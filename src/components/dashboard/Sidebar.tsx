"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  CalendarDays,
  ClipboardList,
  Award,
  ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

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
    title: "Events",
    icon: CalendarDays,
    href: "/volunteer/events",
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
    title: "Gallery",
    icon: ImageIcon,
    href: "/volunteer/gallery",
  },
  
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    router.push("/login");
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* =========================================
          MOBILE HEADER
      ========================================= */}

      <div className="fixed left-0 right-0 top-0 z-50 flex h-[72px] items-center justify-between bg-[#0F2B7B] px-5 text-white shadow-lg lg:hidden">

        <div>
          <h1 className="text-xl font-bold">
            ADC NSS
          </h1>

          <p className="text-xs text-blue-200">
            Volunteer Portal
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setMobileOpen((current) => !current)
          }
          className="rounded-lg p-2 transition hover:bg-white/10"
          aria-label={
            mobileOpen
              ? "Close navigation"
              : "Open navigation"
          }
        >
          {mobileOpen ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}
        </button>

      </div>

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72
          flex-col bg-[#0F2B7B] text-white shadow-xl
          transition-transform duration-300

          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"}

          lg:translate-x-0
        `}
      >

        {/* =======================================
            HEADER
        ======================================= */}

        <div className="border-b border-white/20 p-5">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold">
                ADC NSS
              </h1>

              <p className="text-sm text-blue-200">
                Volunteer Portal
              </p>
            </div>

            {/* Mobile close button */}

            <button
              type="button"
              onClick={closeMobileMenu}
              className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
              aria-label="Close navigation"
            >
              <X size={22} />
            </button>

          </div>

        </div>

        {/* =======================================
            NAVIGATION
        ======================================= */}

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">

          {menus.map((menu) => {

            const Icon = menu.icon;

            const active =
              pathname === menu.href ||
              pathname.startsWith(`${menu.href}/`);

            return (
              <Link
                key={menu.title}
                href={menu.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center gap-4 rounded-xl
                  px-4 py-3 text-sm font-medium
                  transition

                  ${
                    active
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }
                `}
              >

                <Icon size={20} />

                <span>
                  {menu.title}
                </span>

              </Link>
            );
          })}

        </nav>

        {/* =======================================
            LOGOUT
        ======================================= */}

        <div className="border-t border-white/20 p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >

            <LogOut size={20} />

            Logout

          </button>

        </div>

      </aside>

      {/* =========================================
          MOBILE CONTENT SPACING
      ========================================= */}

      <div className="h-[72px] lg:hidden" />
    </>
  );
}