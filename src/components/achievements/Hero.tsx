import { Trophy } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#0F2B7B] via-[#1746A2] to-[#2563EB] py-12 text-white md:py-14">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:30px_30px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 text-center md:px-6">

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 md:h-20 md:w-20">
          <Trophy size={32} className="md:hidden" />
          <Trophy size={40} className="hidden md:block" />
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl md:mt-6 md:text-5xl">
          Achievements
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-blue-100 sm:text-base md:mt-5 md:text-lg md:leading-7">
          Celebrating the milestones, awards, impactful programmes and
          contributions of Aurora Degree & PG College NSS Cell.
        </p>

      </div>
    </section>
  );
}