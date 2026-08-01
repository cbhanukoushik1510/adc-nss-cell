import { Users } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-md">

      <Users size={70} className="text-gray-300" />

      <h2 className="mt-6 text-2xl font-bold text-[#0F2B7B]">
        No Volunteers Found
      </h2>

      <p className="mt-2 text-gray-500">
        Try changing your search or register a new volunteer.
      </p>

    </div>
  );
}