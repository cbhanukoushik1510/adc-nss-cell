import { todaysTasks } from "@/data/tasks";
import {
  CircleAlert,
  Clock3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const priorityColor = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

export default function TodaysTasks() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-[#0F2B7B]">
            Today's Tasks
          </h2>

          <p className="text-gray-500">
            Complete your pending activities.
          </p>

        </div>

        <span className="rounded-full bg-[#0F2B7B] px-4 py-2 text-sm font-semibold text-white">
          {todaysTasks.length} Pending
        </span>

      </div>

      <div className="space-y-5">

        {todaysTasks.map((task) => (

          <div
            key={task.id}
            className="rounded-2xl border p-5 transition hover:border-[#0F2B7B] hover:shadow-lg"
          >

            <div className="flex items-center justify-between">

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  priorityColor[
                    task.priority as keyof typeof priorityColor
                  ]
                }`}
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

            <div className="mt-3 flex items-center gap-2 text-gray-600">

              <Clock3 size={18} />

              {task.due}

            </div>

            <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#1E40AF]">

              {task.action}

              <ArrowRight size={18} />

            </button>

          </div>

        ))}

      </div>

    </section>
  );
}