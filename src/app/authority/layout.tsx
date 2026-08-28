"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  UserCheck,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Authority = {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  designation: string;
  phone_number: string | null;
  department: string | null;
  is_active: boolean;
};

export default function AuthorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [authority, setAuthority] = useState<Authority | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadAuthority = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("authority")
        .select(`
          id,
          user_id,
          full_name,
          role,
          designation,
          phone_number,
          department,
          is_active
        `)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      const role = String(data.role || "").toLowerCase();
      const designation = String(
        data.designation || ""
      ).toLowerCase();

      const isPrincipal =
        role.includes("principal") &&
        !role.includes("vice");

      const isVicePrincipal =
        role.includes("vice principal") ||
        designation.includes("vice principal") ||
        role.includes("vp");

      if (!isPrincipal && !isVicePrincipal) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setAuthority(data);
    } catch (error) {
      console.error("Authority layout error:", error);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAuthority();
  }, [loadAuthority]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading Authority Portal...
          </p>
        </div>
      </main>
    );
  }

  if (!authority) {
    return null;
  }

  const roleLabel =
    authority.designation ||
    authority.role ||
    "Authority";

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-slate-200 bg-white lg:flex lg:flex-col">

        {/* LOGO */}

        <div className="flex h-[68px] items-center border-b border-slate-200 px-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
            <ShieldCheck size={21} />
          </div>

          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-bold text-[#0F2B7B]">
              ADC NSS CELL
            </p>

            <p className="text-[10px] text-gray-500">
              Authority Portal
            </p>
          </div>

        </div>

        {/* AUTHORITY */}

        <div className="border-b border-slate-200 p-3">

          <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-3 text-white">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck size={18} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="truncate text-[11px] text-blue-100">
                  {roleLabel}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 px-3 py-5">

          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <div className="mt-3 space-y-1">

            <SidebarLink
              icon={<CalendarDays size={18} />}
              label="Dashboard"
              active={pathname === "/authority"}
              onClick={() => router.push("/authority")}
            />

            <SidebarLink
              icon={<CalendarDays size={18} />}
              label="Events"
              active={pathname.startsWith("/authority/events")}
              onClick={() =>
                router.push("/authority/events")
              }
            />

            <SidebarLink
              icon={<Users size={18} />}
              label="Volunteers"
              active={pathname.startsWith("/authority/volunteers")}
              onClick={() =>
                router.push("/authority/volunteers")
              }
            />

            <SidebarLink
              icon={<ClipboardCheck size={18} />}
              label="Attendance"
              active={pathname.startsWith("/authority/attendance")}
              onClick={() =>
                router.push("/authority/attendance")
              }
            />

            <SidebarLink
              icon={<UserCheck size={18} />}
              label="Registrations"
              active={pathname.startsWith("/authority/registrations")}
              onClick={() =>
                router.push("/authority/registrations")
              }
            />

            <SidebarLink
              icon={<MessageSquare size={18} />}
              label="Messages & Suggestions"
              active={pathname.startsWith("/authority/messages")}
              onClick={() =>
                router.push("/authority/messages")
              }
            />

          </div>

        </nav>

        {/* VIEW ONLY */}

        <div className="border-t border-slate-200 p-3">

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">

            <div className="flex items-center gap-2 text-[#0F2B7B]">

              <ShieldCheck size={16} />

              <span className="text-xs font-bold">
                View Only Access
              </span>

            </div>

            <p className="mt-2 text-[10px] leading-4 text-gray-500">
              Authority accounts can view NSS information
              but cannot modify administrative records.
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative flex h-full w-72 flex-col bg-white shadow-2xl">

            <div className="flex h-[68px] items-center justify-between border-b px-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#0F2B7B]">
                    ADC NSS CELL
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Authority Portal
                  </p>
                </div>

              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-3">

              <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-3 text-white">

                <p className="text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="mt-1 text-[11px] text-blue-100">
                  {roleLabel}
                </p>

              </div>

            </div>

            <nav className="flex-1 px-3 py-4">

              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Main Menu
              </p>

              <div className="mt-3 space-y-1">

                <MobileSidebarLink
                  icon={<CalendarDays size={18} />}
                  label="Dashboard"
                  active={pathname === "/authority"}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority");
                  }}
                />

                <MobileSidebarLink
                  icon={<CalendarDays size={18} />}
                  label="Events"
                  active={pathname.startsWith("/authority/events")}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/events");
                  }}
                />

                <MobileSidebarLink
                  icon={<Users size={18} />}
                  label="Volunteers"
                  active={pathname.startsWith("/authority/volunteers")}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/volunteers");
                  }}
                />

                <MobileSidebarLink
                  icon={<ClipboardCheck size={18} />}
                  label="Attendance"
                  active={pathname.startsWith("/authority/attendance")}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/attendance");
                  }}
                />

                <MobileSidebarLink
                  icon={<UserCheck size={18} />}
                  label="Registrations"
                  active={pathname.startsWith("/authority/registrations")}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/registrations");
                  }}
                />

                <MobileSidebarLink
                  icon={<MessageSquare size={18} />}
                  label="Messages & Suggestions"
                  active={pathname.startsWith("/authority/messages")}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/messages");
                  }}
                />

              </div>

            </nav>

            <div className="border-t p-3">

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>

          </aside>

        </div>
      )}

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="lg:pl-60">

        {/* ONLY ONE TOP HEADER */}

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">

          <div className="flex h-[68px] items-center justify-between px-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={23} />
              </button>

              <div>
                <p className="text-[11px] text-gray-400">
                  Aurora&apos;s Degree & PG College
                </p>

                <h1 className="text-lg font-bold text-[#0F2B7B]">
                  NSS Authority Portal
                </h1>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="text-right">

                <p className="text-sm font-bold text-gray-800">
                  {authority.full_name}
                </p>

                <p className="text-[10px] text-gray-500">
                  {roleLabel}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2B7B] text-white">
                <ShieldCheck size={19} />
              </div>

            </div>

          </div>

        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div className="min-h-[calc(100vh-68px)]">
          {children}
        </div>

      </div>

    </main>
  );
}

/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-[#0F2B7B] text-white shadow-sm"
          : "text-gray-600 hover:bg-slate-100 hover:text-[#0F2B7B]"
      }`}
    >
      {icon}

      <span>{label}</span>

      {active && (
        <ChevronRight
          size={15}
          className="ml-auto"
        />
      )}
    </button>
  );
}

/* =========================================================
   MOBILE SIDEBAR LINK
========================================================= */

function MobileSidebarLink({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${
        active
          ? "bg-[#0F2B7B] text-white"
          : "text-gray-600 hover:bg-slate-100"
      }`}
    >
      {icon}

      <span>{label}</span>
    </button>
  );
}