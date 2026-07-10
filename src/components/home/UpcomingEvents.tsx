import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  {
    date: "07 JUL",
    title: "Blood Cancer Awareness Programme",
    time: "9:30 AM",
    venue: "Seminar Hall",
  },
  {
    date: "15 JUL",
    title: "Tree Plantation Drive",
    time: "9:00 AM",
    venue: "College Campus",
  },
  {
    date: "22 JUL",
    title: "Swachh Bharat Abhiyan",
    time: "8:30 AM",
    venue: "College Campus",
  },
];

export default function UpcomingEvents() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          Upcoming Events
        </h2>

        <button className="text-sm font-semibold text-[#0F2B7B]">
          View All
        </button>
      </div>

      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">

            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-[#0F2B7B] text-white">
              <span className="text-xl font-bold">
                {event.date.split(" ")[0]}
              </span>

              <span className="text-xs">
                {event.date.split(" ")[1]}
              </span>
            </div>

            <div className="flex-1">

              <h3 className="font-semibold text-gray-800">
                {event.title}
              </h3>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">

                <div className="flex items-center gap-1">
                  <Clock3 size={14} />
                  {event.time}
                </div>

                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {event.venue}
                </div>

              </div>

            </div>

            <Button
              variant="outline"
              className="border-[#0F2B7B] text-[#0F2B7B]"
            >
              View
            </Button>

          </div>
        ))}
      </div>
    </div>
  );
}