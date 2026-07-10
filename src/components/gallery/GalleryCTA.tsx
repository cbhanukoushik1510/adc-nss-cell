import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GalleryCTA() {
  return (
    <section className="bg-[#0F2B7B] py-20 text-white">

      <div className="mx-auto max-w-5xl px-6 text-center">

        <span className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-bold text-[#0F2B7B]">

          Join Aurora NSS

        </span>

        <h2 className="mt-8 text-5xl font-bold">

          Become Part of Our Next Story

        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">

          Every NSS activity creates unforgettable memories. Join our
          volunteer family and contribute to meaningful community service.

        </p>

        <Link
          href="/join"
          className="mt-10 inline-flex items-center gap-3 rounded-xl bg-yellow-400 px-8 py-4 text-lg font-bold text-[#0F2B7B] transition hover:bg-yellow-300"
        >
          Join Us in Making a Difference

          <ArrowRight size={20} />

        </Link>

      </div>

    </section>
  );
}