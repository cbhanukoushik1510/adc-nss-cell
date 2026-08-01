import { Search, Plus } from "lucide-react";

export default function VolunteerFilters() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-md">

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

        {/* Search & Filters */}
        <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

          {/* Search */}

          <div className="relative xl:col-span-2">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search volunteer..."
              className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-[#0F2B7B]"
            />

          </div>

          {/* Department */}

          <select className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#0F2B7B]">
            <option>All Departments</option>
            <option>BCA</option>
            <option>B.Com</option>
            <option>BBA</option>
            <option>BA</option>
            <option>B.Sc</option>
          </select>

          {/* Year */}

          <select className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#0F2B7B]">
            <option>All Years</option>
            <option>I Year</option>
            <option>II Year</option>
            <option>III Year</option>
          </select>

          {/* Unit */}

          <select className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#0F2B7B]">
            <option>All Units</option>
            <option>Unit 1</option>
            <option>Unit 2</option>
          </select>

        </div>

        {/* Add Button */}

        <button className="flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#183A9E]">

          <Plus size={18} />

          Add Volunteer

        </button>

      </div>

    </section>
  );
}