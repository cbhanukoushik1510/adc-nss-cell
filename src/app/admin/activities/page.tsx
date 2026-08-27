"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

/* =========================================================
   TYPES
========================================================= */

interface Volunteer {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  college_email: string;
  role: string | null;
  status: string | null;
  nss_unit: string | null;
  department: string;
  year: string;
  roll_number: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  assigned_to: string;
  assigned_by: string;
  status: string;
  priority: string;
  due_date: string | null;
  response: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ActivityForm {
  title: string;
  description: string;
  activity_type: string;
  assigned_to: string;
  priority: string;
  due_date: string;
}

type StatusFilter =
  | "All"
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Cancelled";

/* =========================================================
   DEFAULT FORM
========================================================= */

const emptyForm: ActivityForm = {
  title: "",
  description: "",
  activity_type: "Work",
  assigned_to: "",
  priority: "Medium",
  due_date: "",
};

/* =========================================================
   OPTIONS
========================================================= */

const activityTypes = [
  "Work",
  "Pending Work",
  "Reminder",
  "Profile Update",
  "Documentation",
  "Event Work",
  "Attendance",
  "Certificate Work",
  "Communication",
  "Other",
];

const priorityOptions = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (value: string | null) => {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-700 border-green-200";

    case "In Progress":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "Cancelled":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-orange-50 text-orange-700 border-orange-200";
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "Urgent":
      return "bg-red-100 text-red-700";

    case "High":
      return "bg-orange-100 text-orange-700";

    case "Low":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-blue-100 text-blue-700";
  }
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminActivitiesPage() {
  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [volunteers, setVolunteers] =
    useState<Volunteer[]>([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [showForm, setShowForm] =
    useState(false);

  const [editingActivity, setEditingActivity] =
    useState<ActivityItem | null>(null);

  const [form, setForm] =
    useState<ActivityForm>(emptyForm);

  /* =======================================================
     LOAD VOLUNTEERS
  ======================================================= */

  const loadUsers = async () => {
    setUsersLoading(true);

    try {
      /*
       * IMPORTANT:
       * We use the real `volunteers` table.
       *
       * assigned_to in activities should contain
       * volunteers.auth_user_id, NOT volunteers.id.
       */

      const {
        data,
        error: usersError,
      } = await supabase
        .from("volunteers")
        .select(`
          id,
          auth_user_id,
          full_name,
          college_email,
          role,
          status,
          nss_unit,
          department,
          year,
          roll_number
        `)
        .not("auth_user_id", "is", null)
        .order("full_name", {
          ascending: true,
        });

      if (usersError) {
        console.error(
          "Volunteers loading error:",
          usersError
        );

        throw usersError;
      }

      setVolunteers(
        (data || []) as Volunteer[]
      );
    } catch (err) {
      console.error(
        "Profiles/volunteers loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load volunteers."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  /* =======================================================
     LOAD ACTIVITIES
  ======================================================= */

  const loadActivities = async (
    refresh = false
  ) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      /*
       * RLS controls which activities the current
       * authenticated user can see.
       *
       * Admin/POS-created activities are visible
       * to their creator.
       *
       * Assigned users can see their activities.
       */

      const {
        data,
        error: activitiesError,
      } = await supabase
        .from("activities")
        .select(`
          id,
          title,
          description,
          activity_type,
          assigned_to,
          assigned_by,
          status,
          priority,
          due_date,
          response,
          completed_at,
          created_at,
          updated_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (activitiesError) {
        console.error(
          "Activities loading error:",
          activitiesError
        );

        throw activitiesError;
      }

      setActivities(
        (data || []) as ActivityItem[]
      );
    } catch (err) {
      console.error(
        "Activities loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load activities."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIALIZE
  ======================================================= */

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      await Promise.all([
        loadActivities(),
        loadUsers(),
      ]);

      setLoading(false);
    };

    initialize();
  }, []);

  /* =======================================================
     MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  const openCreateForm = () => {
    clearMessages();

    setEditingActivity(null);

    setForm({
      ...emptyForm,
    });

    setShowForm(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEditForm = (
    activity: ActivityItem
  ) => {
    clearMessages();

    setEditingActivity(activity);

    setForm({
      title: activity.title || "",
      description:
        activity.description || "",
      activity_type:
        activity.activity_type || "Work",
      assigned_to:
        activity.assigned_to || "",
      priority:
        activity.priority || "Medium",
      due_date: activity.due_date
        ? activity.due_date.slice(0, 16)
        : "",
    });

    setShowForm(true);
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingActivity(null);

    setForm({
      ...emptyForm,
    });
  };

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateForm = (
    field: keyof ActivityForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =======================================================
     FIND VOLUNTEER
  ======================================================= */

  const getVolunteer = (
    authUserId: string
  ) => {
    return volunteers.find(
      (volunteer) =>
        volunteer.auth_user_id ===
        authUserId
    );
  };

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    if (!form.title.trim()) {
      setError("Activity title is required.");
      return;
    }

    if (!form.assigned_to) {
      setError(
        "Please select a volunteer to assign this activity."
      );
      return;
    }

    /*
     * Make sure selected user really exists
     * and has an auth_user_id.
     */

    const selectedVolunteer =
      volunteers.find(
        (volunteer) =>
          volunteer.auth_user_id ===
          form.assigned_to
      );

    if (!selectedVolunteer) {
      setError(
        "Selected volunteer could not be found."
      );
      return;
    }

    setSaving(true);

    try {
      const dueDate =
        form.due_date.trim()
          ? new Date(
              form.due_date
            ).toISOString()
          : null;

      if (editingActivity) {
        /*
         * IMPORTANT:
         *
         * Your current UPDATE RLS policy is:
         *
         * assigned_to = auth.uid()
         *
         * Therefore an assigned volunteer can update
         * their activity, but an admin who created it
         * may NOT be allowed to update it unless your
         * UPDATE policy also permits admins/POS.
         *
         * We still attempt the update and show the
         * exact Supabase error if RLS blocks it.
         */

        const {
          error: updateError,
        } = await supabase
          .from("activities")
          .update({
            title: form.title.trim(),
            description:
              form.description.trim() ||
              null,
            activity_type:
              form.activity_type,
            assigned_to:
              form.assigned_to,
            priority:
              form.priority,
            due_date: dueDate,
          })
          .eq(
            "id",
            editingActivity.id
          );

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          "Activity updated successfully."
        );
      } else {
        /*
         * INSERT RLS requires:
         *
         * assigned_by = auth.uid()
         *
         * So we obtain the currently logged-in
         * Supabase Auth user here.
         */

        const {
          data: {
            user,
          },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          throw new Error(
            "You are not logged in. Please log in again."
          );
        }

        const {
          error: insertError,
        } = await supabase
          .from("activities")
          .insert({
            title:
              form.title.trim(),

            description:
              form.description.trim() ||
              null,

            activity_type:
              form.activity_type,

            assigned_to:
              form.assigned_to,

            assigned_by:
              user.id,

            status: "Pending",

            priority:
              form.priority,

            due_date:
              dueDate,

            response: null,

            completed_at: null,
          });

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          `Activity assigned successfully to ${selectedVolunteer.full_name}.`
        );
      }

      setShowForm(false);
      setEditingActivity(null);

      setForm({
        ...emptyForm,
      });

      await loadActivities(true);
    } catch (err) {
      console.error(
        "Activity save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save activity."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (
    activity: ActivityItem,
    newStatus: string
  ) => {
    clearMessages();

    setUpdatingId(activity.id);

    try {
      const updateData: {
        status: string;
        completed_at?: string | null;
      } = {
        status: newStatus,
      };

      if (newStatus === "Completed") {
        updateData.completed_at =
          new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }

      const {
        error: updateError,
      } = await supabase
        .from("activities")
        .update(updateData)
        .eq("id", activity.id);

      if (updateError) {
        throw updateError;
      }

      setActivities((current) =>
        current.map((item) =>
          item.id === activity.id
            ? {
                ...item,
                status: newStatus,
                completed_at:
                  updateData.completed_at ||
                  null,
              }
            : item
        )
      );

      setSuccess(
        `Activity marked as ${newStatus}.`
      );
    } catch (err) {
      console.error(
        "Activity status update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update activity status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (
    activity: ActivityItem
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${activity.title}"?`
      );

    if (!confirmed) return;

    clearMessages();

    setDeletingId(activity.id);

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("activities")
        .delete()
        .eq(
          "id",
          activity.id
        );

      if (deleteError) {
        throw deleteError;
      }

      setActivities((current) =>
        current.filter(
          (item) =>
            item.id !== activity.id
        )
      );

      setSuccess(
        "Activity deleted successfully."
      );
    } catch (err) {
      console.error(
        "Activity delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete activity."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCount =
    activities.length;

  const pendingCount =
    activities.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const progressCount =
    activities.filter(
      (item) =>
        item.status === "In Progress"
    ).length;

  const completedCount =
    activities.filter(
      (item) =>
        item.status === "Completed"
    ).length;

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredActivities =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      return activities.filter(
        (activity) => {
          if (
            statusFilter !==
              "All" &&
            activity.status !==
              statusFilter
          ) {
            return false;
          }

          if (!text) {
            return true;
          }

          const volunteer =
            getVolunteer(
              activity.assigned_to
            );

          const searchable =
            [
              activity.title,
              activity.description,
              activity.activity_type,
              activity.status,
              activity.priority,
              volunteer?.full_name,
              volunteer?.college_email,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            text
          );
        }
      );
    }, [
      activities,
      search,
      statusFilter,
      volunteers,
    ]);

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <AdminDashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0F2B7B]">
              <Activity className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0F2B7B]">
                Activities
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Assign work, reminders, pending tasks
                and profile updates to volunteers.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => {
                loadActivities(true);
                loadUsers();
              }}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={
                openCreateForm
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#143a96]"
            >
              <Plus className="h-5 w-5" />

              Assign Activity
            </button>

          </div>
        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800">

            <div className="flex items-center gap-3">

              <CheckCircle2 className="h-5 w-5 shrink-0" />

              <p className="text-sm font-semibold">
                {success}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="rounded-lg p-1 hover:bg-green-100"
            >
              <X className="h-5 w-5" />
            </button>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">

            <div className="flex gap-3">

              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-bold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-5 w-5" />
            </button>

          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total
                </p>

                <p className="mt-2 text-3xl font-bold text-[#0F2B7B]">
                  {totalCount}
                </p>
              </div>

              <Activity className="h-6 w-6 text-[#0F2B7B]" />

            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {pendingCount}
                </p>
              </div>

              <Clock className="h-6 w-6 text-orange-500" />

            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {progressCount}
                </p>
              </div>

              <RefreshCw className="h-6 w-6 text-blue-500" />

            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {completedCount}
                </p>
              </div>

              <CheckCircle2 className="h-6 w-6 text-green-500" />

            </div>
          </div>

        </div>

        {/* =================================================
            MAIN SECTION
        ================================================= */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          {/* HEADER */}

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Assigned Activities
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Track work assigned to volunteers.
                </p>
              </div>

              <div className="relative w-full lg:w-[380px]">

                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search activities..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* FILTERS */}

            <div className="mt-5 flex flex-wrap gap-2">

              {(
                [
                  "All",
                  "Pending",
                  "In Progress",
                  "Completed",
                  "Cancelled",
                ] as StatusFilter[]
              ).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        status
                      )
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      statusFilter ===
                      status
                        ? "bg-[#0F2B7B] text-white"
                        : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}

            </div>

          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          {loading ? (
            <div className="p-14 text-center">

              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading activities...
              </p>

            </div>
          ) : filteredActivities.length ===
            0 ? (

            <div className="p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No activities found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "No activities match your search."
                  : "No activities have been assigned yet."}
              </p>

              {!search &&
                statusFilter ===
                  "All" && (
                  <button
                    type="button"
                    onClick={
                      openCreateForm
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white"
                  >
                    <Plus className="h-4 w-4" />

                    Assign First Activity
                  </button>
                )}

            </div>
          ) : (

            <div className="divide-y divide-slate-100">

              {filteredActivities.map(
                (activity) => {
                  const volunteer =
                    getVolunteer(
                      activity.assigned_to
                    );

                  return (
                    <article
                      key={
                        activity.id
                      }
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >

                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                        {/* LEFT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-lg font-bold text-gray-900">
                              {
                                activity.title
                              }
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClass(
                                activity.status
                              )}`}
                            >
                              {
                                activity.status
                              }
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${getPriorityClass(
                                activity.priority
                              )}`}
                            >
                              {
                                activity.priority
                              }
                            </span>

                          </div>

                          {activity.description && (
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                              {
                                activity.description
                              }
                            </p>
                          )}

                          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="flex items-center gap-2 text-sm text-gray-600">

                              <Activity className="h-4 w-4 text-gray-400" />

                              <span>
                                {
                                  activity.activity_type
                                }
                              </span>

                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">

                              <User className="h-4 w-4 text-gray-400" />

                              <span className="truncate">
                                {
                                  volunteer?.full_name ||
                                  "Assigned user"
                                }
                              </span>

                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">

                              <Clock className="h-4 w-4 text-gray-400" />

                              <span>
                                {formatDate(
                                  activity.due_date
                                )}
                              </span>

                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">

                              <span>
                                Created{" "}
                                {formatDate(
                                  activity.created_at
                                )}
                              </span>

                            </div>

                          </div>

                          {activity.response && (
                            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

                              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                                Volunteer Response
                              </p>

                              <p className="mt-1 text-sm leading-6 text-blue-900">
                                {
                                  activity.response
                                }
                              </p>

                            </div>
                          )}

                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap gap-2 xl:w-[330px] xl:justify-end">

                          {activity.status !==
                            "Completed" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  activity,
                                  "Completed"
                                )
                              }
                              disabled={
                                updatingId ===
                                activity.id
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              {updatingId ===
                              activity.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}

                              Complete
                            </button>
                          )}

                          {activity.status ===
                            "Pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(
                                  activity,
                                  "In Progress"
                                )
                              }
                              disabled={
                                updatingId ===
                                activity.id
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                              <Clock className="h-4 w-4" />

                              Start
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                activity
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-slate-50"
                          >
                            <Edit3 className="h-4 w-4" />

                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                activity
                              )
                            }
                            disabled={
                              deletingId ===
                              activity.id
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
                          >
                            {deletingId ===
                            activity.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}

                            Delete
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =================================================
            CREATE / EDIT MODAL
        ================================================= */}

        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              {/* MODAL HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#0F2B7B]">
                    {editingActivity ? (
                      <Edit3 className="h-5 w-5" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-[#0F2B7B]">
                      {editingActivity
                        ? "Edit Activity"
                        : "Assign Activity"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Assign work or reminders to a volunteer.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                  className="rounded-xl p-2 text-gray-500 hover:bg-slate-100"
                >
                  <X className="h-6 w-6" />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-6 p-6"
              >

                {/* TITLE */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Activity Title
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={(event) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Example: Update volunteer profile"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Instructions / Description
                  </label>

                  <textarea
                    rows={4}
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Explain what needs to be done..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* TYPE */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Activity Type
                    </label>

                    <select
                      value={
                        form.activity_type
                      }
                      onChange={(event) =>
                        updateForm(
                          "activity_type",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    >
                      {activityTypes.map(
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

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Priority
                    </label>

                    <select
                      value={
                        form.priority
                      }
                      onChange={(event) =>
                        updateForm(
                          "priority",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    >
                      {priorityOptions.map(
                        (priority) => (
                          <option
                            key={
                              priority
                            }
                            value={
                              priority
                            }
                          >
                            {priority}
                          </option>
                        )
                      )}
                    </select>

                  </div>

                </div>

                {/* ASSIGN USER */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Assign To
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  {usersLoading ? (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">

                      <Loader2 className="h-5 w-5 animate-spin text-[#0F2B7B]" />

                      <span className="text-sm text-gray-500">
                        Loading volunteers...
                      </span>

                    </div>
                  ) : volunteers.length ===
                    0 ? (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">

                      <div className="flex gap-3">

                        <Users className="h-5 w-5 shrink-0 text-orange-600" />

                        <div>

                          <p className="font-bold text-orange-800">
                            No assignable volunteers found
                          </p>

                          <p className="mt-1 text-sm text-orange-700">
                            Volunteers must have an
                            `auth_user_id` before they can
                            receive activities.
                          </p>

                        </div>

                      </div>

                    </div>
                  ) : (

                    <select
                      value={
                        form.assigned_to
                      }
                      onChange={(event) =>
                        updateForm(
                          "assigned_to",
                          event.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    >

                      <option value="">
                        Select volunteer
                      </option>

                      {volunteers.map(
                        (volunteer) => (
                          <option
                            key={
                              volunteer.auth_user_id!
                            }
                            value={
                              volunteer.auth_user_id!
                            }
                          >
                            {
                              volunteer.full_name
                            }{" "}
                            —{" "}
                            {
                              volunteer.college_email
                            }
                          </option>
                        )
                      )}

                    </select>

                  )}

                  {form.assigned_to && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-4">

                      {(() => {
                        const volunteer =
                          volunteers.find(
                            (item) =>
                              item.auth_user_id ===
                              form.assigned_to
                          );

                        if (!volunteer) {
                          return null;
                        }

                        return (
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#0F2B7B]">
                              <User className="h-5 w-5" />
                            </div>

                            <div>

                              <p className="font-bold text-gray-800">
                                {
                                  volunteer.full_name
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                {
                                  volunteer.department
                                }{" "}
                                •{" "}
                                {
                                  volunteer.year
                                }{" "}
                                • Roll No.{" "}
                                {
                                  volunteer.roll_number
                                }
                              </p>

                            </div>

                          </div>
                        );
                      })()}

                    </div>
                  )}

                </div>

                {/* DUE DATE */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Due Date
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      form.due_date
                    }
                    onChange={(event) =>
                      updateForm(
                        "due_date",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* INFO */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                  <div className="flex gap-3">

                    <Eye className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                    <div>

                      <p className="font-bold text-blue-900">
                        How Activities work
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-800">
                        The assigned volunteer will see
                        this activity in their profile.
                        They can update the activity status
                        and provide a response.
                      </p>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      usersLoading ||
                      volunteers.length ===
                        0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 text-sm font-bold text-white hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                      ? "Saving..."
                      : editingActivity
                      ? "Save Changes"
                      : "Assign Activity"}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </AdminDashboardLayout>
  );
}