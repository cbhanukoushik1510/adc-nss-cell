import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
export default function Footer() {
  return (
    <footer className="bg-[#08153F] text-white">

      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-4">

        {/* College */}
        <div>
          <Image
            src="/logos/aurora-logo.png"
            alt="Aurora Logo"
            width={70}
            height={70}
            className="rounded-full bg-white p-2"
          />

          <h3 className="mt-5 text-xl font-bold">
            Aurora's Degree & PG College
          </h3>

          <p className="mt-3 text-gray-300 leading-7">
            National Service Scheme (NSS)
            <br />
            Not Me, But You.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 text-lg font-semibold">
            Quick Links
          </h3>

          <div className="space-y-3">

            <Link href="/about" className="block hover:text-blue-300">
              About NSS
            </Link>

            <Link href="/events" className="block hover:text-blue-300">
              Events
            </Link>

            <Link href="/gallery" className="block hover:text-blue-300">
              Gallery
            </Link>

            <Link href="/contact" className="block hover:text-blue-300">
              Contact
            </Link>

          </div>
        </div>

        {/* Contact */}
        <div>

          <h3 className="mb-5 text-lg font-semibold">
            Contact
          </h3>

          <div className="space-y-4 text-gray-300">

            <div className="flex gap-3">
              <MapPin size={18} />
              <span>
                RTC X Roads,
                Hyderabad,
                Telangana
              </span>
            </div>

            <div className="flex gap-3">
              <Phone size={18} />
              <span>+91 XXXXX XXXXX</span>
            </div>

            <div className="flex gap-3">
              <Mail size={18} />
              <span>nss@adc.edu.in</span>
            </div>

          </div>

        </div>

        {/* Social */}
        <div>

          <h3 className="mb-5 text-lg font-semibold">
            Follow Us
          </h3>

          <a
            href="https://www.instagram.com/nss_aurora_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-110"
            style={{
              background:
                "linear-gradient(45deg,#F58529,#FEDA77,#DD2A7B,#8134AF,#515BD4)",
            }}
          >
            <FaInstagram size={28} color="white" />
          </a>

        </div>

      </div>

      <div className="border-t border-white/10 py-5 text-center text-sm text-gray-400">
        © 2026 Aurora's Degree & PG College NSS Cell. All Rights Reserved.
      </div>
<p className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-400">
  Designed & Developed by
  <a
    href="https://www.linkedin.com/in/cbhanukoushik15"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 font-semibold text-blue-300 transition hover:text-white"
  >
    <FaLinkedin className="text-[#0A66C2]" />
    C Bhanu Koushik
  </a>
</p>
    </footer>
  );
}