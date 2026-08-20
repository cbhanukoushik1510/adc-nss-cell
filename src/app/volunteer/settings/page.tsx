"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  LogOut,
  ShieldCheck,
  Mail,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Volunteer {
  full_name: string | null;
  college_email: string | null;
  status: string | null;
}

export default function SettingsPage() {
  const router = useRouter();

  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadVolunteer();
  }, []);

  const loadVolunteer = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("volunteers")
        .select(`
          full_name,
          college_email,
          status
        `)
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Error loading volunteer settings:",
          error
        );
        return;
      }

      setVolunteer(data);
    } catch (error) {
      console.error(
        "Settings loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  const handleChangePassword = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      alert("Unable to find your account email.");
      return;
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo:
            `${window.location.origin}/reset-password`,
        }
      );

    if (error) {
      console.error(
        "Password reset error:",
        error
      );

      alert(
        "Unable to send the password reset email."
      );

      return;
    }

    alert(
      "Password reset instructions have been sent to your email."
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          <h1 className="text-3xl font-bold text-[#0F2B7B]">
            Settings
          </h1>

          <p className="mt-6 text-gray-500">
            Loading settings...
          </p>
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section className="space-y-6">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-[#0F2B7B]">
            Settings
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your volunteer account and security.
          </p>
        </div>

        {/* Account Information */}

        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <User size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0F2B7B]">
                Account Information
              </h2>

              <p className="text-sm text-gray-500">
                Your registered volunteer account
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {volunteer?.full_name || "Not available"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-2">
                <Mail
                  size={16}
                  className="text-gray-500"
                />

                <p className="text-sm text-gray-500">
                  College Email
                </p>
              </div>

              <p className="mt-1 break-all font-semibold text-gray-800">
                {volunteer?.college_email || "Not available"}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-gray-500">
                Account Status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    volunteer?.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {volunteer?.status || "Unknown"}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* Profile Protection */}

        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">

          <div className="flex items-start gap-4">

            <ShieldCheck
              className="mt-1 shrink-0 text-blue-700"
              size={26}
            />

            <div>

              <h2 className="text-lg font-bold text-[#0F2B7B]">
                Volunteer Profile Protection
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Official volunteer details such as your name,
                NSS ID, department, course, year, contact
                information and other registration details
                are managed by the NSS administration.
              </p>

              <p className="mt-2 text-sm font-medium text-blue-700">
                If any information is incorrect, please
                contact the NSS administrator.
              </p>

            </div>

          </div>

        </div>

        {/* Security */}

        <div className="rounded-3xl bg-white shadow-lg">

          <div className="border-b p-6 sm:p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                <Lock size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Security
                </h2>

                <p className="text-sm text-gray-500">
                  Manage your account password.
                </p>
              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            className="flex w-full items-center justify-between p-6 text-left transition hover:bg-slate-50 sm:p-8"
          >

            <div>
              <p className="font-semibold text-gray-800">
                Change Password
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Receive a secure password reset link by email.
              </p>
            </div>

            <ChevronRight
              size={22}
              className="text-gray-400"
            />

          </button>

        </div>

        {/* Logout */}

        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <LogOut size={24} />
            </div>

            <div className="flex-1">

              <h2 className="text-xl font-bold text-gray-800">
                Sign Out
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Sign out of your NSS volunteer account on this device.
              </p>

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={18} />

                {loggingOut
                  ? "Signing out..."
                  : "Sign Out"}
              </button>

            </div>

          </div>

        </div>

        {/* Notice */}

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">

          <div className="flex items-start gap-3">

            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-yellow-600"
            />

            <p className="text-sm leading-6 text-yellow-800">
              Need to correct your volunteer information?
              Please contact the NSS administrator instead
              of creating a second account.
            </p>

          </div>

        </div>

      </section>
    </DashboardLayout>
  );
}