import {
  CalendarCheck2,
  CalendarDays,
  MapPin,
} from "lucide-react";

const pastEvents = [
  {
    emoji: "🌳",
    title: "Tree Plantation Drive",
    date: "15 July 2026",
    location: "College Campus",
    description:
      "Successfully planted more than 200 saplings with the support of NSS volunteers.",
  },
  {
    emoji: "🩸",
    title: "Blood Donation Camp",
    date: "28 June 2026",
    location: "Seminar Hall",
    description:
      "Organized a blood donation camp in collaboration with a local hospital.",
  },
  {
    emoji: "🧹",
    title: "Swachh Bharat Campaign",
    date: "05 June 2026",
    location: "RTC X Road",
    description:
      "Conducted a cleanliness drive to spread awareness about public hygiene.",
  },
  {
    emoji: "🌍",
    title: "World Environment Day",
    date: "05 June 2026",
    location: "College Campus",
    description:
      "Awareness rally and plantation activities to promote environmental conservation.",
  },
  {
    emoji: "🩺",
    title: "Health Awareness Camp",
    date: "12 May 2026",
    location: "Community Hall",
    description:
      "Free health check-up and awareness programme for local residents.",
  },
  {
    emoji: "📢",
    title: "Anti-Drug Awareness Rally",
    date: "20 April 2026",
    location: "Hyderabad",
    description:
      "Students conducted an awareness rally encouraging a drug-free society.",
  },
];

export default function PastEvents() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Past Events
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Take a look at some of our successful NSS activities and community
            service programmes.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {pastEvents.map((event, index) => (

            <div
              key={index}
              className="overflow-hidden rounded-3xl border bg-slate-50 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >

              {/* Image */}

              <div className="flex h-56 items-center justify-center bg-[#0F2B7B] text-7xl">
                {event.emoji}
              </div>

              {/* Content */}

              <div className="p-8">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  <CalendarCheck2 size={16} />
                  Completed
                </div>

                <h3 className="text-2xl font-bold text-[#0F2B7B]">
                  {event.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  {event.description}
                </p>

                <div className="mt-6 space-y-3">

                  <div className="flex items-center gap-3 text-gray-700">
                    <CalendarDays size={18} />
                    {event.date}
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} />
                    {event.location}
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}