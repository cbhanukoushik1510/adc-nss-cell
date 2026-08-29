"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  ListTodo,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Task = {
  id: string;

  title?: string | null;
  name?: string | null;

  description?: string | null;

  status?: string | null;
  priority?: string | null;

  due_date?: string | null;
  deadline?: string | null;

  assigned_to?: string | null;
  assigned_user_id?: string | null;
  assignee_id?: string | null;

  assigned_by?: string | null;
  created_by?: string | null;

  activity_id?: string | null;

  created_at?: string | null;
  updated_at?: string | null;

  [key: string]: unknown;
};

type Authority = {
  id: string;
  user_id?: string | null;
  full_name: string;
  role?: string | null;
  designation?: string | null;
  is_active?: boolean | null;
};

/* =========================================================
   HELPERS
========================================================= */

function taskTitle(task: Task) {
  return (
    task.title ||
    task.name ||
    "Untitled Work"
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

function normalize(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function statusLabel(status?: string | null) {
  const value = normalize(status);

  if (!value) return "Pending";

  if (
    value === "completed" ||
    value === "complete" ||
    value === "done"
  ) {
    return "Completed";
  }

  if (
    value === "in_progress" ||
    value === "in progress" ||
    value === "ongoing"
  ) {
    return "In Progress";
  }

  if (
    value === "pending" ||
    value === "assigned"
  ) {
    return "Pending";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "Cancelled";
  }

  return status || "Pending";
}

function statusClass(status?: string | null) {
  const value = normalize(status);

  if (
    value === "completed" ||
    value === "complete" ||
    value === "done"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    value === "in_progress" ||
    value === "in progress" ||
    value === "ongoing"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function priorityClass(priority?: string | null) {
  const value = normalize(priority);

  if (value === "high" || value === "urgent") {
    return "bg-red-50 text-red-700";
  }

  if (value === "medium" || value === "normal") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-gray-100 text-gray-600";
}

function initials(name?: string | null) {
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

export default function POAssignWorkPage() {
  const [tasks, setTasks] = useState<Task[]>(
    []
  );

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  const [assignees, setAssignees] =
    useState<Authority[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [showCreate, setShowCreate] =
    useState(false);

  /* =======================================================
     FORM
  ======================================================= */

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [priority, setPriority] =
    useState("medium");

  const [dueDate, setDueDate] =
    useState("");

  const [formError, setFormError] =
    useState("");

  /* =======================================================
     AUTHORITY
  ======================================================= */

  const loadAuthority =
    useCallback(async () => {
      const {
        data: { user },
        error: authError,
      } =
        await supabase.auth.getUser();

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

      const { data, error } =
        await supabase
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
            "Unable to load PO profile."
        );
      }

      if (!data) {
        throw new Error(
          "No active authority profile was found."
        );
      }

      setAuthority(
        data as Authority
      );

      return data as Authority;
    }, []);

  /* =======================================================
     LOAD TASKS
  ======================================================= */

  const loadTasks =
    useCallback(async () => {
      const { data, error } =
        await supabase
          .from("tasks")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        throw new Error(
          error.message ||
            "Unable to load assigned work."
        );
      }

      setTasks(
        (data || []) as Task[]
      );
    }, []);

  /* =======================================================
     LOAD ASSIGNEES
  ======================================================= */

  const loadAssignees =
    useCallback(async () => {
      const { data, error } =
        await supabase
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
        console.warn(
          "Unable to load authority members:",
          error
        );

        setAssignees([]);
        return;
      }

      /*
       * PO can assign work to operational
       * NSS authority members.
       *
       * Principal and VP are intentionally
       * excluded from the assignment list.
       */
      const operational =
        ((data || []) as Authority[]).filter(
          (person) => {
            const role =
              normalize(person.role);

            const designation =
              normalize(
                person.designation
              );

            return (
              role !== "principal" &&
              role !== "vice principal" &&
              designation !== "principal" &&
              designation !==
                "vice principal"
            );
          }
        );

      setAssignees(
        operational
      );
    }, []);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        await Promise.all([
          loadAuthority(),
          loadTasks(),
          loadAssignees(),
        ]);
      } catch (err) {
        console.error(
          "PO assign work error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assigned work."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      loadAuthority,
      loadTasks,
      loadAssignees,
    ]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     REALTIME
  ======================================================= */

  useEffect(() => {
    const channel =
      supabase
        .channel("po-assign-work")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
          },
          async () => {
            await loadTasks();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [loadTasks]);

  /* =======================================================
     ASSIGNEE FINDER
  ======================================================= */

  const findAssignee = (
    task: Task
  ) => {
    const id =
      task.assigned_to ||
      task.assigned_user_id ||
      task.assignee_id;

    if (!id) return null;

    return (
      assignees.find(
        (person) =>
          person.id === id ||
          person.user_id === id
      ) || null
    );
  };

  /* =======================================================
     FILTERED TASKS
  ======================================================= */

  const filteredTasks = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return tasks.filter((task) => {
      const taskName =
        taskTitle(task);

      const description =
        task.description || "";

      const person =
        findAssignee(task);

      const personName =
        person?.full_name || "";

      const matchesSearch =
        !query ||
        taskName
          .toLowerCase()
          .includes(query) ||
        description
          .toLowerCase()
          .includes(query) ||
        personName
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        normalize(task.status) ===
          normalize(statusFilter);

      const matchesPriority =
        priorityFilter === "all" ||
        normalize(task.priority) ===
          normalize(priorityFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
    assignees,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const pendingCount =
    tasks.filter((task) => {
      const value =
        normalize(task.status);

      return (
        !value ||
        value === "pending" ||
        value === "assigned"
      );
    }).length;

  const progressCount =
    tasks.filter((task) => {
      const value =
        normalize(task.status);

      return (
        value === "in_progress" ||
        value === "in progress" ||
        value === "ongoing"
      );
    }).length;

  const completedCount =
    tasks.filter((task) => {
      const value =
        normalize(task.status);

      return (
        value === "completed" ||
        value === "complete" ||
        value === "done"
      );
    }).length;

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      await Promise.all([
        loadTasks(),
        loadAssignees(),
      ]);
    } catch (err) {
      console.error(
        "PO work refresh error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     CREATE TASK
  ======================================================= */

  const createTask = async () => {
    setFormError("");

    if (!title.trim()) {
      setFormError(
        "Please enter a work title."
      );
      return;
    }

    if (!assignedTo) {
      setFormError(
        "Please select who this work should be assigned to."
      );
      return;
    }

    if (!authority?.id) {
      setFormError(
        "PO profile could not be verified."
      );
      return;
    }

    setSaving(true);

    try {
      /*
       * The common tasks structure is used here.
       * Only known fields are inserted.
       */

      const payload: Record<
        string,
        unknown
      > = {
        title: title.trim(),
        description:
          description.trim() || null,
        status: "pending",
        priority,
        due_date:
          dueDate || null,
        assigned_to: assignedTo,
        created_by: authority.id,
      };

      const { error } =
        await supabase
          .from("tasks")
          .insert(payload);

      if (error) {
        throw new Error(
          error.message
        );
      }

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setPriority("medium");
      setDueDate("");
      setFormError("");
      setShowCreate(false);

      await loadTasks();
    } catch (err) {
      console.error(
        "Create work error:",
        err
      );

      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to assign work."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (
    task: Task,
    nextStatus: string
  ) => {
    try {
      const { error } =
        await supabase
          .from("tasks")
          .update({
            status: nextStatus,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", task.id);

      if (error) {
        throw new Error(
          error.message
        );
      }

      await loadTasks();

      if (
        selectedTask &&
        selectedTask.id === task.id
      ) {
        setSelectedTask({
          ...task,
          status: nextStatus,
        });
      }
    } catch (err) {
      console.error(
        "Update task status error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update work status."
      );
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="w-full">
        <div className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
              <ListTodo size={23} />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw
                size={15}
                className="animate-spin"
              />
              Loading assigned work...
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

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
                  Unable to load Assign Work
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

  /* =======================================================
     MAIN
  ======================================================= */

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
                <ListTodo size={25} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F2B7B]">
                  NSS Operations
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Assign Work
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                  Assign and monitor operational
                  NSS work for Heads, Deputy Heads
                  and other authorized team members.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
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

              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setShowCreate(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0b225f]"
              >
                <Plus size={17} />
                Assign Work
              </button>
            </div>
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
          <WorkStat
            icon={<ListTodo size={19} />}
            label="Total Work"
            value={tasks.length}
          />

          <WorkStat
            icon={<Clock3 size={19} />}
            label="Pending"
            value={pendingCount}
          />

          <WorkStat
            icon={<RefreshCw size={19} />}
            label="In Progress"
            value={progressCount}
          />

          <WorkStat
            icon={<CheckCircle2 size={19} />}
            label="Completed"
            value={completedCount}
          />
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search assigned work..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-[#0F2B7B]/10"
              />
            </div>

            <div className="relative w-full xl:w-52">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
              >
                <option value="all">
                  All Status
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="in_progress">
                  In Progress
                </option>
                <option value="completed">
                  Completed
                </option>
                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <div className="relative w-full xl:w-52">
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(
                    e.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
              >
                <option value="all">
                  All Priority
                </option>
                <option value="high">
                  High
                </option>
                <option value="medium">
                  Medium
                </option>
                <option value="low">
                  Low
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            WORK LIST
        ================================================= */}

        <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Assigned Work
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {filteredTasks.length} work item
                  {filteredTasks.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  found
                </p>
              </div>
            </div>
          </div>

          {filteredTasks.length ===
          0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
                <ListTodo size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No work found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                Assign work to your NSS team and
                it will appear here for monitoring.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map(
                (task) => {
                  const person =
                    findAssignee(task);

                  return (
                    <div
                      key={task.id}
                      className="p-5 transition hover:bg-gray-50 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">
                              {taskTitle(task)}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                                task.status
                              )}`}
                            >
                              {statusLabel(
                                task.status
                              )}
                            </span>

                            {task.priority && (
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClass(
                                  task.priority
                                )}`}
                              >
                                {String(
                                  task.priority
                                ).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-600">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                              <UserRound
                                size={14}
                              />

                              {person?.full_name ||
                                "Not assigned"}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays
                                size={14}
                              />

                              Due:{" "}
                              {formatDate(
                                task.due_date ||
                                  task.deadline
                              )}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Clock3
                                size={14}
                              />

                              {formatDateTime(
                                task.created_at
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTask(
                              task
                            )
                          }
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2B7B] hover:bg-[#F5F7FC]"
                        >
                          <Eye size={16} />
                          View Work
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          CREATE WORK MODAL
      ===================================================== */}

      {showCreate && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0F2B7B]">
                  PO Operations
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                  Assign New Work
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create an operational task for
                  the NSS team.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-7">
              {formError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{formError}</span>
                </div>
              )}

              <Field
                label="Work Title"
                required
              >
                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Enter work title"
                  className="input-style"
                />
              </Field>

              <Field
                label="Instructions / Description"
              >
                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Enter the work details and instructions..."
                  className="input-style resize-none py-3"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Assign To"
                  required
                >
                  <div className="relative">
                    <select
                      value={assignedTo}
                      onChange={(e) =>
                        setAssignedTo(
                          e.target.value
                        )
                      }
                      className="input-style appearance-none pr-10"
                    >
                      <option value="">
                        Select team member
                      </option>

                      {assignees.map(
                        (person) => (
                          <option
                            key={
                              person.id
                            }
                            value={
                              person.id
                            }
                          >
                            {
                              person.full_name
                            }
                            {person.designation
                              ? ` — ${person.designation}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </Field>

                <Field label="Priority">
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(
                          e.target.value
                        )
                      }
                      className="input-style appearance-none pr-10"
                    >
                      <option value="high">
                        High
                      </option>

                      <option value="medium">
                        Medium
                      </option>

                      <option value="low">
                        Low
                      </option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Due Date">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }
                  className="input-style"
                />
              </Field>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                    <Users size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0F2B7B]">
                      Operational Assignment
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      Work can be assigned to
                      authorized NSS operational
                      team members. Principal and
                      Vice Principal are not included
                      as assignees.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                disabled={saving}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createTask}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0b225f] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Assign Work
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW WORK MODAL
      ===================================================== */}

      {selectedTask && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-5 sm:px-7">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0F2B7B]">
                  Assigned Work
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                  {taskTitle(
                    selectedTask
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTask(
                    null
                  )
                }
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-6 sm:px-7">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                    selectedTask.status
                  )}`}
                >
                  {statusLabel(
                    selectedTask.status
                  )}
                </span>

                {selectedTask.priority && (
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${priorityClass(
                      selectedTask.priority
                    )}`}
                  >
                    {String(
                      selectedTask.priority
                    ).toUpperCase()}
                  </span>
                )}
              </div>

              {selectedTask.description && (
                <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Instructions
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                    {
                      selectedTask.description
                    }
                  </p>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoBox
                  icon={
                    <UserRound size={17} />
                  }
                  label="Assigned To"
                  value={
                    findAssignee(
                      selectedTask
                    )?.full_name ||
                    "Not assigned"
                  }
                />

                <InfoBox
                  icon={
                    <CalendarDays
                      size={17}
                    />
                  }
                  label="Due Date"
                  value={formatDate(
                    selectedTask.due_date ||
                      selectedTask.deadline
                  )}
                />

                <InfoBox
                  icon={
                    <Clock3 size={17} />
                  }
                  label="Created"
                  value={formatDateTime(
                    selectedTask.created_at
                  )}
                />

                <InfoBox
                  icon={
                    <ListTodo size={17} />
                  }
                  label="Work ID"
                  value={
                    selectedTask.id
                      .slice(0, 8)
                      .toUpperCase()
                  }
                />
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Update Work Status
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  {[
                    {
                      value: "pending",
                      label: "Pending",
                    },
                    {
                      value: "in_progress",
                      label: "In Progress",
                    },
                    {
                      value: "completed",
                      label: "Completed",
                    },
                    {
                      value: "cancelled",
                      label: "Cancelled",
                    },
                  ].map(
                    (item) => (
                      <button
                        key={
                          item.value
                        }
                        type="button"
                        onClick={() =>
                          updateStatus(
                            selectedTask,
                            item.value
                          )
                        }
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                          normalize(
                            selectedTask.status
                          ) ===
                          normalize(
                            item.value
                          )
                            ? "border-[#0F2B7B] bg-[#F1F4FA] text-[#0F2B7B]"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 sm:p-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedTask(
                    null
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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
   STAT COMPONENT
========================================================= */

function WorkStat({
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
   FIELD
========================================================= */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
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

      <p className="mt-2 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}