import { Eye, Pencil } from "lucide-react";
import { Volunteer } from "@/types/volunteer";

interface Props {
  volunteer: Volunteer;
}

export default function VolunteerRow({ volunteer }: Props) {
  return (
    <tr className="border-b transition hover:bg-slate-50">

      {/* Volunteer */}
      <td className="px-6 py-4">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F2B7B] text-lg font-bold text-white">

            {volunteer.name.charAt(0)}

          </div>

          <div>

            <h3 className="font-semibold text-[#0F2B7B]">
              {volunteer.name}
            </h3>

            <p className="text-sm text-gray-500">
              {volunteer.email}
            </p>

          </div>

        </div>

      </td>

      {/* Roll No */}
      <td className="px-6 py-4">
        {volunteer.rollNo}
      </td>

      {/* Department */}
      <td className="px-6 py-4">
        {volunteer.department}
      </td>

      {/* Year */}
      <td className="px-6 py-4">
        {volunteer.year}
      </td>

      {/* Unit */}
      <td className="px-6 py-4">
        {volunteer.unit}
      </td>

      {/* Status */}
      <td className="px-6 py-4">

        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">

          {volunteer.status}

        </span>

      </td>

      {/* Actions */}
      <td className="px-6 py-4">

        <div className="flex justify-center gap-3">

          <button className="rounded-lg bg-blue-100 p-2 text-blue-700 transition hover:bg-blue-200">
            <Eye size={18} />
          </button>

          <button className="rounded-lg bg-yellow-100 p-2 text-yellow-700 transition hover:bg-yellow-200">
            <Pencil size={18} />
          </button>

        </div>

      </td>

    </tr>
  );
}