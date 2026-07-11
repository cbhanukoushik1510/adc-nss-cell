import {
  Users,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Megaphone,
  BarChart3,
} from "lucide-react";

const stats = [
  {
    title: "Volunteers",
    value: "248",
    icon: Users,
  },
  {
    title: "Events",
    value: "12",
    icon: CalendarDays,
  },
  {
    title: "Pending Tasks",
    value: "18",
    icon: ClipboardCheck,
  },
  {
    title: "Documentation",
    value: "6",
    icon: FileText,
  },
  {
    title: "Announcements",
    value: "3",
    icon: Megaphone,
  },
  {
    title: "Reports",
    value: "15",
    icon: BarChart3,
  },
];

export default function OverviewCards() {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

      {stats.map((item) => {

        const Icon = item.icon;

        return (

          <div
            key={item.title}
            className="rounded-3xl bg-white p-6 shadow-md"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#0F2B7B]">
                  {item.value}
                </h2>

              </div>

              <div className="rounded-2xl bg-blue-100 p-4">

                <Icon
                  size={30}
                  className="text-[#0F2B7B]"
                />

              </div>

            </div>

          </div>

        );

      })}

    </div>
  );
}