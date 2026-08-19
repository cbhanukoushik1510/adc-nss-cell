"use client";

import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

interface Announcement {
  id: string;
  title: string;
  description: string | null;
  category: string;
  color: string;
  created_at: string;
}

const badgeColors = {
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
};

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        description,
        category,
        color,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error(
        "Error loading announcements:",
        error
      );

      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <Bell className="text-[#0F2B7B]" />

          <h2 className="text-2xl font-bold text-[#0F2B7B]">
            Announcements
          </h2>

        </div>

        <Link
          href="/dashboard/announcements"
          className="text-sm font-semibold text-[#0F2B7B]"
        >
          View All →
        </Link>

      </div>

      {loading ? (
        <p className="text-gray-500">
          Loading announcements...
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">

          <Bell className="mx-auto h-10 w-10 text-gray-400" />

          <p className="mt-4 font-semibold text-gray-600">
            No announcements
          </p>

          <p className="mt-1 text-sm text-gray-400">
            New NSS announcements will appear here.
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {items.map((item) => {

            const badgeColor =
              badgeColors[
                item.color as keyof typeof badgeColors
              ] || badgeColors.blue;

            return (
              <div
                key={item.id}
                className="rounded-2xl border p-5 transition hover:border-[#0F2B7B] hover:shadow-md"
              >

                <div className="flex items-center justify-between gap-4">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${badgeColor}`}
                  >
                    {item.category}
                  </span>

                  <span className="text-sm text-gray-500">
                    {formatDate(item.created_at)}
                  </span>

                </div>

                <h3 className="mt-4 text-lg font-bold text-[#0F2B7B]">
                  {item.title}
                </h3>

                <p className="mt-2 text-gray-600">
                  {item.description || "No description available."}
                </p>

                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0F2B7B] hover:underline"
                >
                  Read More
                  <ArrowRight size={16} />
                </button>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}