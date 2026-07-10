"use client";

import { ArrowDown } from "lucide-react";
import Link from "next/link";

export default function Hero() {
 

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#0F2B7B] via-[#1746A2] to-[#2563EB] text-white">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:30px_30px]" />
      </div>

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col items-center justify-center px-6 text-center">

        <div className="mb-6 text-7xl">
          🤝
        </div>

        <p className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-semibold backdrop-blur">
          National Service Scheme • Aurora's Degree & PG College
        </p>

        <h1 className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl">
          Join Us in
          <br />
          <span className="text-yellow-300">
            Making a Difference
          </span>
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">
          Become a proud member of the NSS Cell and contribute towards
          building a better society through community service, leadership,
          environmental initiatives, and social responsibility.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">

  <Link
    href="/join/register"
    className="inline-flex h-14 items-center justify-center rounded-xl bg-yellow-400 px-8 text-lg font-bold text-[#0F2B7B] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-300"
  >
    Register Now
  </Link>

  <a
    href="#why-join"
    className="inline-flex h-14 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
  >
    Learn More
    <ArrowDown className="ml-2 h-5 w-5" />
  </a>

</div>
        <div className="mt-16">

          <h2 className="text-3xl font-bold italic text-yellow-300">
            "Not Me, But You"
          </h2>

          <p className="mt-2 text-blue-200">
            The Motto of the National Service Scheme
          </p>

        </div>

      </div>
    </section>
  );
}