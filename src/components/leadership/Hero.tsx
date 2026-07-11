import { Award } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-[#0F2B7B] to-[#1E40AF] py-24 text-white">

      <div className="mx-auto max-w-7xl px-6 text-center">

        <Award
          size={70}
          className="mx-auto mb-6"
        />

        <h1 className="text-5xl font-bold">

          Hall of Leadership

        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-xl text-blue-100">

          Honouring every leader who dedicated
          their time, passion and service to the
          National Service Scheme at
          Aurora Degree & PG College.

        </p>

      </div>

    </section>
  );
}