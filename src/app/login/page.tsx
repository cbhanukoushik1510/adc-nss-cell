"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
  e: FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    /* =====================================================
       1. LOGIN WITH SUPABASE AUTH
    ===================================================== */

    const {
      data,
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (loginError || !data.user) {
      setError("Invalid email or password.");
      return;
    }

    const userId = data.user.id;

    /* =====================================================
       2. CHECK ADMIN
    ===================================================== */

    const {
      data: adminUser,
      error: adminError,
    } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminError) {
      console.error(
        "Admin check error:",
        adminError
      );

      await supabase.auth.signOut();

      setError(
        "Unable to verify your account. Please try again."
      );

      return;
    }

    /* =====================================================
       3. ADMIN
    ===================================================== */

    if (adminUser) {
      router.replace("/admin");
      router.refresh();
      return;
    }

    /* =====================================================
       4. CHECK AUTHORITY
       
       Principal
       Vice Principal
       Program Officer 1
       Program Officer 2
    ===================================================== */

    const {
      data: authorityUser,
      error: authorityError,
    } = await supabase
      .from("authority")
      .select(
        `
          id,
          user_id,
          full_name,
          role,
          designation,
          is_active
        `
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (authorityError) {
      console.error(
        "Authority check error:",
        authorityError
      );

      await supabase.auth.signOut();

      setError(
        "Unable to verify your authority account. Please try again."
      );

      return;
    }

    /* =====================================================
       5. AUTHORITY ACCOUNT FOUND
    ===================================================== */

    if (authorityUser) {
      const role = String(
        authorityUser.role || ""
      )
        .trim()
        .toLowerCase();

      const designation = String(
        authorityUser.designation || ""
      )
        .trim()
        .toLowerCase();

      /* =================================================
         PRINCIPAL
      ================================================= */

      const isPrincipal =
        role === "principal" ||
        (role.includes("principal") &&
          !role.includes("vice"));

      /* =================================================
         VICE PRINCIPAL
      ================================================= */

      const isVicePrincipal =
        role === "vice principal" ||
        role.includes("vice principal") ||
        designation.includes("vice principal") ||
        role === "vp";

      /* =================================================
         PROGRAM OFFICER 1
      ================================================= */

      const isProgramOfficer1 =
        role === "program officer 1" ||
        role === "program_officer_1" ||
        role === "program officer one" ||
        role === "po1" ||
        role === "po 1";

      /* =================================================
         PROGRAM OFFICER 2
      ================================================= */

      const isProgramOfficer2 =
        role === "program officer 2" ||
        role === "program_officer_2" ||
        role === "program officer two" ||
        role === "po2" ||
        role === "po 2";

      /* =================================================
         PRINCIPAL / VICE PRINCIPAL
      ================================================= */

      if (
        isPrincipal ||
        isVicePrincipal
      ) {
        router.replace("/authority");
        router.refresh();
        return;
      }

      /* =================================================
         PROGRAM OFFICER 1 / 2
      ================================================= */

      if (
        isProgramOfficer1 ||
        isProgramOfficer2
      ) {
        router.replace("/po");
        router.refresh();
        return;
      }

      /* =================================================
         UNKNOWN AUTHORITY ROLE
      ================================================= */

      await supabase.auth.signOut();

      setError(
        "Your authority role is not authorized for this portal."
      );

      return;
    }

    /* =====================================================
       6. CHECK NSS OPERATIONS TEAM
       
       Attendance Coordinator
       Social Media Coordinator
       
       Later:
       Wing Heads
       Deputy Wing Heads
       Stream Coordinators
    ===================================================== */

    const {
      data: operationsUser,
      error: operationsError,
    } = await supabase
      .from("nss_operations_team")
      .select(
        `
          id,
          user_id,
          full_name,
          email,
          phone,
          role,
          designation,
          nss_unit,
          stream,
          department,
          is_active
        `
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (operationsError) {
      console.error(
        "Operations Team check error:",
        operationsError
      );

      await supabase.auth.signOut();

      setError(
        "Unable to verify your Operations Team account. Please try again."
      );

      return;
    }

    /* =====================================================
       7. OPERATIONS TEAM ACCOUNT FOUND
    ===================================================== */

    if (operationsUser) {
      const role = String(
        operationsUser.role || ""
      )
        .trim()
        .toLowerCase();

      const isActive =
        operationsUser.is_active !== false;

      /* =================================================
         INACTIVE ACCOUNT
      ================================================= */

      if (!isActive) {
        await supabase.auth.signOut();

        setError(
          "Your Operations Team account is currently inactive. Please contact the administrator."
        );

        return;
      }

      /* =================================================
         ATTENDANCE COORDINATOR
      ================================================= */

      if (
        role ===
        "attendance_coordinator"
      ) {
        router.replace(
          "/operations/attendance"
        );

        router.refresh();

        return;
      }

      /* =================================================
         SOCIAL MEDIA COORDINATOR
      ================================================= */

      if (
        role ===
        "social_media_coordinator"
      ) {
        router.replace(
          "/operations/social-media"
        );

        router.refresh();

        return;
      }

      /* =================================================
         FUTURE OPERATIONS TEAM ROLES
         
         These will be enabled when their
         portals are built.
      ================================================= */

      if (
        role === "wing_head" ||
        role === "deputy_wing_head"
      ) {
        router.replace("/heads");
        router.refresh();
        return;
      }

      if (
        role === "stream_coordinator"
      ) {
        router.replace(
          "/operations/stream"
        );

        router.refresh();

        return;
      }

      /* =================================================
         UNKNOWN OPERATIONS ROLE
      ================================================= */

      await supabase.auth.signOut();

      setError(
        "Your Operations Team role is not authorized for this portal."
      );

      return;
    }

    /* =====================================================
       8. FIND VOLUNTEER PROFILE
    ===================================================== */

    const {
      data: volunteer,
      error: volunteerError,
    } = await supabase
      .from("volunteers")
      .select(
        `
          id,
          full_name,
          status
        `
      )
      .eq("auth_user_id", userId)
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

    /* =====================================================
       9. NO VOLUNTEER PROFILE
    ===================================================== */

    if (!volunteer) {
      await supabase.auth.signOut();

      setError(
        "No volunteer application was found for this account. Please register first."
      );

      return;
    }

    /* =====================================================
       10. REJECTED
    ===================================================== */

    if (
      String(
        volunteer.status || ""
      ).toLowerCase() === "rejected"
    ) {
      await supabase.auth.signOut();

      setError(
        "Your volunteer application was rejected. Please register again with valid details/data or contact the administrator."
      );

      return;
    }

    /* =====================================================
       11. PENDING
    ===================================================== */

    if (
      String(
        volunteer.status || ""
      ).toLowerCase() === "pending"
    ) {
      await supabase.auth.signOut();

      setError(
        "Your volunteer application is still pending admin verification. Please wait until your application is approved."
      );

      return;
    }

    /* =====================================================
       12. APPROVED VOLUNTEER
    ===================================================== */

    if (
      String(
        volunteer.status || ""
      ).toLowerCase() === "approved"
    ) {
      router.replace(
        "/volunteer/dashboard"
      );

      router.refresh();

      return;
    }

    /* =====================================================
       13. UNKNOWN VOLUNTEER STATUS
    ===================================================== */

    await supabase.auth.signOut();

    setError(
      "Your application status could not be verified. Please contact the administrator."
    );
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    await supabase.auth.signOut();

    setError(
      "Something went wrong while logging in. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F2B7B] to-[#1C4ED8] px-4 py-6 sm:px-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="hidden flex-col items-center justify-center bg-[#0F2B7B] p-12 text-white lg:flex">

          <Image
            src="/logos/nss-logo.png"
            alt="NSS Logo"
            width={160}
            height={160}
            className="h-auto w-40 rounded-full bg-white p-2"
          />

          <h1 className="mt-8 text-4xl font-bold">
            ADC NSS CELL
          </h1>

          <p className="mt-4 max-w-md text-center leading-8 text-blue-100">
            Welcome to the official NSS Volunteer Portal.
            Login to manage your attendance, events,
            certificates and volunteer activities.
          </p>

        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="p-6 sm:p-10 lg:p-14">

          {/* LOGO */}

          <div className="flex justify-center">

            <Image
              src="/logos/aurora-logo.png"
              alt="Aurora Logo"
              width={90}
              height={90}
              className="h-auto w-[90px] rounded-full bg-white p-2 shadow-lg"
            />

          </div>

          {/* HEADING */}

          <h2 className="mt-6 text-center text-3xl font-bold text-[#0F2B7B]">
            NSS Member Login
          </h2>

          <p className="mt-2 text-center text-gray-500">
            Aurora&apos;s Degree & PG College NSS Cell
          </p>

          {/* ACCOUNT INFO */}


          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-6"
          >

            {/* EMAIL */}

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

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative mt-2">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 p-4 pr-12 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#0F2B7B]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={21}
                      strokeWidth={2}
                    />
                  ) : (
                    <Eye
                      size={21}
                      strokeWidth={2}
                    />
                  )}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0F2B7B] py-4 font-semibold text-white transition hover:bg-[#163A8C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* BACK HOME */}

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