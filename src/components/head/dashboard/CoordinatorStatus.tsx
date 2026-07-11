const coordinators = [
  ["Attendance", "🟢 Active"],
  ["Documentation", "🟢 Active"],
  ["Social Media", "🟡 Pending"],
  ["Registration", "🟢 Active"],
  ["Event", "🟢 Active"],
  ["Stream", "🟢 Active"],
];

export default function CoordinatorStatus() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-2xl font-bold">
        Coordinator Status
      </h2>

      <div className="space-y-4">

        {coordinators.map(([name, status]) => (

          <div
            key={name}
            className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
          >

            <span>{name}</span>

            <span>{status}</span>

          </div>

        ))}

      </div>

    </section>
  );
}