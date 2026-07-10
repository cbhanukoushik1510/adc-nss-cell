import { CheckCircle2 } from "lucide-react";

const activities = [
  "Participated in Tree Plantation Drive",
  "Attended Blood Donation Camp",
  "Completed 12 Service Hours",
  "Certificate Downloaded",
];

export default function RecentActivities() {
  return (
    <section className="mt-8 rounded-2xl bg-white p-8 shadow">

      <h2 className="text-3xl font-bold text-[#0F2B7B]">
        Recent Activities
      </h2>

      <div className="mt-6 space-y-5">

        {activities.map((item) => (

          <div
            key={item}
            className="flex items-center gap-3"
          >

            <CheckCircle2 className="text-green-500" />

            <span>{item}</span>

          </div>

        ))}

      </div>

    </section>
  );
}