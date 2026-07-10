"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About NSS", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  { name: "Volunteers", href: "/volunteers" },
  { name: "Documents", href: "/documents" },
  { name: "Achievements", href: "/achievements" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">

        {/* Left */}
        <Link href="/" className="flex items-center gap-4">

          <Image
            src="/logos/aurora-logo.png"
            alt="Aurora Logo"
            width={60}
            height={60}
          />

          <div>
            <h1 className="text-xl font-bold text-[#0E2A72]">
              Aurora's Degree & PG College
            </h1>

            <p className="text-sm text-gray-500">
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
          <Button className="hidden md:flex">
            Login
          </Button>
</Link>
          <button className="lg:hidden">
            <Menu />
          </button>

        </div>

      </div>
    </header>
  );
}