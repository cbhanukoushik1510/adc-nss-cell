"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  ClipboardList,
  CalendarDays,
  CheckSquare,
  Megaphone,
  Images,
  FileText,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface OperationsUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  designation: string;
  nss_unit: string | null;
  stream: string | null;
  department: string | null;
  is_active: boolean;
}

const attendanceMenu = [
  {
    label: "Dashboard",
    href: "/operations/attendance",
    icon: LayoutDashboard,
  },
  {
    label: "My Profile",
    href: "/operations/attendance/profile",
    icon: User,
  },
  {
    label: "Messages",
    href: "/operations/attendance/messages",
    icon: MessageSquare,
  },
  {
    label: "Assigned Work",
    href: "/operations/attendance/work",
    icon: ClipboardList,
  },
  {
    label: "Events",
    href: "/operations/attendance/events",
    icon: CalendarDays,
  },
  {
    label: "Attendance",
    href: "/operations/attendance/records",
    icon: CheckSquare,
  },
  {
    label: "Reports",
    href: "/operations/attendance/reports",
    icon: FileText,
  },
];

const socialMediaMenu = [
  {
    label: "Dashboard",
    href: "/operations/social-media",
    icon: LayoutDashboard,
  },
  {
    label: "My Profile",
    href: "/operations/social-media/profile",
    icon: User,
  },
  {
    label: "Messages",
    href: "/operations/social-media/messages",
    icon: MessageSquare,
  },
  {
    label: "Assigned Work",
    href: "/operations/social-media/work",
    icon: ClipboardList,
  },
  {
    label: "Announcements",
    href: "/operations/social-media/announcements",
    icon: Megaphone,
  },
  {
    label: "Gallery",
    href: "/operations/social-media/gallery",
    icon: Images,
  },
];

function getRoleLabel(role: string) {
  switch (role) {
    case "attendance_coordinator":
      return "Attendance Coordinator";

    case "social_media_coordinator":
      return "Social Media Coordinator";

    case "wing_head":
      return "Wing Head";

    case "deputy_wing_head":
      return "Deputy Wing Head";

    case "stream_coordinator":
      return "Stream Coordinator";

    default:
      return "Operations Team";
  }
}

export default function OperationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] =
    useState<OperationsUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: {
            user: authUser,
          },
          error: authError,
        } = await supabase.auth.getUser();

        if (
          authError ||
          !authUser
        ) {
          router.replace("/login");
          return;
        }

        const {
          data: operationsUser,
          error: operationsError,
        } = await supabase
          .from("nss_operations_team")
          .select(
            `
              id,
              user_id,
              full_name,
              email,
              role,
              designation,
              nss_unit,
              stream,
              department,
              is_active
            `
          )
          .eq(
            "user_id",
            authUser.id
          )
          .maybeSingle();

        if (
          operationsError ||
          !operationsUser
        ) {
          console.error(
            "Operations Team profile error:",
            operationsError
          );

          await supabase.auth.signOut();

          router.replace("/login");
          return;
        }

        if (
          operationsUser.is_active === false
        ) {
          await supabase.auth.signOut();

          router.replace("/login");
          return;
        }

        if (!mounted) return;

        setUser(operationsUser);
      } catch (error) {
        console.error(
          "Operations layout error:",
          error
        );

        await supabase.auth.signOut();

        router.replace("/login");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "SIGNED_OUT" ||
          !session
        ) {
          router.replace("/login");
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="text-sm font-medium text-slate-600">
            Loading Operations Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAttendance =
    user.role ===
    "attendance_coordinator";

  const isSocialMedia =
    user.role ===
    "social_media_coordinator";

  const menuItems = isAttendance
    ? attendanceMenu
    : isSocialMedia
      ? socialMediaMenu
      : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen flex-col
          border-r border-slate-200
          bg-white
          transition-all duration-300
          ${
            collapsed
              ? "w-[78px]"
              : "w-[270px]"
          }
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* BRAND */}
        <div className="flex h-[72px] items-center justify-between border-b border-slate-200 px-4">
          <Link
            href={
              isAttendance
                ? "/operations/attendance"
                : "/operations/social-media"
            }
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <span className="text-sm font-bold">
                NSS
              </span>
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  NSS Portal
                </p>

                <p className="truncate text-xs text-slate-500">
                  Operations Team
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Operations
            </p>
          )}

          <div className="space-y-1">
            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  pathname ===
                    item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setSidebarOpen(false)
                    }
                    title={
                      collapsed
                        ? item.label
                        : undefined
                    }
                    className={`
                      flex items-center gap-3 rounded-xl
                      px-3 py-2.5
                      text-sm font-medium
                      transition
                      ${
                        active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }
                      ${
                        collapsed
                          ? "justify-center"
                          : ""
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      strokeWidth={
                        active
                          ? 2.4
                          : 2
                      }
                      className="shrink-0"
                    />

                    {!collapsed && (
                      <span>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        {/* COLLAPSE */}
        <div className="hidden border-t border-slate-200 p-3 lg:block">
          <button
            type="button"
            onClick={() =>
              setCollapsed(
                (value) => !value
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {collapsed ? (
              <ChevronRight
                size={18}
              />
            ) : (
              <>
                <ChevronLeft
                  size={18}
                />
                <span>
                  Collapse
                </span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div
        className={`
          min-h-screen
          transition-all duration-300
          ${
            collapsed
              ? "lg:pl-[78px]"
              : "lg:pl-[270px]"
          }
        `}
      >
        {/* NAVBAR */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={22} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                  {getRoleLabel(
                    user.role
                  )}
                </p>

                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  NSS Operations Portal
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {/* PROFILE */}
              <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {user.full_name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "U"}
                </div>

                <div className="max-w-[180px]">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.full_name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {user.designation}
                  </p>
                </div>
              </div>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={
                  handleLogout
                }
                disabled={
                  loggingOut
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut
                  size={17}
                />

                <span className="hidden sm:inline">
                  {loggingOut
                    ? "Signing out..."
                    : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="w-full">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}