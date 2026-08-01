"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
const navLinks = [
  { name: "Home", href: "/" },
  { name: "About NSS", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Volunteers", href: "/volunteers" },
  { name: "Leadership", href: "/leadership" },
  { name: "Documents", href: "/documents" },
  { name: "Achievements", href: "/achievements" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm relative">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-18 sm:px-6 lg:h-20">

        {/* Left */}
        <Link href="/" className="flex items-center gap-3">

  <Image
    src="/logos/aurora-logo.png"
    alt="Aurora Logo"
    width={50}
    height={50}
    className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16"
  />

  <div className="leading-tight">

    <h1 className="text-[13px] font-bold text-[#0E2A72] sm:text-lg lg:text-xl">
      Aurora's Degree & PG College
    </h1>

    <p className="text-[10px] text-gray-500 sm:text-xs lg:text-sm">
      NSS Cell • Affiliated to Osmania University
    </p>

  </div>

</Link>

        {/* Center */}
        <nav className="hidden lg:flex items-center gap-8">

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-medium text-gray-700 hover:text-blue-700 transition"
            >
              {link.name}
            </Link>
          ))}

        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
<Link
              href="/login"
              className="text-[#0F2B7B] hover:underline"
            >
          <Button className="hidden rounded-xl bg-[#0F2B7B] px-6 md:flex">
            Login
          </Button>
</Link>
          <button
  onClick={() => setIsOpen(!isOpen)}
  className="rounded-lg p-2 lg:hidden"
>
  <Menu size={28} />
</button>

        </div>

      </div>
      {isOpen && (
  <div className="absolute left-0 top-full z-50 w-full border-t bg-white shadow-xl lg:hidden">
    <nav className="flex flex-col p-4">

      {navLinks.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          onClick={() => setIsOpen(false)}
          className="border-b border-slate-200 py-4 text-base font-medium text-gray-700 transition hover:text-[#0F2B7B]"
        >
          {link.name}
        </Link>
      ))}

      <Link
        href="/login"
        onClick={() => setIsOpen(false)}
        className="mt-5 rounded-xl bg-[#0F2B7B] py-3 text-center font-semibold text-white transition hover:bg-[#173b9d]"
      >
        Login
      </Link>

    </nav>
  </div>
)}
    </header>
  );
}