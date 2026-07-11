import {
  CalendarPlus,
  UserCog,
  ImagePlus,
  Megaphone,
  FilePlus,
  BarChart3,
} from "lucide-react";

const actions = [
  {
    title: "Create Event",
    icon: CalendarPlus,
  },
  {
    title: "Assign Coordinator",
    icon: UserCog,
  },
  {
    title: "Upload Gallery",
    icon: ImagePlus,
  },
  {
    title: "Announcement",
    icon: Megaphone,
  },
  {
    title: "Upload Documents",
    icon: FilePlus,
  },
  {
    title: "Generate Report",
    icon: BarChart3,
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-2xl font-bold">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {actions.map((action) => {

          const Icon = action.icon;

          return (

            <button
              key={action.title}
              className="rounded-2xl border p-5 transition hover:bg-[#0F2B7B] hover:text-white"
            >

              <Icon className="mx-auto mb-3" size={30} />

              {action.title}

            </button>

          );

        })}

      </div>

    </section>
  );
}