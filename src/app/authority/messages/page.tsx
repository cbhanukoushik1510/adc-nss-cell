"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MessageSquare,
  Search,
  RefreshCw,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CalendarDays,
  Users,
  ClipboardCheck,
  UserCheck,
  Inbox,
  Clock,
  User,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

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

type ActivityMessage = {
  id: string;
  activity_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
};

type Volunteer = {
  id: string;
  full_name: string;
  roll_number: string;
  department: string;
  course: string | null;
  year: string;
  section: string | null;
  college_email: string;
  mobile_number: string;
  photo_url: string | null;
};

type Activity = {
  id: string;
  title: string | null;
  description: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AuthorityMessagesPage() {
  const router = useRouter();

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  const [messages, setMessages] =
    useState<ActivityMessage[]>([]);

  const [volunteers, setVolunteers] =
    useState<Record<string, Volunteer>>({});

  const [activities, setActivities] =
    useState<Record<string, Activity>>({});

  const [search, setSearch] = useState("");

  const [selectedMessage, setSelectedMessage] =
    useState<ActivityMessage | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        /* ---------------------------------------------------
           1. CURRENT USER
        --------------------------------------------------- */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        /* ---------------------------------------------------
           2. AUTHORITY PROFILE
        --------------------------------------------------- */

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
          throw new Error(
            authorityError.message ||
              "Unable to load authority profile."
          );
        }

        if (!authorityData) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        /* ---------------------------------------------------
           3. AUTHORITY SECURITY
        --------------------------------------------------- */

        const role = String(
          authorityData.role || ""
        ).toLowerCase();

        const designation = String(
          authorityData.designation || ""
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

        setAuthority(authorityData);

        /* ---------------------------------------------------
           4. LOAD MESSAGES
        --------------------------------------------------- */

        const {
          data: messageData,
          error: messageError,
        } = await supabase
          .from("activity_messages")
          .select(
            `
              id,
              activity_id,
              sender_id,
              receiver_id,
              message,
              created_at
            `
          )
          .eq("receiver_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (messageError) {
          throw new Error(
            messageError.message ||
              "Unable to load messages."
          );
        }

        const loadedMessages =
          (messageData || []) as ActivityMessage[];

        setMessages(loadedMessages);

        /* ---------------------------------------------------
           5. LOAD VOLUNTEERS
        --------------------------------------------------- */

        const senderIds = Array.from(
          new Set(
            loadedMessages.map(
              (message) => message.sender_id
            )
          )
        );

        if (senderIds.length > 0) {
          const {
            data: volunteerData,
            error: volunteerError,
          } = await supabase
            .from("volunteers")
            .select(
              `
                id,
                full_name,
                roll_number,
                department,
                course,
                year,
                section,
                college_email,
                mobile_number,
                photo_url
              `
            )
            .in("id", senderIds);

          if (volunteerError) {
            console.error(
              "Volunteer loading error:",
              volunteerError
            );
          }

          const volunteerMap: Record<
            string,
            Volunteer
          > = {};

          (volunteerData || []).forEach(
            (volunteer) => {
              volunteerMap[volunteer.id] =
                volunteer;
            }
          );

          setVolunteers(volunteerMap);
        } else {
          setVolunteers({});
        }

        /* ---------------------------------------------------
           6. LOAD ACTIVITIES
        --------------------------------------------------- */

        const activityIds = Array.from(
          new Set(
            loadedMessages.map(
              (message) => message.activity_id
            )
          )
        );

        if (activityIds.length > 0) {
          const {
            data: activityData,
            error: activityError,
          } = await supabase
            .from("activities")
            .select(
              `
                id,
                title,
                description
              `
            )
            .in("id", activityIds);

          if (activityError) {
            console.error(
              "Activity loading error:",
              activityError
            );
          }

          const activityMap: Record<
            string,
            Activity
          > = {};

          (activityData || []).forEach(
            (activity) => {
              activityMap[activity.id] =
                activity;
            }
          );

          setActivities(activityMap);
        } else {
          setActivities({});
        }
      } catch (err) {
        console.error(
          "Authority messages error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load messages."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredMessages = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return messages;
    }

    return messages.filter((message) => {
      const volunteer =
        volunteers[message.sender_id];

      const activity =
        activities[message.activity_id];

      return (
        message.message
          .toLowerCase()
          .includes(value) ||
        volunteer?.full_name
          ?.toLowerCase()
          .includes(value) ||
        volunteer?.roll_number
          ?.toLowerCase()
          .includes(value) ||
        volunteer?.department
          ?.toLowerCase()
          .includes(value) ||
        activity?.title
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [
    messages,
    search,
    volunteers,
    activities,
  ]);

  const roleLabel =
    authority?.designation ||
    authority?.role ||
    "Authority";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading messages...
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Unable to load messages
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            onClick={() => loadData()}
            className="mt-6 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#163A8C]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!authority) {
    return null;
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-slate-200 bg-white lg:flex lg:flex-col">

        {/* BRAND */}

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

        {/* USER */}

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
              onClick={() =>
                router.push("/authority")
              }
            />

            <SidebarLink
              icon={<CalendarDays size={18} />}
              label="Events"
              onClick={() =>
                router.push("/authority/events")
              }
            />

            <SidebarLink
              icon={<Users size={18} />}
              label="Volunteers"
              onClick={() =>
                router.push(
                  "/authority/volunteers"
                )
              }
            />

            <SidebarLink
              icon={<ClipboardCheck size={18} />}
              label="Attendance"
              onClick={() =>
                router.push(
                  "/authority/attendance"
                )
              }
            />

            <SidebarLink
              icon={<UserCheck size={18} />}
              label="Registrations"
              onClick={() =>
                router.push(
                  "/authority/registrations"
                )
              }
            />

            <SidebarLink
              icon={<MessageSquare size={18} />}
              label="Messages & Suggestions"
              active
              onClick={() =>
                router.push(
                  "/authority/messages"
                )
              }
            />

          </div>

        </nav>

        {/* ACCESS */}

        <div className="border-t border-slate-200 p-3">

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">

            <div className="flex items-center gap-2 text-[#0F2B7B]">

              <ShieldCheck size={16} />

              <span className="text-xs font-bold">
                View Only Access
              </span>

            </div>

            <p className="mt-2 text-[10px] leading-4 text-gray-500">
              Authority accounts can view NSS
              information but cannot modify
              administrative records.
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
            onClick={() =>
              setMobileMenuOpen(false)
            }
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
                onClick={() =>
                  setMobileMenuOpen(false)
                }
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
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<CalendarDays size={18} />}
                  label="Events"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/events"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<Users size={18} />}
                  label="Volunteers"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/volunteers"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<ClipboardCheck size={18} />}
                  label="Attendance"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/attendance"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<UserCheck size={18} />}
                  label="Registrations"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/registrations"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<MessageSquare size={18} />}
                  label="Messages & Suggestions"
                  active
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/messages"
                    );
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
          MAIN
      ===================================================== */}

      <div className="lg:pl-60">

        {/* TOP HEADER */}

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">

          <div className="flex h-[68px] items-center justify-between px-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={23} />
              </button>

              <div>

                <p className="hidden text-[11px] text-gray-400 sm:block">
                  Aurora&apos;s Degree & PG College
                </p>

                <h1 className="text-lg font-bold text-[#0F2B7B]">
                  Messages & Suggestions
                </h1>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

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
            CONTENT
        =================================================== */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* PAGE TITLE */}

          <section className="mb-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">

                  <span>
                    Authority Portal
                  </span>

                  <ChevronRight size={13} />

                  <span className="text-[#0F2B7B]">
                    Messages & Suggestions
                  </span>

                </div>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Communication Center
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                  Review messages received from NSS
                  volunteers regarding their activities
                  and participation.
                </p>

              </div>

              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
              >

                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <section className="grid gap-4 sm:grid-cols-3">

            <SummaryCard
              icon={
                <Inbox size={20} />
              }
              label="Total Messages"
              value={messages.length}
            />

            <SummaryCard
              icon={
                <Users size={20} />
              }
              label="Volunteer Senders"
              value={
                new Set(
                  messages.map(
                    (message) =>
                      message.sender_id
                  )
                ).size
              }
            />

            <SummaryCard
              icon={
                <Clock size={20} />
              }
              label="Latest Message"
              value={
                messages.length > 0
                  ? formatDate(
                      messages[0].created_at
                    )
                  : "—"
              }
              isText
            />

          </section>

          {/* =================================================
              SEARCH
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="relative w-full">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by volunteer, roll number, department, activity or message..."
                className="w-full rounded-xl border border-gray-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </section>

          {/* =================================================
              MOBILE SELECTED MESSAGE BACK BUTTON
          ================================================= */}

          {selectedMessage && (
            <button
              onClick={() =>
                setSelectedMessage(null)
              }
              className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#0F2B7B] lg:hidden"
            >
              <ArrowLeft size={17} />
              Back to messages
            </button>
          )}

          {/* =================================================
              INBOX + DETAILS
          ================================================= */}

          <section className="mt-6 grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">

            {/* =================================================
                MESSAGE LIST
            ================================================= */}

            <div
              className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
                selectedMessage
                  ? "hidden lg:block"
                  : "block"
              }`}
            >

              <div className="border-b border-slate-200 p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="font-bold text-gray-900">
                      Inbox
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {filteredMessages.length} message
                      {filteredMessages.length !== 1
                        ? "s"
                        : ""}
                    </p>

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
                    <MessageSquare size={19} />
                  </div>

                </div>

              </div>

              <div className="max-h-[700px] overflow-y-auto">

                {filteredMessages.length === 0 ? (
                  <div className="p-10 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-gray-400">
                      <MessageSquare size={24} />
                    </div>

                    <h3 className="mt-4 font-bold text-gray-800">
                      No messages found
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {search
                        ? "Try a different search."
                        : "There are no messages available for this authority account."}
                    </p>

                  </div>
                ) : (
                  filteredMessages.map(
                    (message) => {

                      const volunteer =
                        volunteers[
                          message.sender_id
                        ];

                      const activity =
                        activities[
                          message.activity_id
                        ];

                      const selected =
                        selectedMessage?.id ===
                        message.id;

                      return (
                        <button
                          key={message.id}
                          onClick={() =>
                            setSelectedMessage(
                              message
                            )
                          }
                          className={`w-full border-b border-slate-100 p-5 text-left transition ${
                            selected
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                        >

                          <div className="flex gap-3">

                            {/* AVATAR */}

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F2B7B] text-white">

                              {volunteer?.photo_url ? (
                                <img
                                  src={
                                    volunteer.photo_url
                                  }
                                  alt=""
                                  className="h-11 w-11 rounded-full object-cover"
                                />
                              ) : (
                                <User size={19} />
                              )}

                            </div>

                            {/* MESSAGE PREVIEW */}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-bold text-gray-900">
                                    {volunteer?.full_name ||
                                      "Volunteer"}
                                  </p>

                                  <p className="truncate text-[11px] text-gray-400">
                                    {volunteer?.roll_number ||
                                      "Volunteer ID unavailable"}
                                  </p>

                                </div>

                                <span className="shrink-0 text-[10px] text-gray-400">
                                  {formatDate(
                                    message.created_at
                                  )}
                                </span>

                              </div>

                              {activity?.title && (
                                <p className="mt-2 truncate text-xs font-semibold text-[#0F2B7B]">
                                  {activity.title}
                                </p>
                              )}

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                {message.message}
                              </p>

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )
                )}

              </div>

            </div>

            {/* =================================================
                MESSAGE DETAILS
            ================================================= */}

            <div
              className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
                selectedMessage
                  ? "block"
                  : "hidden lg:block"
              }`}
            >

              {!selectedMessage ? (
                <div className="flex min-h-[500px] items-center justify-center p-8">

                  <div className="max-w-md text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0F2B7B]">
                      <MessageSquare size={29} />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-gray-900">
                      Select a message
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Select a message from the inbox
                      to view the complete communication
                      and volunteer details.
                    </p>

                  </div>

                </div>
              ) : (
                <MessageDetails
                  message={selectedMessage}
                  volunteer={
                    volunteers[
                      selectedMessage.sender_id
                    ]
                  }
                  activity={
                    activities[
                      selectedMessage.activity_id
                    ]
                  }
                  onBack={() =>
                    setSelectedMessage(null)
                  }
                />
              )}

            </div>

          </section>

          {/* =================================================
              VIEW ONLY NOTICE
          ================================================= */}

          <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                <ShieldCheck size={19} />
              </div>

              <div>

                <h3 className="font-bold text-[#0F2B7B]">
                  Authority Communication Access
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  This section allows Principal and
                  Vice Principal accounts to review
                  communications received from NSS
                  volunteers. Administrative records
                  cannot be modified from the Authority
                  Portal.
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   MESSAGE DETAILS
========================================================= */

function MessageDetails({
  message,
  volunteer,
  activity,
  onBack,
}: {
  message: ActivityMessage;
  volunteer?: Volunteer;
  activity?: Activity;
  onBack: () => void;
}) {
  return (
    <div>

      {/* HEADER */}

      <div className="border-b border-slate-200 p-5 sm:p-6">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <button
              onClick={onBack}
              className="rounded-lg p-2 text-gray-500 hover:bg-slate-100 lg:hidden"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F2B7B] text-white">

              {volunteer?.photo_url ? (
                <img
                  src={volunteer.photo_url}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <User size={19} />
              )}

            </div>

            <div className="min-w-0">

              <h3 className="truncate text-lg font-bold text-gray-900">
                {volunteer?.full_name ||
                  "Volunteer"}
              </h3>

              <p className="text-xs text-gray-500">
                NSS Volunteer
              </p>

            </div>

          </div>

          <div className="hidden rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-[#0F2B7B] sm:block">
            Message
          </div>

        </div>

      </div>

      {/* BODY */}

      <div className="p-5 sm:p-7">

        {/* VOLUNTEER INFO */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center gap-2">

            <User
              size={17}
              className="text-[#0F2B7B]"
            />

            <h4 className="font-bold text-gray-900">
              Volunteer Information
            </h4>

          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">

            <InfoItem
              label="Full Name"
              value={
                volunteer?.full_name ||
                "Not available"
              }
            />

            <InfoItem
              label="Roll Number"
              value={
                volunteer?.roll_number ||
                "Not available"
              }
            />

            <InfoItem
              label="Department"
              value={
                volunteer?.department ||
                "Not available"
              }
            />

            <InfoItem
              label="Course"
              value={
                volunteer?.course ||
                "Not available"
              }
            />

            <InfoItem
              label="Year"
              value={
                volunteer?.year ||
                "Not available"
              }
            />

            <InfoItem
              label="Section"
              value={
                volunteer?.section ||
                "Not available"
              }
            />

            <InfoItem
              label="College Email"
              value={
                volunteer?.college_email ||
                "Not available"
              }
            />

            <InfoItem
              label="Mobile Number"
              value={
                volunteer?.mobile_number ||
                "Not available"
              }
            />

          </div>

        </div>

        {/* ACTIVITY */}

        <div className="mt-5 rounded-2xl border border-slate-200 p-5">

          <div className="flex items-center gap-2">

            <CalendarDays
              size={17}
              className="text-[#0F2B7B]"
            />

            <h4 className="font-bold text-gray-900">
              Related Activity
            </h4>

          </div>

          <div className="mt-3">

            <p className="font-semibold text-[#0F2B7B]">
              {activity?.title ||
                "Activity information unavailable"}
            </p>

            {activity?.description && (
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {activity.description}
              </p>
            )}

          </div>

        </div>

        {/* MESSAGE */}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2">

              <MessageSquare
                size={17}
                className="text-[#0F2B7B]"
              />

              <h4 className="font-bold text-gray-900">
                Message
              </h4>

            </div>

            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={14} />
              {formatDateTime(
                message.created_at
              )}
            </span>

          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-5">

            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
              {message.message}
            </p>

          </div>

        </div>

        {/* SYSTEM DETAILS */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">

          <div className="rounded-xl border border-slate-200 p-4">

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Message ID
            </p>

            <p className="mt-1 break-all text-xs font-medium text-gray-600">
              {message.id}
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 p-4">

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Activity ID
            </p>

            <p className="mt-1 break-all text-xs font-medium text-gray-600">
              {message.activity_id}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  icon,
  label,
  active = false,
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
  active = false,
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

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
  isText = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
          {icon}
        </div>

        <span
          className={
            isText
              ? "text-sm font-bold text-gray-900"
              : "text-2xl font-bold text-gray-900"
          }
        >
          {value}
        </span>

      </div>

      <p className="mt-3 text-sm font-medium text-gray-500">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>

    </div>
  );
}