import {
  Tent,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";

export default function SpecialCamp() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            NSS Special Camp
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Our annual special camps provide immersive opportunities for
            volunteers to serve communities and develop leadership skills.
          </p>

        </div>

        <div className="rounded-3xl bg-white p-10 shadow-xl">

          <div className="grid gap-10 lg:grid-cols-2">

            <div className="flex h-80 items-center justify-center rounded-3xl bg-[#0F2B7B] text-8xl">
              🏕️
            </div>

            <div>

              <div className="mb-6 flex items-center gap-3">

                <Tent className="text-[#0F2B7B]" />

                <h3 className="text-3xl font-bold text-[#0F2B7B]">
                  Annual Special Camp
                </h3>

              </div>

              <p className="leading-8 text-gray-600">
                NSS Special Camps are designed to strengthen community
                engagement through health awareness programmes,
                environmental initiatives, village development,
                cleanliness campaigns and educational outreach.
              </p>

              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">
                  <CalendarDays size={20} />
                  Every Academic Year
                </div>

                <div className="flex items-center gap-3">
                  <MapPin size={20} />
                  Community & Rural Areas
                </div>

                <div className="flex items-center gap-3">
                  <Users size={20} />
                  Open to Registered NSS Volunteers
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}