import { Bell } from "lucide-react";

const circulars = [
  "NSS Orientation Circular",
  "Blood Donation Camp Notice",
  "Tree Plantation Drive Notice",
  "Special Camp Circular",
  "Awareness Programme Notice",
];

export default function Circulars() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Official Circulars
          </h2>

        </div>

        <div className="space-y-6">

          {circulars.map((item) => (

            <div
              key={item}
              className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-md"
            >

              <div className="flex items-center gap-4">

                <Bell className="text-[#0F2B7B]" />

                <div>

                  <h3 className="font-bold text-[#0F2B7B]">

                    {item}

                  </h3>

                  <p className="text-gray-500">

                    PDF Available Soon

                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}