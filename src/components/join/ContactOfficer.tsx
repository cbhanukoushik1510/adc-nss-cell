import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

import { FaInstagram } from "react-icons/fa";

export default function ContactOfficer() {
  return (
    <section className="bg-slate-100 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Need Help?
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Have questions regarding NSS registration? Contact the Programme
            Officer or visit the NSS Cell during office hours.
          </p>

        </div>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Programme Officer Card */}

          <div className="rounded-3xl bg-white p-8 shadow-xl">

            <div className="flex items-center gap-5">

              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0F2B7B] text-white">

                <User size={50} />

              </div>

              <div>

                <h3 className="text-3xl font-bold text-[#0F2B7B]">
                  Programme Officer
                </h3>

                <p className="text-gray-500">
                  Aurora's Degree & PG College
                </p>

              </div>

            </div>

            <div className="mt-10 space-y-6">

              <div className="flex items-center gap-4">
                <Mail className="text-[#0F2B7B]" />
                <span>nss@adc.edu.in</span>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="text-[#0F2B7B]" />
                <span>+91 XXXXX XXXXX</span>
              </div>

              <div className="flex items-center gap-4">
                <MapPin className="text-[#0F2B7B]" />
                <span>
                  Aurora's Degree & PG College,
                  RTC X Roads, Hyderabad
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Clock className="text-[#0F2B7B]" />
                <span>
                  Monday - Saturday
                  <br />
                  10:00 AM - 4:00 PM
                </span>
              </div>

            </div>

          </div>

          {/* Help Card */}

          <div className="rounded-3xl bg-[#0F2B7B] p-8 text-white shadow-xl">

            <h3 className="text-3xl font-bold">
              Before You Register
            </h3>

            <div className="mt-8 space-y-5">

              <div className="rounded-xl bg-white/10 p-5">
                ✅ Ensure all details entered are correct.
              </div>

              <div className="rounded-xl bg-white/10 p-5">
                ✅ Use your college email for registration.
              </div>

              <div className="rounded-xl bg-white/10 p-5">
                ✅ Applications will be verified by the NSS Coordinator.
              </div>

              <div className="rounded-xl bg-white/10 p-5">
                ✅ Selected volunteers will receive login credentials after
                approval.
              </div>

            </div>

            <a
              href="https://www.instagram.com/nss_aurora_"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-[#0F2B7B] transition hover:scale-105"
            >
              <FaInstagram size={22} />
              Follow NSS on Instagram
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}