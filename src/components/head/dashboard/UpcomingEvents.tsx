const events = [
  "Blood Donation Camp",
  "Tree Plantation",
  "Awareness Rally",
  "Yoga Day",
];

export default function UpcomingEvents() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-2xl font-bold">
        Upcoming Events
      </h2>

      <div className="space-y-4">

        {events.map((event) => (

          <div
            key={event}
            className="rounded-xl bg-slate-50 p-4"
          >

            {event}

          </div>

        ))}

      </div>

    </section>
  );
}