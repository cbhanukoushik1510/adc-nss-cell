import { Mail, Phone, MapPin } from "lucide-react";

export default function ProgrammeOfficer() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-6xl px-6">

        <div className="rounded-3xl bg-[#0F2B7B] p-10 text-white shadow-xl">

          <div className="grid gap-10 lg:grid-cols-3">

            {/* Photo */}

            <div className="flex justify-center">

              <div className="flex h-52 w-52 items-center justify-center rounded-full bg-white text-7xl">

                👨‍🏫

              </div>

            </div>

            {/* Details */}

            <div className="lg:col-span-2">

              <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-[#0F2B7B]">

                Programme Officer

              </span>

              <h2 className="mt-6 text-4xl font-bold">

                Dr. Programme Officer Name

              </h2>

              <p className="mt-6 leading-8 text-blue-100">

                The Programme Officer plays a vital role in guiding NSS
                volunteers, organizing community outreach programmes,
                promoting social responsibility and ensuring the successful
                implementation of NSS activities.

              </p>

              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3">

                  <Mail size={20} />

                  officer@college.edu.in

                </div>

                <div className="flex items-center gap-3">

                  <Phone size={20} />

                  +91 XXXXX XXXXX

                </div>

                <div className="flex items-center gap-3">

                  <MapPin size={20} />

                  Aurora Degree & PG College

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}