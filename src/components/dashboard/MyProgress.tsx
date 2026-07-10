import {
  CheckCircle2,
  Lock,
  Clock3,
} from "lucide-react";

import { progress } from "@/data/progress";

export default function MyProgress() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="text-2xl font-bold text-[#0F2B7B]">
        🎯 My NSS Journey
      </h2>

      <p className="mt-2 text-gray-600">
        Track your milestones and achievements as an NSS Volunteer.
      </p>

      <div className="mt-8 space-y-5">

        {progress.map((item) => {

          let Icon = Lock;
          let color = "text-gray-400";

          if (item.status === "completed") {
            Icon = CheckCircle2;
            color = "text-green-600";
          }

          if (item.status === "in-progress") {
            Icon = Clock3;
            color = "text-yellow-500";
          }

          return (

            <div
              key={item.title}
              className="flex items-center justify-between border-b pb-4 last:border-none"
            >

              <div className="flex items-center gap-4">

                <Icon className={color} size={24} />

                <div>

                  <h3 className="font-semibold text-[#0F2B7B]">
                    {item.title}
                  </h3>

                  {item.progress && (
                    <p className="text-sm text-gray-500">
                      {item.progress}
                    </p>
                  )}

                </div>

              </div>

            </div>

          );

        })}

      </div>

      <div className="mt-8">

        <div className="mb-2 flex justify-between">

          <span className="font-medium">
            Overall Progress
          </span>

          <span className="font-bold">
            72%
          </span>

        </div>

        <div className="h-3 rounded-full bg-gray-200">

          <div className="h-3 w-[72%] rounded-full bg-[#0F2B7B]" />

        </div>

      </div>

    </section>
  );
}