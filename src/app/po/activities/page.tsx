"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type ActivityItem = {
  id: string;

  title?: string | null;
  name?: string | null;

  description?: string | null;

  status?: string | null;

  activity_type?: string | null;
  type?: string | null;
  category?: string | null;

  event_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;

  location?: string | null;
  venue?: string | null;

  assigned_to?: string | null;
  assigned_head?: string | null;
  coordinator_id?: string | null;

  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  volunteer_count?: number | null;
  participants_count?: number | null;

  [key: string]: unknown;
};

type Authority = {
  id: string;
  user_id: string;
  full_name: string;
  role?: string | null;
  designation?: string | null;
  is_active?: boolean | null;
};

/* =========================================================
   HELPERS
========================================================= */

function activityTitle(activity: ActivityItem) {
  return (
    activity.title ||
    activity.name ||
    "Untitled Activity"
  );
}

function activityType(activity: ActivityItem) {
  return (
    activity.activity_type ||
    activity.type ||
    activity.category ||
    "NSS Activity"
  );
}

function activityDate(activity: ActivityItem) {
  return (
    activity.event_date ||
    activity.start_date ||
    null
  );
}

function activityLocation(activity: ActivityItem) {
  return (
    activity.location ||
    activity.venue ||
    null
  );
}

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

function normalizeStatus(status?: string | null) {
  return String(status || "")
    .trim()
    .toLowerCase();
}

function getStatusLabel(status?: string | null) {
  const value = normalizeStatus(status);

  if (!value) return "Not specified";

  if (
    value === "completed" ||
    value === "complete" ||
    value === "finished"
  ) {
    return "Completed";
  }

  if (
    value === "ongoing" ||
    value === "in progress" ||
    value === "active"
  ) {
    return "Ongoing";
  }

  if (
    value === "upcoming" ||
    value === "scheduled"
  ) {
    return "Upcoming";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "Cancelled";
  }

  return status || "Not specified";
}

