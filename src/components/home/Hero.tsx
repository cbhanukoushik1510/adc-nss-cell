import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="relative h-screen min-h-[750px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
  src="/images/hero/hero-bg-v2.jpg"
  alt="Aurora College"
  fill
  priority
  className="object-cover object-[10%_90%]"
/>

      {/* Light Overlay */}
      <div className="absolute inset-0 bg-white/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center -translate-y-12">
        <div className="max-w-7xl w-full px-10">

          <div className="grid grid-cols-12 items-center">

            {/* Left Logo */}
            <div className="col-span-2 flex justify-center">
           <Image
           src="/logos/aurora-logo.png"
           alt="Aurora Logo"
           width={170}
           height={170}
           priority
          className="rounded-full object-contain"
            />
            </div>

            {/* Center Content */}
<div className="col-span-8 flex flex-col items-center text-center">

  {/* Main Heading */}
  <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tight text-[#0E2A72]">
    ADC NSS CELL
  </h1>

  {/* Motto */}
  <div className="mt-6 flex items-center justify-center gap-6">

    <div className="hidden md:block h-[3px] w-28 bg-[#0E2A72]" />

    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[0.25em] text-[#0E2A72]">
      NOT ME, BUT YOU
    </h2>

    <div className="hidden md:block h-[3px] w-28 bg-[#0E2A72]" />

  </div>

  {/* Subtitle */}
  <p className="mt-8 max-w-3xl text-lg md:text-xl lg:text-2xl font-medium text-gray-800">
    Inspiring Youth | Serving Society | Building a Better India
  </p>

  {/* Join Button */}
  <div className="mt-20">
    <Link
      href="/join"
      className="inline-flex items-center justify-center rounded-xl bg-[#0F2B7B] px-10 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#143a96] hover:shadow-2xl"
    >
      Join Us in Making a Difference
    </Link>
  </div>

</div>

            {/* Right Logo */}
            <div className="col-span-2 flex justify-center">
              <Image
                src="/logos/nss-logo.png"
                alt="NSS Logo"
                width={180}
                height={180}
                priority
                className="rounded-full object-contain"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}