"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  UserCheck,
  Activity,
  Megaphone,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  BriefcaseBusiness,
  UserCog,
  RefreshCw,
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

type POLinkProps = {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

/* =========================================================
   MAIN PO LAYOUT
========================================================= */

export default function POLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD PO
  ======================================================= */

  const loadAuthority = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      /* -----------------------------------------------
         CURRENT AUTH USER
      ------------------------------------------------ */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "PO auth error:",
          authError
        );

        throw new Error(
          authError.message ||
            "Unable to verify login."
        );
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      /* -----------------------------------------------
         AUTHORITY PROFILE
      ------------------------------------------------ */

      const {
        data: authorityData,
        error: authorityError,
      } = await supabase
        .from("authority")
        .select(
          `
            id,
            user_id,
            full_name,
            role,
            designation,
            phone_number,
            department,
            is_active
          `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (authorityError) {
        console.error(
          "PO authority error:",
          authorityError
        );

        throw new Error(
          authorityError.message ||
            "Unable to load Program Officer profile."
        );
      }

      if (!authorityData) {
        await supabase.auth.signOut();

        router.replace("/login");
        return;
      }

      /* -----------------------------------------------
         VERIFY PROGRAM OFFICER
      ------------------------------------------------ */

      const role = String(
        authorityData.role || ""
      ).trim().toLowerCase();

      const designation = String(
        authorityData.designation || ""
      )
        .trim()
        .toLowerCase();

      const isProgramOfficer =
        role.includes("program officer") ||
        role.includes("program_officer") ||
        designation.includes("program officer");

      if (!isProgramOfficer) {
        console.error(
          "Unauthorized PO account:",
          authorityData
        );

        await supabase.auth.signOut();

        router.replace("/login");
        return;
      }

      setAuthority(authorityData);
    } catch (err) {
      console.error(
        "PO layout error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Program Officer portal."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadAuthority();
  }, [loadAuthority]);

  /* =======================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ======================================================= */

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  /* =======================================================
     ACTIVE ROUTE
  ======================================================= */

  const isActive = (href: string) => {
    if (href === "/po") {
      return pathname === "/po";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /* =======================================================
     ROLE LABEL
  ======================================================= */

  const roleLabel =
    authority?.designation ||
    authority?.role ||
    "NSS Program Officer";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading Program Officer Portal...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Unable to load portal
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            onClick={loadAuthority}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#163A8C]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!authority) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[238px] border-r border-slate-200 bg-white lg:flex lg:flex-col">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="flex h-[70px] items-center border-b border-slate-200 px-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
            <ShieldCheck size={21} />
          </div>

          <div className="ml-3 min-w-0">

            <p className="truncate text-[14px] font-bold text-[#0F2B7B]">
              ADC NSS CELL
            </p>

            <p className="text-[10px] text-gray-500">
              Program Officer Portal
            </p>

          </div>

        </div>

        {/* =================================================
            PO PROFILE
        ================================================= */}

        <div className="border-b border-slate-200 p-3">

          <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#2457D6] p-3 text-white">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <UserCog size={18} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="truncate text-[10px] text-blue-100">
                  {roleLabel}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto px-2.5 py-4">

          {/* MAIN MENU */}

          <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <div className="mt-3 space-y-1">

            <POLink
              href="/po"
              label="Dashboard"
              icon={<CalendarDays size={17} />}
              active={isActive("/po")}
              onClick={() =>
                router.push("/po")
              }
            />

            <POLink
              href="/po/events"
              label="Events"
              icon={<CalendarDays size={17} />}
              active={isActive("/po/events")}
              onClick={() =>
                router.push("/po/events")
              }
            />

            <POLink
              href="/po/volunteers"
              label="Volunteers"
              icon={<Users size={17} />}
              active={isActive(
                "/po/volunteers"
              )}
              onClick={() =>
                router.push("/po/volunteers")
              }
            />

            <POLink
              href="/po/attendance"
              label="Attendance"
              icon={<ClipboardCheck size={17} />}
              active={isActive(
                "/po/attendance"
              )}
              onClick={() =>
                router.push("/po/attendance")
              }
            />

            <POLink
              href="/po/registrations"
              label="Registrations"
              icon={<UserCheck size={17} />}
              active={isActive(
                "/po/registrations"
              )}
              onClick={() =>
                router.push(
                  "/po/registrations"
                )
              }
            />

            <POLink
              href="/po/activities"
              label="Activities"
              icon={<Activity size={17} />}
              active={isActive(
                "/po/activities"
              )}
              onClick={() =>
                router.push(
                  "/po/activities"
                )
              }
            />

            <POLink
              href="/po/announcements"
              label="Announcements"
              icon={<Megaphone size={17} />}
              active={isActive(
                "/po/announcements"
              )}
              onClick={() =>
                router.push(
                  "/po/announcements"
                )
              }
            />

            <POLink
              href="/po/messages"
              label="Messages & Suggestions"
              icon={<MessageSquare size={17} />}
              active={isActive(
                "/po/messages"
              )}
              onClick={() =>
                router.push(
                  "/po/messages"
                )
              }
            />

          </div>

          {/* =================================================
              OPERATIONS
          ================================================= */}

          <p className="mt-7 px-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Operations
          </p>

          <div className="mt-3 space-y-1">

            <POLink
              href="/po/assign-work"
              label="Assign Work"
              icon={
                <BriefcaseBusiness
                  size={17}
                />
              }
              active={isActive(
                "/po/assign-work"
              )}
              onClick={() =>
                router.push(
                  "/po/assign-work"
                )
              }
            />

            <POLink
              href="/po/heads-deputies"
              label="Heads & Deputies"
              icon={<UserCog size={17} />}
              active={isActive(
                "/po/heads-deputies"
              )}
              onClick={() =>
                router.push(
                  "/po/heads-deputies"
                )
              }
            />

          </div>

        </nav>

        {/* =================================================
            ACCESS INFORMATION
        ================================================= */}

        <div className="border-t border-slate-200 p-2.5">

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">

            <div className="flex items-center gap-2 text-[#0F2B7B]">

              <ShieldCheck size={15} />

              <span className="text-[11px] font-bold">
                PO Access
              </span>

            </div>

            <p className="mt-1.5 text-[9px] leading-4 text-gray-500">
              Program Officers can view NSS
              information and manage assigned
              operational work.
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="mt-2.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">

          {/* OVERLAY */}

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />

          {/* SIDEBAR */}

          <aside className="relative flex h-full w-[285px] flex-col bg-white shadow-2xl">

            {/* MOBILE LOGO */}

            <div className="flex h-[70px] items-center justify-between border-b border-slate-200 px-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                  <ShieldCheck size={21} />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#0F2B7B]">
                    ADC NSS CELL
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Program Officer Portal
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-lg p-2 text-gray-500 transition hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X size={21} />
              </button>

            </div>

            {/* MOBILE PROFILE */}

            <div className="p-3">

              <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#2457D6] p-3 text-white">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <UserCog size={18} />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold">
                      {authority.full_name}
                    </p>

                    <p className="truncate text-[10px] text-blue-100">
                      {roleLabel}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* MOBILE NAV */}

            <nav className="flex-1 overflow-y-auto px-3 py-3">

              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Main Menu
              </p>

              <div className="mt-3 space-y-1">

                <MobilePOLink
                  href="/po"
                  label="Dashboard"
                  icon={<CalendarDays size={18} />}
                  active={isActive("/po")}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po");
                  }}
                />

                <MobilePOLink
                  href="/po/events"
                  label="Events"
                  icon={<CalendarDays size={18} />}
                  active={isActive(
                    "/po/events"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/events"
                    );
                  }}
                />

                <MobilePOLink
                  href="/po/volunteers"
                  label="Volunteers"
                  icon={<Users size={18} />}
                  active={isActive(
                    "/po/volunteers"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/volunteers"
                    );
                  }}
                />

                <MobilePOLink
                  href="/po/attendance"
                  label="Attendance"
                  icon={<ClipboardCheck size={18} />}
                  active={isActive(
                    "/po/attendance"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/attendance"
                    );
                  }}
                />

                <MobilePOLink
                  href="/po/registrations"
                  label="Registrations"
                  icon={<UserCheck size={18} />}
                  active={isActive(
                    "/po/registrations"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/registrations"
                    );
                  }}
                />

                <MobilePOLink
                  href="/po/activities"
                  label="Activities"
                  icon={<Activity size={18} />}
                  active={isActive(
                    "/po/activities"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/activities"
                    );
                  }}
                />

                <MobilePOLink
                  href="/po/announcements"
                  label="Announcements"
                  icon={<Megaphone size={18} />}
                  active={isActive(
                    "/po/announcements"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/announcements"
                    );
                  }}
                />

                <MobilePOLink
                  href="/po/messages"
                  label="Messages & Suggestions"
                  icon={<MessageSquare size={18} />}
                  active={isActive(
                    "/po/messages"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/messages"
                    );
                  }}
                />

              </div>

              {/* OPERATIONS */}

              <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Operations
              </p>

              <div className="mt-3 space-y-1">

                <MobilePOLink
                  href="/po/assign-work"
                  label="Assign Work"
                  icon={
                    <BriefcaseBusiness
                      size={18}
                    />
                  }
                  active={isActive(
                    "/po/assign-work"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/assign-work"
                    );
                  }}
                />

                <MobilePOLink
                  href="/po/heads-deputies"
                  label="Heads & Deputies"
                  icon={<UserCog size={18} />}
                  active={isActive(
                    "/po/heads-deputies"
                  )}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/po/heads-deputies"
                    );
                  }}
                />

              </div>

            </nav>

            {/* MOBILE LOGOUT */}

            <div className="border-t border-slate-200 p-3">

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>

          </aside>

        </div>
      )}

      {/* =====================================================
          MAIN CONTENT AREA
      ===================================================== */}

      <div className="lg:pl-[238px]">

        {/* ===================================================
            TOP NAVBAR
        =================================================== */}

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">

          <div className="flex h-[70px] items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* LEFT */}

            <div className="flex items-center gap-3">

              {/* MOBILE MENU */}

              <button
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="rounded-lg p-2 text-gray-600 transition hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={23} />
              </button>

              <div>

                <p className="text-[10px] text-gray-400 sm:text-[11px]">
                  Aurora&apos;s Degree & PG College
                </p>

                <h1 className="text-[16px] font-bold text-[#0F2B7B] sm:text-[17px]">
                  Program Officer Portal
                </h1>

              </div>

            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="max-w-[180px] truncate text-sm font-bold text-gray-800">
                  {authority.full_name}
                </p>

                <p className="max-w-[180px] truncate text-[9px] text-gray-500">
                  {roleLabel}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2B7B] text-white">
                <UserCog size={18} />
              </div>

            </div>

          </div>

        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div className="min-h-[calc(80vh-70px)]">
          {children}
        </div>

      </div>

    </main>
  );
}

/* =========================================================
   DESKTOP NAVIGATION LINK
========================================================= */

function POLink({
  href,
  icon,
  label,
  active = false,
  onClick,
}: POLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
        active
          ? "bg-[#123487] text-white shadow-sm"
          : "text-gray-600 hover:bg-slate-100 hover:text-[#0F2B7B]"
      }`}
    >
      <span
        className={`shrink-0 ${
          active
            ? "text-white"
            : "text-gray-500 group-hover:text-[#0F2B7B]"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        {label}
      </span>

      {active && (
        <span className="text-white">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      )}
    </button>
  );
}

/* =========================================================
   MOBILE NAVIGATION LINK
========================================================= */

function MobilePOLink({
  icon,
  label,
  active = false,
  onClick,
}: POLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-[#123487] text-white shadow-sm"
          : "text-gray-600 hover:bg-slate-100 hover:text-[#0F2B7B]"
      }`}
    >
      <span className="shrink-0">
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      {active && (
        <span className="text-white">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      )}
    </button>
  );
}