function getStatusClass(status?: string | null) {
  const value = normalizeStatus(status);

  if (
    value === "completed" ||
    value === "complete" ||
    value === "finished"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    value === "ongoing" ||
    value === "in progress" ||
    value === "active"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    value === "upcoming" ||
    value === "scheduled"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-gray-100 text-gray-600";
}

function getInitials(name?: string | null) {
  if (!name) return "NA";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

/* =========================================================
   PAGE
========================================================= */

export default function POActivitiesPage() {
  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [people, setPeople] =
    useState<Authority[]>([]);

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [selectedActivity, setSelectedActivity] =
    useState<ActivityItem | null>(null);

  /* =========================================================
     LOAD AUTHORITY
  ========================================================= */

  const loadAuthority = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(
        authError.message ||
          "Unable to verify login."
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
     LOAD ACTIVITIES
  ========================================================= */

  const loadActivities =
    useCallback(async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw new Error(
          error.message ||
            "Unable to load NSS activities."
        );
      }

      setActivities(
        ((data || []) as ActivityItem[])
      );
    }, []);

  /* =========================================================
     LOAD AUTHORITY PEOPLE
  ========================================================= */

  const loadPeople = useCallback(async () => {
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
      .eq("is_active", true)
      .order("full_name", {
        ascending: true,
      });

    if (error) {
      /*
       * This should not block the activity page.
       * Activities can still be viewed.
       */
      console.warn(
        "PO activity authority lookup warning:",
        error
      );

      setPeople([]);
      return;
    }

    setPeople(
      ((data || []) as Authority[])
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
        loadActivities(),
        loadPeople(),
      ]);
    } catch (err) {
      console.error(
        "PO activities error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load activities."
      );
    } finally {
      setLoading(false);
    }
  }, [
    loadAuthority,
    loadActivities,
    loadPeople,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     REALTIME
  ========================================================= */

  useEffect(() => {
    const channel = supabase
      .channel("po-activities-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
        },
        async () => {
          await loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadActivities]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      await Promise.all([
        loadActivities(),
        loadPeople(),
      ]);
    } catch (err) {
      console.error(
        "PO activity refresh error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh activities."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const statusOptions = useMemo(() => {
    const values = activities
      .map((item) => item.status)
      .filter(Boolean)
      .map((value) =>
        String(value).trim()
      );

    return Array.from(
      new Set(values)
    ).sort();
  }, [activities]);

  const typeOptions = useMemo(() => {
    const values = activities
      .map((item) =>
        activityType(item)
      )
      .filter(Boolean)
      .map((value) =>
        String(value).trim()
      );

    return Array.from(
      new Set(values)
    ).sort();
  }, [activities]);

  /* =========================================================
     FILTERED ACTIVITIES
  ========================================================= */

  const filteredActivities =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return activities.filter(
        (activity) => {
          const title =
            activityTitle(activity);

          const description =
            activity.description || "";

          const type =
            activityType(activity);

          const location =
            activityLocation(activity) ||
            "";

          const status =
            activity.status || "";

          const matchesSearch =
            !query ||
            title
              .toLowerCase()
              .includes(query) ||
            description
              .toLowerCase()
              .includes(query) ||
            String(type)
              .toLowerCase()
              .includes(query) ||
            location
              .toLowerCase()
              .includes(query) ||
            status
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            String(
              activity.status || ""
            ).toLowerCase() ===
              statusFilter.toLowerCase();

          const matchesType =
            typeFilter === "all" ||
            String(
              activityType(activity)
            ).toLowerCase() ===
              typeFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        }
      );
    }, [
      activities,
      search,
      statusFilter,
      typeFilter,
    ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const completedCount = useMemo(() => {
    return activities.filter((item) => {
      const status =
        normalizeStatus(item.status);

      return (
        status === "completed" ||
        status === "complete" ||
        status === "finished"
      );
    }).length;
  }, [activities]);

  const ongoingCount = useMemo(() => {
    return activities.filter((item) => {
      const status =
        normalizeStatus(item.status);

      return (
        status === "ongoing" ||
        status === "in progress" ||
        status === "active"
      );
    }).length;
  }, [activities]);

  const upcomingCount = useMemo(() => {
    return activities.filter((item) => {
      const status =
        normalizeStatus(item.status);

      return (
        status === "upcoming" ||
        status === "scheduled"
      );
    }).length;
  }, [activities]);

  /* =========================================================
     ASSIGNED PERSON
  ========================================================= */

  const getAssignedPerson = (
    activity: ActivityItem
  ) => {
    const possibleId =
      activity.assigned_to ||
      activity.assigned_head ||
      activity.coordinator_id;

    if (!possibleId) return null;

    return (
      people.find(
        (person) =>
          person.id === possibleId
      ) || null
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="w-full">
        <div className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
              <Activity size={23} />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw
                size={15}
                className="animate-spin"
              />
              Loading NSS activities...
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR STATE
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
                  Unable to load activities
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
                <Activity size={25} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F2B7B]">
                  NSS Operations
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Activities
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                  View NSS activities, schedules,
                  locations, responsibilities and
                  activity status.
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

        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActivityStat
            icon={<Activity size={19} />}
            label="Total Activities"
            value={activities.length}
          />

          <ActivityStat
            icon={<CheckCircle2 size={19} />}
            label="Completed"
            value={completedCount}
          />

          <ActivityStat
            icon={<Clock3 size={19} />}
            label="Ongoing"
            value={ongoingCount}
          />

          <ActivityStat
            icon={<CalendarDays size={19} />}
            label="Upcoming"
            value={upcomingCount}
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
                placeholder="Search activities, location or description..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-[#0F2B7B]/10"
              />
            </div>

            {/* STATUS */}

            <div className="relative w-full xl:w-52">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
              >
                <option value="all">
                  All Status
                </option>

                {statusOptions.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {getStatusLabel(status)}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* TYPE */}

            <div className="relative w-full xl:w-56">
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
              >
                <option value="all">
                  All Activity Types
                </option>

                {typeOptions.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
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
            ACTIVITY LIST
        ================================================= */}

        <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  NSS Activities
                </h2>

                <p className="text-xs text-gray-500">
                  {filteredActivities.length}{" "}
                  activit
                  {filteredActivities.length ===
                  1
                    ? "y"
                    : "ies"}{" "}
                  available
                </p>
              </div>

              {(search ||
                statusFilter !== "all" ||
                typeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  className="self-start text-xs font-semibold text-[#0F2B7B] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filteredActivities.length ===
          0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
                <Activity size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No activities found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {search ||
                statusFilter !== "all" ||
                typeFilter !== "all"
                  ? "Try changing your search or filter selections."
                  : "NSS activities will appear here when they are available."}
              </p>
            </div>
          ) : (
            <div className="grid gap-0 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-y-0">
              {filteredActivities.map(
                (activity) => {
                  const assigned =
                    getAssignedPerson(
                      activity
                    );

                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() =>
                        setSelectedActivity(
                          activity
                        )
                      }
                      className="group flex w-full flex-col p-5 text-left transition hover:bg-gray-50 sm:p-6 lg:border-b lg:border-gray-100 lg:odd:border-r"
                    >
                      {/* TOP */}

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
                            <Activity
                              size={19}
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-base font-bold text-gray-900 transition group-hover:text-[#0F2B7B]">
                              {activityTitle(
                                activity
                              )}
                            </h3>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              {activityType(
                                activity
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                            activity.status
                          )}`}
                        >
                          {getStatusLabel(
                            activity.status
                          )}
                        </span>
                      </div>

                      {/* DESCRIPTION */}

                      {activity.description && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
                          {
                            activity.description
                          }
                        </p>
                      )}

                      {/* META */}

                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <MetaItem
                          icon={
                            <CalendarDays
                              size={14}
                            />
                          }
                          value={formatDate(
                            activityDate(
                              activity
                            )
                          )}
                        />

                        <MetaItem
                          icon={
                            <MapPin
                              size={14}
                            />
                          }
                          value={
                            activityLocation(
                              activity
                            ) || "Location not specified"
                          }
                        />
                      </div>

                      {/* FOOTER */}

                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-600">
                            {getInitials(
                              assigned?.full_name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-gray-700">
                              {assigned?.full_name ||
                                "Not assigned"}
                            </p>

                            {assigned && (
                              <p className="truncate text-[10px] text-gray-400">
                                {assigned.designation ||
                                  assigned.role ||
                                  "NSS Authority"}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0F2B7B]">
                          <Eye size={14} />
                          View
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          ACTIVITY DETAIL MODAL
      ===================================================== */}

      {selectedActivity && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-5 sm:px-7">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
                  <Activity size={20} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0F2B7B]">
                    NSS Activity
                  </p>

                  <h2 className="mt-1 text-xl font-bold leading-7 text-gray-900 sm:text-2xl">
                    {activityTitle(
                      selectedActivity
                    )}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedActivity(
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
              {/* BADGES */}

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                    selectedActivity.status
                  )}`}
                >
                  {getStatusLabel(
                    selectedActivity.status
                  )}
                </span>

                <span className="rounded-full bg-[#F1F4FA] px-3 py-1.5 text-xs font-semibold text-[#0F2B7B]">
                  {activityType(
                    selectedActivity
                  )}
                </span>
              </div>

              {/* DESCRIPTION */}

              {selectedActivity.description && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={17}
                      className="text-[#0F2B7B]"
                    />

                    <h3 className="text-sm font-bold text-gray-900">
                      Activity Description
                    </h3>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                    {
                      selectedActivity.description
                    }
                  </p>
                </div>
              )}

              {/* DETAILS */}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailBox
                  icon={
                    <CalendarDays
                      size={17}
                    />
                  }
                  label="Activity Date"
                  value={formatDate(
                    activityDate(
                      selectedActivity
                    )
                  )}
                />

                <DetailBox
                  icon={
                    <MapPin size={17} />
                  }
                  label="Location"
                  value={
                    activityLocation(
                      selectedActivity
                    ) ||
                    "Location not specified"
                  }
                />

                <DetailBox
                  icon={
                    <Users size={17} />
                  }
                  label="Participants"
                  value={
                    selectedActivity.participants_count !=
                      null
                      ? String(
                          selectedActivity.participants_count
                        )
                      : selectedActivity.volunteer_count !=
                          null
                        ? String(
                            selectedActivity.volunteer_count
                          )
                        : "Not specified"
                  }
                />

                <DetailBox
                  icon={
                    <Clock3 size={17} />
                  }
                  label="Created"
                  value={formatDateTime(
                    selectedActivity.created_at
                  )}
                />
              </div>

              {/* ASSIGNMENT */}

              {(() => {
                const assigned =
                  getAssignedPerson(
                    selectedActivity
                  );

                if (!assigned) {
                  return (
                    <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                          <Users size={17} />
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Responsibility
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            No responsible authority
                            specified
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Responsible Authority
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-sm font-bold text-[#0F2B7B]">
                        {getInitials(
                          assigned.full_name
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {assigned.full_name}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {assigned.designation ||
                            assigned.role ||
                            "NSS Authority"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SYSTEM INFORMATION */}

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                    <Eye size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0F2B7B]">
                      Program Officer View
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      This section provides visibility
                      into NSS activities. Activity
                      management and operational changes
                      remain with the authorized
                      management roles.
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
                  setSelectedActivity(
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
   STAT
========================================================= */

function ActivityStat({
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

/* =========================================================
   META ITEM
========================================================= */

function MetaItem({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
      <span className="shrink-0 text-[#0F2B7B]">
        {icon}
      </span>

      <span className="truncate text-xs font-medium text-gray-600">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-[#0F2B7B]">
        {icon}

        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}