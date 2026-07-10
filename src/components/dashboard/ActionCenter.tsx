import {
  AlertCircle,
  UserCircle,
  Award,
  Bell,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    icon: AlertCircle,
    title: "Blood Donation Camp Tomorrow",
    description: "Register before today 5:00 PM.",
    color: "text-red-500",
    button: "View Event",
  },
  {
    icon: UserCircle,
    title: "Complete Your Profile",
    description: "Your profile is only 82% complete.",
    color: "text-yellow-500",
    button: "Complete",
  },
  {
    icon: Award,
    title: "Certificate Available",
    description: "Plantation Drive Certificate is ready.",
    color: "text-green-500",
    button: "Download",
  },
  {
    icon: Bell,
    title: "New Announcement",
    description: "Orientation meeting scheduled for Monday.",
    color: "text-blue-500",
    button: "Read",
  },
];

export default function ActionCenter() {
  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          🎯 Action Center
        </h2>

        <p className="mt-2 text-gray-600">
          Stay updated with your latest NSS activities and important tasks.
        </p>

      </div>

      <div className="space-y-5">

        {actions.map((item, index) => {

          const Icon = item.icon;

          return (

            <div
              key={index}
              className="flex flex-col justify-between gap-5 rounded-2xl border p-6 transition hover:border-[#0F2B7B] hover:shadow-lg lg:flex-row lg:items-center"
            >

              <div className="flex items-start gap-5">

                <div className={`${item.color} mt-1`}>
                  <Icon size={30} />
                </div>

                <div>

                  <h3 className="text-xl font-semibold text-[#0F2B7B]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {item.description}
                  </p>

                </div>

              </div>

              <button className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#1E40AF]">

                {item.button}

                <ArrowRight size={18} />

              </button>

            </div>

          );

        })}

      </div>

    </section>
  );
}