import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <Image
  src="/images/hero/hero-bg-v2.jpg"
  alt="Aurora College"
  fill
  priority
  className="object-cover object-center lg:object-[10%_90%]"
/>

      {/* Light Overlay */}
      <div className="absolute inset-0 bg-white/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 lg:-translate-y-12">
       <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">

            {/* Left Logo */}
            <div className="flex justify-center lg:col-span-2">
           <Image
  src="/logos/aurora-logo.png"
  alt="Aurora Logo"
  width={170}
  height={170}
  priority
  className="h-24 w-24 rounded-full object-contain sm:h-32 sm:w-32 lg:h-40 lg:w-40"
/>
            </div>

            {/* Center Content */}
<div className="flex flex-col items-center text-center lg:col-span-8">

  {/* Main Heading */}
  <h1 className="text-4xl font-black uppercase leading-tight tracking-tight text-[#0E2A72] sm:text-5xl md:text-6xl lg:text-8xl">
    ADC NSS CELL
  </h1>

  {/* Motto */}
  <div className="mt-5 flex items-center justify-center gap-3 sm:gap-6">

    <div className="hidden md:block h-[3px] w-28 bg-[#0E2A72]" />

    <h2 className="text-lg font-semibold tracking-[0.15em] text-[#0E2A72] sm:text-2xl md:text-3xl lg:text-4xl" >
      NOT ME, BUT YOU
    </h2>

    <div className="hidden md:block h-[3px] w-28 bg-[#0E2A72]" />

  </div>

  {/* Subtitle */}
  <p className="mt-6 max-w-3xl px-2 text-base font-medium text-gray-800 sm:text-lg md:text-xl lg:text-2xl">
    Inspiring Youth | Serving Society | Building a Better India
  </p>

  {/* Join Button */}
  <div className="mt-10 sm:mt-14 lg:mt-20">
    <Link
      href="/join"
      className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-[#0F2B7B] px-8 py-3 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#143a96] hover:shadow-2xl sm:w-auto sm:px-10 sm:py-4 sm:text-lg"
    >
      Join Us in Making a Difference
    </Link>
  </div>

</div>

            {/* Right Logo */}
            <div className="flex justify-center lg:col-span-2">
              <Image
  src="/logos/nss-logo.png"
  alt="NSS Logo"
  width={180}
  height={180}
  priority
  className="h-24 w-24 rounded-full object-contain sm:h-32 sm:w-32 lg:h-44 lg:w-44"
/>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}