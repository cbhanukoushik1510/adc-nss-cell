const activities = [
  "Attendance uploaded successfully.",
  "Blood Donation Camp created.",
  "Gallery updated with 32 photos.",
  "Documentation report submitted.",
  "Announcement published.",
];

export default function RecentActivity() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-2xl font-bold">
        Recent Activities
      </h2>

      <div className="space-y-4">

        {activities.map((activity) => (

          <div
            key={activity}
            className="rounded-xl border-l-4 border-[#0F2B7B] bg-slate-50 p-4"
          >
            {activity}
          </div>

        ))}

      </div>

    </section>
  );
}