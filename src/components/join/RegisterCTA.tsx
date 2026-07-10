import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RegisterCTA() {
  return (
    <section className="bg-[#0F2B7B] py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">

        <span className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-bold text-[#0F2B7B]">
          Join Aurora NSS
        </span>

        <h2 className="mt-8 text-4xl font-bold text-white md:text-5xl">
          Ready to Become an NSS Volunteer?
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">
          Take the first step toward serving society, developing leadership
          skills, and becoming part of a passionate volunteer community.
          Begin your NSS journey today.
        </p>

        <Link
          href="/join/register"
          className="mt-10 inline-flex items-center gap-3 rounded-xl bg-yellow-400 px-8 py-4 text-lg font-semibold text-[#0F2B7B] transition-all duration-300 hover:scale-105 hover:bg-yellow-300"
        >
          Register Now
          <ArrowRight size={20} />
        </Link>

      </div>
    </section>
  );
}