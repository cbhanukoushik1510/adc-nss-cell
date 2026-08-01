import { Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-[#0F2B7B] to-[#1E40AF] p-8 text-white shadow-lg">

      <div className="flex items-center gap-5">

        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <Users size={42} />
        </div>

        <div>

          <p className="text-sm uppercase tracking-[3px] text-blue-200">
            ADC NSS ERP
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Volunteer Management
          </h1>

          <p className="mt-3 max-w-3xl text-blue-100">
            Manage NSS volunteers, monitor registrations, organize unit-wise
            records, and maintain volunteer information from one place.
          </p>

        </div>

      </div>

    </section>
  );
}