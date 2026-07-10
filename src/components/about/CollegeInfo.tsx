import { Building2 } from "lucide-react";

export default function CollegeInfo() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-7xl px-6 text-center">

        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#0F2B7B] text-white">

          <Building2 size={36} />

        </div>

        <h2 className="text-4xl font-bold text-[#0F2B7B]">

          Aurora Degree & PG College NSS Unit

        </h2>

        <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 text-gray-600">

          The NSS Unit of Aurora Degree & PG College actively organizes
          environmental drives, health awareness programmes, blood donation
          camps, social outreach initiatives, cleanliness campaigns and
          leadership development activities, inspiring students to become
          responsible citizens dedicated to serving society.

        </p>

      </div>

    </section>
  );
}