import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0F2B7B] to-[#1C4ED8] flex items-center justify-center px-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* Left Side */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-[#0F2B7B] p-12 text-white">

          <Image
            src="/logos/nss-logo.png"
            alt="NSS Logo"
            width={160}
            height={160}
            className="rounded-full bg-white p-2"
          />

          <h1 className="mt-8 text-4xl font-bold">
            ADC NSS CELL
          </h1>

          <p className="mt-4 text-center text-blue-100 leading-8">
            Welcome to the official NSS Volunteer Portal.
            Login to manage your attendance, events,
            certificates and volunteer activities.
          </p>

        </div>

        {/* Right Side */}
        <div className="p-10 lg:p-14">

          <div className="flex justify-center">
            <Image
              src="/logos/aurora-logo.png"
              alt="Aurora Logo"
              width={90}
              height={90}
              className="rounded-full bg-white shadow-lg p-2"
            />
          </div>

          <h2 className="mt-6 text-center text-3xl font-bold text-[#0F2B7B]">
            NSS Member Login
          </h2>

          <p className="mt-2 text-center text-gray-500">
            Aurora's Degree & PG College NSS Cell
          </p>

          <form className="mt-8 space-y-6">

            <div>
              <label className="font-medium">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="mt-2 w-full rounded-xl border p-4 outline-none focus:border-[#0F2B7B]"
              />
            </div>

            <div>
              <label className="font-medium">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border p-4 outline-none focus:border-[#0F2B7B]"
              />
            </div>

            <button className="w-full rounded-xl bg-[#0F2B7B] py-4 font-semibold text-white hover:bg-[#163A8C]">
              Login
            </button>

          </form>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-[#0F2B7B] hover:underline"
            >
              ← Back to Home
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}