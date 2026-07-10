"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Phone,
  GraduationCap,
  IdCard,
  LogOut,
  Home,
  Pencil,
} from "lucide-react";

export default function ProfileCard() {
  const router = useRouter();

  const handleLogout = () => {
    // Later we'll add Supabase signOut() here
    router.push("/login");
  };

  const handleHome = () => {
    router.push("/");
  };

  const handleEditProfile = () => {
    alert("Edit Profile feature coming soon!");
  };

  return (
    <section className="mt-6 rounded-3xl bg-white p-8 shadow-lg">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <Image
            src="/logos/aurora-logo.png"
            alt="Volunteer"
            width={150}
            height={150}
            className="rounded-full border-4 border-blue-100 bg-white p-2 shadow-lg"
          />

          <h2 className="mt-4 text-2xl font-bold text-[#0F2B7B]">
            C Bhanu Koushik
          </h2>

          <p className="text-gray-500">NSS Volunteer</p>
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#0F2B7B]">
            Volunteer Information
          </h1>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <IdCard className="text-blue-700" />
              <div>
                <p className="text-sm text-gray-500">NSS ID</p>
                <p className="font-semibold">ADCNSS001</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <GraduationCap className="text-blue-700" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-semibold">BCA • III Year</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <Mail className="text-blue-700" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold">student@adc.edu.in</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <Phone className="text-blue-700" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold">+91 XXXXX XXXXX</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-2 rounded-lg bg-[#0F2B7B] px-6 py-3 text-white transition hover:bg-[#183A96]"
            >
              <Pencil size={18} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}