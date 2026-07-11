import {
  CalendarDays,
  Users,
  ClipboardCheck,
  Bell,
} from "lucide-react";

export default function WelcomeBanner() {
  return (
    <section className="mt-6 rounded-3xl bg-gradient-to-r from-[#0F2B7B] to-[#1E40AF] p-8 text-white shadow-xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-blue-200 text-sm uppercase tracking-widest">
            ADC NSS Operations
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            NSS Command Center
          </h1>

          <p className="mt-3 max-w-2xl text-blue-100">
            Monitor volunteers, manage events, track coordinators,
            and oversee all NSS activities from one place.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <Users className="mb-2" />
            <p className="text-sm text-blue-100">Active Volunteers</p>
            <h3 className="text-3xl font-bold">248</h3>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <CalendarDays className="mb-2" />
            <p className="text-sm text-blue-100">Upcoming Events</p>
            <h3 className="text-3xl font-bold">12</h3>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <ClipboardCheck className="mb-2" />
            <p className="text-sm text-blue-100">Pending Tasks</p>
            <h3 className="text-3xl font-bold">6</h3>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <Bell className="mb-2" />
            <p className="text-sm text-blue-100">Announcements</p>
            <h3 className="text-3xl font-bold">3</h3>
          </div>

        </div>

      </div>

    </section>
  );
}