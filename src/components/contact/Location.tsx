import { MapPinned } from "lucide-react";

export default function Location() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <MapPinned
            size={40}
            className="mx-auto mb-5 text-[#0F2B7B]"
          />

          <h2 className="text-4xl font-bold text-[#0F2B7B]">

            College Location

          </h2>

          <p className="mt-4 text-lg text-gray-600">

            Google Maps integration will be added here.

          </p>

        </div>

        <div className="mt-10 flex h-96 items-center justify-center rounded-3xl bg-slate-100">

          <div className="text-center">

            <div className="text-7xl">

              📍

            </div>

            <h3 className="mt-5 text-2xl font-bold text-[#0F2B7B]">

              Map Coming Soon

            </h3>

          </div>

        </div>

      </div>

    </section>
  );
}