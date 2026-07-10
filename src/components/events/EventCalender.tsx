import {
  Calendar,
  Flag,
  Heart,
  Trees,
  Users,
  Sparkles,
} from "lucide-react";

const activities = [
  {
    month: "January",
    event: "Republic Day Celebration",
    icon: Flag,
  },
  {
    month: "February",
    event: "Blood Donation Camp",
    icon: Heart,
  },
  {
    month: "March",
    event: "Women's Day Awareness Programme",
    icon: Users,
  },
  {
    month: "April",
    event: "Earth Day Campaign",
    icon: Trees,
  },
  {
    month: "May",
    event: "Health Awareness Camp",
    icon: Sparkles,
  },
  {
    month: "June",
    event: "World Environment Day",
    icon: Trees,
  },
  {
    month: "July",
    event: "Swachh Bharat Drive",
    icon: Sparkles,
  },
  {
    month: "August",
    event: "Independence Day Service Activities",
    icon: Flag,
  },
  {
    month: "September",
    event: "NSS Orientation Programme",
    icon: Users,
  },
  {
    month: "October",
    event: "Awareness Rally",
    icon: Heart,
  },
  {
    month: "November",
    event: "Tree Plantation Drive",
    icon: Trees,
  },
  {
    month: "December",
    event: "Special Winter Camp",
    icon: Calendar,
  },
];

export default function EventCalendar() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Annual NSS Activity Calendar
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            A glimpse of our major programmes and activities conducted
            throughout the academic year.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {activities.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">

                    <Icon size={28} />

                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-[#0F2B7B]">
                      {item.month}
                    </h3>

                    <p className="mt-1 text-gray-600">
                      {item.event}
                    </p>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </div>
    </section>
  );
}