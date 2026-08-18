"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Volunteer {
  id: string;
  full_name: string | null;
  roll_number: string | null;
  department: string | null;
  course: string | null;
  college_email: string | null;
  mobile_number: string | null;
  status: string | null;
  photo_url: string | null;
  created_at: string | null;
}

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("volunteers")
      .select(`
        id,
        full_name,
        roll_number,
        department,
        course,
        college_email,
        mobile_number,
        status,
        photo_url,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Failed to load volunteers:", error);
      setError("Unable to load volunteer applications.");
      setLoading(false);
      return;
    }

    setVolunteers(data || []);
    setLoading(false);
  };

  const pendingCount = volunteers.filter(
    (v) => v.status === "Pending"
  ).length;

  const approvedCount = volunteers.filter(
    (v) => v.status === "Approved"
  ).length;

  const rejectedCount = volunteers.filter(
    (v) => v.status === "Rejected"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-[#0F2B7B] hover:underline"
            >
              ← Back to Admin Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-[#0F2B7B]">
              Volunteers
            </h1>

            <p className="mt-2 text-gray-600">
              Manage registered NSS volunteer applications.
            </p>
          </div>

          <button
            onClick={loadVolunteers}
            disabled={loading}
            className="rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white hover:bg-[#143a96] disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Volunteers
            </p>

            <p className="mt-2 text-3xl font-bold text-[#0F2B7B]">
              {volunteers.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {rejectedCount}
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Volunteer List */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow">

          <div className="border-b p-6">
            <h2 className="text-xl font-bold text-[#0F2B7B]">
              Volunteer Applications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select a volunteer to view their complete application.
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading volunteer applications...
            </div>
          ) : volunteers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No volunteer applications found.
            </div>
          ) : (
            <div className="divide-y">

              {volunteers.map((volunteer) => (

                <div
                  key={volunteer.id}
                  className="flex flex-col gap-5 p-6 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                >

                  {/* Profile */}
                  <div className="flex items-center gap-4">

                    {volunteer.photo_url ? (
                      <img
                        src={volunteer.photo_url}
                        alt={
                          volunteer.full_name ||
                          "Volunteer"
                        }
                        className="h-16 w-16 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-[#0F2B7B]">
                        {volunteer.full_name
                          ?.charAt(0)
                          .toUpperCase() || "V"}
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-gray-900">
                        {volunteer.full_name ||
                          "Unnamed Volunteer"}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Roll No:{" "}
                        {volunteer.roll_number || "—"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {volunteer.department || "—"}

                        {volunteer.course
                          ? ` • ${volunteer.course}`
                          : ""}
                      </p>
                    </div>

                  </div>

                  {/* Contact */}
                  <div className="text-sm text-gray-600">

                    <p>
                      {volunteer.college_email ||
                        "No email"}
                    </p>

                    <p className="mt-1">
                      {volunteer.mobile_number ||
                        "No mobile"}
                    </p>

                  </div>

                  {/* Status */}
                  <div>

                    <span
                      className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                        volunteer.status ===
                        "Approved"
                          ? "bg-green-100 text-green-700"
                          : volunteer.status ===
                            "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {volunteer.status ||
                        "Pending"}
                    </span>

                  </div>

                  {/* View */}
                  <Link
                    href={`/admin/volunteers/${volunteer.id}`}
                    className="rounded-xl bg-[#0F2B7B] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#143a96]"
                  >
                    View Application
                  </Link>

                </div>

              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}