import Image from "next/image";
import { Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between rounded-2xl bg-white p-5 shadow">

      <div>

        <h1 className="text-3xl font-bold text-[#0F2B7B]">
          Welcome Back 👋
        </h1>

        <p className="text-gray-500">
          Aurora NSS Volunteer Dashboard
        </p>

      </div>

      <div className="flex items-center gap-5">

        <Bell className="text-gray-500" />

        <Image
          src="/logos/aurora-logo.png"
          alt="Profile"
          width={50}
          height={50}
          className="rounded-full bg-white p-1 shadow"
        />

      </div>

    </header>
  );
}