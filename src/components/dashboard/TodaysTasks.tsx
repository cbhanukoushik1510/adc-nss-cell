"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  due_date: string;
  due_time: string | null;
  action: string;
}

const priorityColor = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

export default function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Unable to get logged-in user:", userError);
        return;
      }

      /* Find the logged-in volunteer */
      const { data: volunteer, error: volunteerError } =
        await supabase
          .from("volunteers")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

      if (volunteerError) {
        console.error(
          "Error loading volunteer:",
          volunteerError
        );
        return;
      }

      if (!volunteer) {
        console.error("Volunteer profile not found.");
        return;
      }

      /* Today's date */
      const today = new Date()
        .toISOString()
        .split("T")[0];

      /* Load tasks assigned to this volunteer */
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          description,
          priority,
          status,
          due_date,
          due_time,
          action
        `)
        .eq("assigned_to", volunteer.id)
        .eq("due_date", today)
        .neq("status", "Completed")
        .order("due_time", {
          ascending: true,
          nullsFirst: false,
        });

      if (error) {
        console.error(
          "Error loading tasks:",
          error
        );
        setTasks([]);
        return;
      }

      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error(
        "Today's tasks error:",
        error
      );

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) {
      return "Time not specified";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const completeTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "Completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    if (error) {
      console.error(
        "Error completing task:",
        error
      );
      return;
    }

    setTasks((current) =>
      current.filter(
        (task) => task.id !== taskId
      )
    );
  };

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-[#0F2B7B]">
          Today&apos;s Tasks
        </h2>

        <p className="mt-6 text-gray-500">
          Loading tasks...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-[#0F2B7B]">
            Today&apos;s Tasks
          </h2>

          <p className="text-gray-500">
            Complete your pending activities.
          </p>
        </div>

        <span className="rounded-full bg-[#0F2B7B] px-4 py-2 text-sm font-semibold text-white">
          {tasks.length} Pending
        </span>

      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">

          <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />

          <p className="mt-4 font-semibold text-gray-600">
            No pending tasks today
          </p>

          <p className="mt-1 text-sm text-gray-400">
            You&apos;re all caught up! 🎉
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {tasks.map((task) => {

            const priority =
              priorityColor[task.priority];

            return (
              <div
                key={task.id}
                className="rounded-2xl border p-5 transition hover:border-[#0F2B7B] hover:shadow-lg"
              >

                <div className="flex items-center justify-between gap-4">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${priority}`}
                  >
                    {task.priority}
                  </span>

                  <span className="text-sm text-gray-500">
                    {task.status}
                  </span>

                </div>

                <h3 className="mt-4 text-lg font-bold text-[#0F2B7B]">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="mt-2 text-gray-600">
                    {task.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2 text-gray-600">

                  <Clock3 size={18} />

                  {formatTime(task.due_time)}

                </div>

                <button
                  type="button"
                  onClick={() =>
                    completeTask(task.id)
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#1E40AF]"
                >
                  {task.action}

                  <ArrowRight size={18} />
                </button>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}