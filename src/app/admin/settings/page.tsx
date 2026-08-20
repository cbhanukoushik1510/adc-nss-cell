"use client";

import { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  Lock,
  Mail,
  Database,
  Globe,
  Users,
  CalendarDays,
  ClipboardCheck,
  ImageIcon,
  Award,
  Megaphone,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { supabase } from "@/lib/supabase";

interface AdminAccount {
  email: string | null;
  userId: string | null;
}

export default function AdminSettingsPage() {
  const [admin, setAdmin] =
    useState<AdminAccount>({
      email: null,
      userId: null,
    });

  const [loading, setLoading] =
    useState(true);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* ==========================================
     LOAD ADMIN ACCOUNT
  ========================================== */

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "Unable to load administrator account."
        );

        return;
      }

      setAdmin({
        email: user.email || null,
        userId: user.id,
      });
    } catch (err) {
      console.error(
        "Admin settings loading error:",
        err
      );

      setError(
        "Something went wrong while loading settings."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     CHANGE PASSWORD
  ========================================== */

  const handleChangePassword = async () => {
    if (!admin.email) {
      setError(
        "Unable to find the administrator email."
      );

      return;
    }

    setPasswordLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          admin.email,
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

        setError(
          "Unable to send the password reset email."
        );

        return;
      }

      setMessage(
        "Password reset instructions have been sent to the administrator email."
      );
    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      setError(
        "Something went wrong while sending the password reset email."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="mx-auto max-w-6xl">

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <RefreshCw
              className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]"
            />

            <p className="mt-4 text-gray-500">
              Loading administrator settings...
            </p>

          </div>

        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">

        {/* =====================================
            HEADER
        ===================================== */}

        <div>

          <h1 className="text-3xl font-bold text-[#0F2B7B]">
            Admin Settings
          </h1>

          <p className="mt-2 text-gray-600">
            Manage administrator security,
            system information and NSS management
            configuration.
          </p>

        </div>

        {/* =====================================
            SUCCESS MESSAGE
        ===================================== */}

        {message && (
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800">

            <CheckCircle
              className="mt-0.5 shrink-0"
              size={21}
            />

            <p className="text-sm font-medium">
              {message}
            </p>

          </div>
        )}

        {/* =====================================
            ERROR MESSAGE
        ===================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">

            <AlertTriangle
              className="mt-0.5 shrink-0"
              size={21}
            />

            <div>

              <p className="font-semibold">
                Settings Error
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* =====================================
            ADMIN ACCOUNT
        ===================================== */}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="border-b p-6 sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0F2B7B]">
                <User size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Administrator Account
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Current administrator account information.
                </p>

              </div>

            </div>

          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">

            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-2">

                <Mail
                  size={17}
                  className="text-gray-500"
                />

                <p className="text-sm text-gray-500">
                  Administrator Email
                </p>

              </div>

              <p className="mt-2 break-all font-semibold text-gray-800">
                {admin.email || "Not available"}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={17}
                  className="text-green-600"
                />

                <p className="text-sm text-gray-500">
                  Role
                </p>

              </div>

              <div className="mt-2">

                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  Administrator
                </span>

              </div>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-gray-500">
                Account Status
              </p>

              <div className="mt-2 flex items-center gap-2">

                <CheckCircle
                  size={17}
                  className="text-green-600"
                />

                <span className="font-semibold text-green-700">
                  Active
                </span>

              </div>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-gray-500">
                User ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-gray-600">
                {admin.userId || "Not available"}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================
            SECURITY
        ===================================== */}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="border-b p-6 sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                <Lock size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Security
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage administrator account security.
                </p>

              </div>

            </div>

          </div>

          <div className="p-6 sm:p-8">

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-200 p-5 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
                  <Lock size={20} />
                </div>

                <div>

                  <p className="font-semibold text-gray-800">
                    Change Password
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Receive a secure password reset
                    link at the administrator email.
                  </p>

                </div>

              </div>

              {passwordLoading ? (
                <RefreshCw
                  size={21}
                  className="animate-spin text-gray-400"
                />
              ) : (
                <ChevronRight
                  size={21}
                  className="text-gray-400"
                />
              )}

            </button>

          </div>

        </section>

        {/* =====================================
            VOLUNTEER MANAGEMENT
        ===================================== */}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="border-b p-6 sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Users size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Volunteer Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Administrative permissions for
                  volunteer records.
                </p>

              </div>

            </div>

          </div>

          <div className="space-y-4 p-6 sm:p-8">

            <SettingRow
              icon={<ShieldCheck size={20} />}
              title="Volunteer Profile Editing"
              description="Official volunteer profile and registration details can only be edited by administrators."
              status="Admin Only"
            />

            <SettingRow
              icon={<Users size={20} />}
              title="Head Profile Access"
              description="Heads can manage assigned operational work but cannot edit official volunteer profile details."
              status="Restricted"
            />

            <SettingRow
              icon={<CheckCircle size={20} />}
              title="Volunteer Registration"
              description="Administrators review, approve and reject volunteer applications."
              status="Admin Managed"
            />

          </div>

        </section>

        {/* =====================================
            EVENTS & ATTENDANCE
        ===================================== */}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="border-b p-6 sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <CalendarDays size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Events & Attendance
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Operational areas managed through
                  their respective modules.
                </p>

              </div>

            </div>

          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">

            <ManagementCard
              icon={<CalendarDays size={21} />}
              title="Events"
              description="Create and manage NSS events."
            />

            <ManagementCard
              icon={<ClipboardCheck size={21} />}
              title="Attendance"
              description="Record and review volunteer attendance."
            />

            <ManagementCard
              icon={<CheckCircle size={21} />}
              title="Activities"
              description="Manage volunteer activities and service work."
            />

            <ManagementCard
              icon={<Award size={21} />}
              title="Certificates"
              description="Manage certificates issued to volunteers."
            />

          </div>

        </section>

        {/* =====================================
            WEBSITE CONTENT
        ===================================== */}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="border-b p-6 sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <Globe size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Website Content
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Content managed by the administration
                  and displayed on the public website.
                </p>

              </div>

            </div>

          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">

            <ManagementCard
              icon={<CalendarDays size={21} />}
              title="Home Page Events"
              description="Events selected for the website home page."
            />

            <ManagementCard
              icon={<ImageIcon size={21} />}
              title="Gallery"
              description="Manage gallery images and event media."
            />

            <ManagementCard
              icon={<Megaphone size={21} />}
              title="Announcements"
              description="Publish announcements for volunteers and visitors."
            />

            <ManagementCard
              icon={<Globe size={21} />}
              title="Public Website"
              description="Content displayed on the NSS public website."
            />

          </div>

        </section>

        {/* =====================================
            DATABASE / SYSTEM
        ===================================== */}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="border-b p-6 sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Database size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  System Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Basic information about the NSS
                  administration system.
                </p>

              </div>

            </div>

          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-gray-500">
                Application
              </p>

              <p className="mt-2 font-bold text-gray-800">
                ADC NSS
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-gray-500">
                Portal
              </p>

              <p className="mt-2 font-bold text-gray-800">
                Administration
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-gray-500">
                Authentication
              </p>

              <div className="mt-2 flex items-center gap-2">

                <CheckCircle
                  size={17}
                  className="text-green-600"
                />

                <span className="font-semibold text-green-700">
                  Connected
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            IMPORTANT SECURITY NOTICE
        ===================================== */}

        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">

          <div className="flex items-start gap-4">

            <ShieldCheck
              size={25}
              className="mt-0.5 shrink-0 text-blue-700"
            />

            <div>

              <h2 className="font-bold text-[#0F2B7B]">
                Administrator Permissions
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Administrator settings describe the
                permissions available to the admin portal.
                Actual access control should be enforced
                by authentication and database security
                policies, not only by hiding interface
                controls.
              </p>

            </div>

          </div>

        </div>

        {/* =====================================
            DANGER ZONE
        ===================================== */}

        <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">

          <div className="p-6 sm:p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle size={24} />
              </div>

              <div>

                <h2 className="text-xl font-bold text-red-700">
                  Security & Account Notice
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Avoid creating duplicate administrator
                  accounts. If administrator access needs
                  to be changed, update the authorized
                  account through the proper administration
                  process.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>
    </AdminDashboardLayout>
  );
}

/* ==========================================
   SETTING ROW
========================================== */

function SettingRow({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-start gap-4">

        <div className="rounded-xl bg-slate-100 p-3 text-[#0F2B7B]">
          {icon}
        </div>

        <div>

          <p className="font-semibold text-gray-800">
            {title}
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>

        </div>

      </div>

      <span className="inline-flex w-fit shrink-0 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
        {status}
      </span>

    </div>
  );
}

/* ==========================================
   MANAGEMENT CARD
========================================== */

function ManagementCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 transition hover:border-blue-200 hover:bg-slate-50">

      <div className="flex items-start gap-4">

        <div className="rounded-xl bg-blue-100 p-3 text-[#0F2B7B]">
          {icon}
        </div>

        <div>

          <h3 className="font-semibold text-gray-800">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}