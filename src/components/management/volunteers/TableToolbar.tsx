import { Download, FileSpreadsheet } from "lucide-react";

export default function TableToolbar() {
  return (
    <div className="flex flex-col gap-4 border-b bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">

      {/* Left Side */}

      <div className="flex items-center gap-3">

        <span className="text-sm text-gray-600">
          Show
        </span>

        <select className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#0F2B7B]">
          <option>10</option>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>

        <span className="text-sm text-gray-600">
          entries
        </span>

      </div>

      {/* Right Side */}

      <div className="flex gap-3">

        <button className="flex items-center gap-2 rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-600 hover:text-white">

          <FileSpreadsheet size={18} />

          Export Excel

        </button>

        <button className="flex items-center gap-2 rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-600 hover:text-white">

          <Download size={18} />

          Export PDF

        </button>

      </div>

    </div>
  );
}