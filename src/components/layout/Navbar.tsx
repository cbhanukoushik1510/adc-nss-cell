"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1500px] items-center px-4 sm:px-6 lg:min-h-[76px] lg:px-8">

        {/* =====================================================
            LOGO + COLLEGE NAME
        ====================================================== */}
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center sm:h-12 sm:w-12 lg:h-14 lg:w-14">
            <Image
              src="/logos/aurora-logo.png"
              alt="Aurora's Degree & PG College Logo"
              fill
              priority
              sizes="56px"
              className="object-contain"
            />
          </div>

          <div className="min-w-0 leading-tight">
            <h1 className="whitespace-nowrap text-[13px] font-bold tracking-tight text-[#0E2A72] sm:text-[16px] lg:text-[18px] xl:text-[19px]">
              Aurora's Degree & PG College
            </h1>

            <p className="mt-0.5 whitespace-nowrap text-[9px] text-gray-500 sm:text-[10px] lg:text-[11px] xl:text-xs">
              NSS Cell • Affiliated to Osmania University
            </p>
          </div>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}
        <nav className="ml-auto hidden items-center lg:flex">
          <div className="flex items-center gap-5 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="whitespace-nowrap rounded-lg px-1.5 py-2 text-[13px] font-medium text-gray-700 transition-colors hover:text-[#0F2B7B] xl:text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* =====================================================
            LOGIN + MOBILE MENU
        ====================================================== */}
        <div className="ml-4 flex shrink-0 items-center gap-2 sm:ml-5 lg:ml-5">
          {/* Desktop Login */}
          <Link href="/login" className="hidden lg:block">
            <Button
              type="button"
              className="h-10 rounded-full bg-[#0F2B7B] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173B9D]"
            >
              Login
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0F2B7B] transition hover:bg-blue-50 lg:hidden"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white shadow-lg lg:hidden">
          <nav className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6">
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="whitespace-nowrap border-b border-slate-100 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-slate-50 hover:text-[#0F2B7B]"
                >
                  {link.name}
                </Link>
              ))}

              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="mt-4 flex h-11 items-center justify-center rounded-xl bg-[#0F2B7B] text-sm font-semibold text-white transition hover:bg-[#173B9D]"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}