import { Megaphone } from "lucide-react";

const notices = [
  {
    title: "NSS Orientation Programme",
    date: "20 July 2026",
    type: "Notice",
  },
  {
    title: "Tree Plantation Registration Open",
    date: "25 July 2026",
    type: "Registration",
  },
  {
    title: "Blood Donation Camp",
    date: "28 July 2026",
    type: "Event",
  },
  {
    title: "Volunteer Meeting",
    date: "Every Friday • 4:00 PM",
    type: "Meeting",
  },
];

export default function LatestUpdates() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition">

     <h2 className="text-2xl font-bold text-[#0F2B7B]">
  Notices & Announcements
</h2>

      <div className="space-y-6">

        {notices.map((item, index) => (
          <div key={index} className="flex gap-4">

            <div className="flex items-start justify-between border-b py-4">
  <div>
    <h3 className="font-semibold text-[#0F2B7B]">
      {item.title}
    </h3>

    <p className="text-sm text-gray-500">
      {item.date}
    </p>
  </div>

  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
    {item.type}
  </span>
</div>
          </div>
        ))}

      </div>

    </div>
  );
}