"use client";

import { useCallback, useEffect, useState } from "react";
import { Megaphone, RefreshCw } from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Announcement {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  color: string | null;
}

export default function LatestUpdates() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD ANNOUNCEMENTS
  // ============================================================

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: announcementsError } = await supabase
        .from("announcements")
        .select(`
          id,
          title,
          description,
          category,
          color
        `)
        .order("id", {
          ascending: false,
        })
        .limit(5);

      if (announcementsError) {
        console.error(
          "Announcements loading error:",
          announcementsError
        );

        throw new Error(
          announcementsError.message ||
            "Unable to load announcements."
        );
      }

      setAnnouncements(
        (data || []) as Announcement[]
      );
    } catch (err) {
      console.error(
        "Announcements loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load announcements."
      );

      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // ============================================================
  // COLOR HELPERS
  // ============================================================

  const getColorClasses = (
    color: string | null
  ) => {
    const value =
      color?.trim().toLowerCase();

    switch (value) {
      case "green":
        return {
          icon:
            "bg-green-100 text-green-700",
          badge:
            "bg-green-100 text-green-700",
        };

      case "red":
        return {
          icon:
            "bg-red-100 text-red-700",
          badge:
            "bg-red-100 text-red-700",
        };

      case "yellow":
        return {
          icon:
            "bg-yellow-100 text-yellow-700",
          badge:
            "bg-yellow-100 text-yellow-700",
        };

      case "orange":
        return {
          icon:
            "bg-orange-100 text-orange-700",
          badge:
            "bg-orange-100 text-orange-700",
        };

      case "purple":
        return {
          icon:
            "bg-purple-100 text-purple-700",
          badge:
            "bg-purple-100 text-purple-700",
        };

      case "blue":
      default:
        return {
          icon:
            "bg-blue-100 text-blue-700",
          badge:
            "bg-blue-100 text-blue-700",
        };
    }
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg transition hover:shadow-xl">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#0F2B7B]">
            <Megaphone className="h-5 w-5" />
          </div>

          <h2 className="text-2xl font-bold text-[#0F2B7B]">
            Notices & Announcements
          </h2>

        </div>

      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="flex flex-col items-center justify-center py-10">

          <RefreshCw className="h-7 w-7 animate-spin text-[#0F2B7B]" />

          <p className="mt-3 text-sm text-gray-500">
            Loading announcements...
          </p>

        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-700">
            Unable to load announcements.
          </p>

          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadAnnouncements}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0F2B7B] px-3 py-2 text-xs font-bold text-white hover:bg-[#143a96]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>

        </div>
      )}

      {/* ======================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        !error &&
        announcements.length === 0 && (
          <div className="py-10 text-center">

            <Megaphone className="mx-auto h-10 w-10 text-gray-300" />

            <p className="mt-3 text-sm font-semibold text-gray-600">
              No announcements available.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              New notices and announcements will appear here.
            </p>

          </div>
        )}

      {/* ======================================================
          ANNOUNCEMENTS
      ====================================================== */}

      {!loading &&
        !error &&
        announcements.length > 0 && (
          <div className="space-y-1">

            {announcements.map(
              (item) => {
                const colors =
                  getColorClasses(
                    item.color
                  );

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-slate-100 py-4 last:border-b-0"
                  >

                    {/* ICON */}

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
                    >
                      <Megaphone className="h-4 w-4" />
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <h3 className="font-semibold leading-5 text-[#0F2B7B]">
                          {item.title}
                        </h3>

                        {item.category && (
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
                          >
                            {item.category}
                          </span>
                        )}

                      </div>

                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">
                          {item.description}
                        </p>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

    </div>
  );
}