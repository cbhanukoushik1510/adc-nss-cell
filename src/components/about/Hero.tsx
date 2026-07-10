import { BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#0F2B7B] via-[#1746A2] to-[#2563EB] py-24 text-white">

      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:30px_30px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 text-center">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
          <BookOpen size={48} />
        </div>

        <h1 className="mt-8 text-5xl font-extrabold md:text-6xl">
          About NSS
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">
          The National Service Scheme (NSS) is a flagship programme of the
          Ministry of Youth Affairs & Sports, Government of India, dedicated to
          developing students' personalities through community service.
        </p>

      </div>

    </section>
  );
}