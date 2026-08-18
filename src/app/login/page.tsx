"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      /* --------------------------------
         1. Login with Supabase Auth
      -------------------------------- */

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError || !data.user) {
        setError("Invalid email or password.");
        return;
      }

      /* --------------------------------
         2. Check Admin
      -------------------------------- */

      const { data: adminUser, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

      if (adminError) {
        console.error("Admin check error:", adminError);

        await supabase.auth.signOut();

        setError(
          "Unable to verify your account. Please try again."
        );

        return;
      }

      /* --------------------------------
         3. ADMIN
      -------------------------------- */

      if (adminUser) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      /* --------------------------------
         4. Find Volunteer Profile
      -------------------------------- */

      const { data: volunteer, error: volunteerError } =
        await supabase
          .from("volunteers")
          .select("id, full_name, status")
          .eq("auth_user_id", data.user.id)
          .maybeSingle();

      if (volunteerError) {
        console.error(
          "Volunteer check error:",
          volunteerError
        );

        await supabase.auth.signOut();

        setError(
          "Unable to verify your volunteer application. Please try again."
        );

        return;
      }

      /* --------------------------------
         5. No Volunteer Profile
      -------------------------------- */

      if (!volunteer) {
        await supabase.auth.signOut();

        setError(
          "No volunteer application was found for this account. Please register first."
        );

        return;
      }

      /* --------------------------------
         6. REJECTED
      -------------------------------- */

      if (volunteer.status === "Rejected") {
        await supabase.auth.signOut();

        setError(
          "Your volunteer application was rejected. Please register again with valid details/data or contact the administrator."
        );

        return;
      }

      /* --------------------------------
         7. PENDING
      -------------------------------- */

      if (volunteer.status === "Pending") {
        await supabase.auth.signOut();

        setError(
          "Your volunteer application is still pending admin verification. Please wait until your application is approved."
        );

        return;
      }

      /* --------------------------------
         8. APPROVED
      -------------------------------- */

      if (volunteer.status === "Approved") {
        router.replace("/volunteer");
        router.refresh();
        return;
      }

      /* --------------------------------
         9. Unknown Status
      -------------------------------- */

      await supabase.auth.signOut();

      setError(
        "Your application status could not be verified. Please contact the administrator."
      );
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Something went wrong while logging in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F2B7B] to-[#1C4ED8] px-6">

      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* --------------------------------
            Left Side
        -------------------------------- */}

        <div className="hidden flex-col items-center justify-center bg-[#0F2B7B] p-12 text-white lg:flex">

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

          <p className="mt-4 text-center leading-8 text-blue-100">
            Welcome to the official NSS Volunteer Portal.
            Login to manage your attendance, events,
            certificates and volunteer activities.
          </p>

        </div>

        {/* --------------------------------
            Right Side
        -------------------------------- */}

        <div className="p-10 lg:p-14">

          {/* Logo */}

          <div className="flex justify-center">

            <Image
              src="/logos/aurora-logo.png"
              alt="Aurora Logo"
              width={90}
              height={90}
              className="rounded-full bg-white p-2 shadow-lg"
            />

          </div>

          {/* Heading */}

          <h2 className="mt-6 text-center text-3xl font-bold text-[#0F2B7B]">
            NSS Member Login
          </h2>

          <p className="mt-2 text-center text-gray-500">
            Aurora&apos;s Degree & PG College NSS Cell
          </p>

          {/* --------------------------------
              Error Message
          -------------------------------- */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* --------------------------------
              Login Form
          -------------------------------- */}

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-6"
          >

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                className="mt-2 w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Login Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0F2B7B] py-4 font-semibold text-white transition hover:bg-[#163A8C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* --------------------------------
              Back Home
          -------------------------------- */}

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