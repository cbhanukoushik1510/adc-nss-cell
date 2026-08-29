"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Announcement = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
  published_at?: string | null;
  status?: string | null;
  priority?: string | null;
  category?: string | null;
  created_by?: string | null;
  is_published?: boolean | null;
};

type Authority = {
  id: string;
  user_id: string;
  full_name: string;
  role?: string | null;
  designation?: string | null;
  is_active?: boolean;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPriorityClass(priority?: string | null) {
  const value = String(priority || "").toLowerCase();

  if (
    value.includes("urgent") ||
    value.includes("high")
  ) {
    return "bg-red-50 text-red-700 border-red-100";
  }

  if (
    value.includes("medium") ||
    value.includes("important")
  ) {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  return "bg-blue-50 text-blue-700 border-blue-100";
}

function getStatusClass(status?: string | null) {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("publish") ||
    value === "active"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    value.includes("draft")
  ) {
    return "bg-gray-100 text-gray-600";
  }

  return "bg-blue-50 text-blue-700";
}

/* =========================================================
   PAGE
========================================================= */

export default function POAnnouncementsPage() {
  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  /* =========================================================
     LOAD PO
  ========================================================= */

  const loadAuthority = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(
        authError.message ||
          "Unable to verify your login."
      );
    }

    if (!user) {
      window.location.href = "/login";
      return null;
    }

    const { data, error } = await supabase
      .from("authority")
      .select(
        `
          id,
          user_id,
          full_name,
          role,
          designation,
          is_active
        `
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load authority profile."
      );
    }

    if (!data) {
      throw new Error(
        "No active authority profile was found for this account."
      );
    }

    const currentAuthority =
      data as Authority;

    setAuthority(currentAuthority);

    return currentAuthority;
  }, []);

  /* =========================================================
     LOAD ANNOUNCEMENTS
  ========================================================= */

  const loadAnnouncements =
    useCallback(async () => {
      /*
       * We select the common announcement fields.
       *
       * The page is intentionally READ-ONLY for PO.
       */

      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw new Error(
          error.message ||
            "Unable to load announcements."
        );
      }

      setAnnouncements(
        ((data || []) as Announcement[])
      );
    }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadAuthority(),
        loadAnnouncements(),
      ]);
    } catch (err) {
      console.error(
        "PO announcements error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load announcements."
      );
    } finally {
      setLoading(false);
    }
  }, [
    loadAuthority,
    loadAnnouncements,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      await loadAnnouncements();
    } catch (err) {
      console.error(
        "PO announcements refresh error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh announcements."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {
    const values = announcements
      .map((item) =>
        String(item.category || "").trim()
      )
      .filter(Boolean);

    return Array.from(
      new Set(values)
    ).sort();
  }, [announcements]);

  /* =========================================================
     PRIORITIES
  ========================================================= */

  const priorities = useMemo(() => {
    const values = announcements
      .map((item) =>
        String(item.priority || "").trim()
      )
      .filter(Boolean);

    return Array.from(
      new Set(values)
    ).sort();
  }, [announcements]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredAnnouncements =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return announcements.filter(
        (announcement) => {
          const title =
            announcement.title || "";

          const content =
            announcement.content || "";

          const category =
            announcement.category || "";

          const priority =
            announcement.priority || "";

          const matchesSearch =
            !query ||
            title
              .toLowerCase()
              .includes(query) ||
            content
              .toLowerCase()
              .includes(query) ||
            category
              .toLowerCase()
              .includes(query) ||
            priority
              .toLowerCase()
              .includes(query);

          const matchesCategory =
            categoryFilter === "all" ||
            String(
              announcement.category || ""
            ).toLowerCase() ===
              categoryFilter.toLowerCase();

          const matchesPriority =
            priorityFilter === "all" ||
            String(
              announcement.priority || ""
            ).toLowerCase() ===
              priorityFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesCategory &&
            matchesPriority
          );
        }
      );
    }, [
      announcements,
      search,
      categoryFilter,
      priorityFilter,
    ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const publishedCount = useMemo(() => {
    return announcements.filter(
      (item) => {
        if (
          typeof item.is_published ===
          "boolean"
        ) {
          return item.is_published;
        }

        const status =
          String(
            item.status || ""
          ).toLowerCase();

        return (
          status.includes("publish") ||
          status === "active"
        );
      }
    ).length;
  }, [announcements]);

  const highPriorityCount =
    useMemo(() => {
      return announcements.filter(
        (item) => {
          const priority =
            String(
              item.priority || ""
            ).toLowerCase();

          return (
            priority.includes("urgent") ||
            priority.includes("high")
          );
        }
      ).length;
    }, [announcements]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="w-full">
        <div className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
              <Bell size={23} />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw
                size={15}
                className="animate-spin"
              />
              Loading announcements...
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !authority) {
    return (
      <main className="w-full">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <div className="flex gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <h2 className="font-bold text-red-800">
                  Unable to load announcements
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadData}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b225f]"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white shadow-sm sm:h-14 sm:w-14">
                <Bell size={25} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F2B7B]">
                  NSS Information Centre
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Announcements
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                  View official NSS announcements,
                  notices and important communications
                  published by the administration.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 lg:self-center"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnnouncementStat
            icon={<Bell size={19} />}
            label="Total Announcements"
            value={announcements.length}
          />

          <AnnouncementStat
            icon={<Eye size={19} />}
            label="Published"
            value={publishedCount}
          />

          <AnnouncementStat
            icon={<AlertCircle size={19} />}
            label="High Priority"
            value={highPriorityCount}
          />
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search announcements..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-[#0F2B7B]/10"
              />
            </div>

            {/* CATEGORY */}

            <div className="relative w-full xl:w-52">
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* PRIORITY */}

            <div className="relative w-full xl:w-48">
              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
              >
                <option value="all">
                  All Priorities
                </option>

                {priorities.map(
                  (priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            ANNOUNCEMENT LIST
        ================================================= */}

        <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Official Announcements
                </h2>

                <p className="text-xs text-gray-500">
                  {filteredAnnouncements.length}{" "}
                  announcement
                  {filteredAnnouncements.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  available
                </p>
              </div>

              {(search ||
                categoryFilter !== "all" ||
                priorityFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("all");
                    setPriorityFilter("all");
                  }}
                  className="self-start text-xs font-semibold text-[#0F2B7B] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filteredAnnouncements.length ===
          0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
                <FileText size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No announcements found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search ||
                categoryFilter !== "all" ||
                priorityFilter !== "all"
                  ? "Try changing your search or filter selections."
                  : "Published announcements will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAnnouncements.map(
                (announcement) => (
                  <button
                    key={announcement.id}
                    type="button"
                    onClick={() =>
                      setSelectedAnnouncement(
                        announcement
                      )
                    }
                    className="group w-full p-5 text-left transition hover:bg-gray-50 sm:p-6"
                  >
                    <div className="flex gap-4">
                      {/* ICON */}

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
                        <Bell size={19} />
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0F2B7B]">
                              {
                                announcement.title
                              }
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {announcement.category && (
                                <span className="rounded-full bg-[#F1F4FA] px-2.5 py-1 text-[11px] font-semibold text-[#0F2B7B]">
                                  {
                                    announcement.category
                                  }
                                </span>
                              )}

                              {announcement.priority && (
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPriorityClass(
                                    announcement.priority
                                  )}`}
                                >
                                  {
                                    announcement.priority
                                  }
                                </span>
                              )}

                              {announcement.status && (
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                                    announcement.status
                                  )}`}
                                >
                                  {
                                    announcement.status
                                  }
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-400">
                            <CalendarDays
                              size={13}
                            />
                            {formatDate(
                              announcement.published_at ||
                                announcement.created_at
                            )}
                          </div>
                        </div>

                        <p className="mt-3 line-clamp-2 max-w-4xl text-sm leading-6 text-gray-600">
                          {
                            announcement.content
                          }
                        </p>

                        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#0F2B7B]">
                          <Eye size={14} />
                          View announcement
                        </div>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          ANNOUNCEMENT DETAIL MODAL
      ===================================================== */}

      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-5 sm:px-7">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
                  <Bell size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0F2B7B]">
                    Official NSS Announcement
                  </p>

                  <h2 className="mt-1 text-xl font-bold leading-7 text-gray-900 sm:text-2xl">
                    {
                      selectedAnnouncement.title
                    }
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAnnouncement(
                    null
                  )
                }
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div className="overflow-y-auto px-5 py-6 sm:px-7">
              <div className="flex flex-wrap gap-2">
                {selectedAnnouncement.category && (
                  <span className="rounded-full bg-[#F1F4FA] px-3 py-1.5 text-xs font-semibold text-[#0F2B7B]">
                    {
                      selectedAnnouncement.category
                    }
                  </span>
                )}

                {selectedAnnouncement.priority && (
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityClass(
                      selectedAnnouncement.priority
                    )}`}
                  >
                    {
                      selectedAnnouncement.priority
                    }
                  </span>
                )}

                {selectedAnnouncement.status && (
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                      selectedAnnouncement.status
                    )}`}
                  >
                    {
                      selectedAnnouncement.status
                    }
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  Published:{" "}
                  {formatDate(
                    selectedAnnouncement.published_at ||
                      selectedAnnouncement.created_at
                  )}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={14} />
                  Updated:{" "}
                  {formatDateTime(
                    selectedAnnouncement.updated_at ||
                      selectedAnnouncement.created_at
                  )}
                </span>
              </div>

              <article className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-7">
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {
                    selectedAnnouncement.content
                  }
                </p>
              </article>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                    <Eye size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0F2B7B]">
                      Read-only information
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      Program Officers can view official
                      announcements here. Creation,
                      editing and publishing remain under
                      the authorized administration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex justify-end border-t border-gray-200 p-4 sm:p-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedAnnouncement(
                    null
                  )
                }
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function AnnouncementStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F4FA] text-[#0F2B7B]">
          {icon}
        </div>

        <span className="text-2xl font-bold text-gray-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">
        {label}
      </p>
    </div>
  );
}