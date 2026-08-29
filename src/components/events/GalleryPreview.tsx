"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  event_id: string | null;
  category: string;
  uploaded_by: string | null;
  is_published: boolean;
  created_at: string;
  media_type: string;
};

export default function GalleryPreview() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadGallery() {
      try {
        setLoading(true);
        setError("");

        const { data, error: galleryError } =
          await supabase
            .from("gallery")
            .select(`
              id,
              title,
              description,
              image_url,
              event_id,
              category,
              uploaded_by,
              is_published,
              created_at,
              media_type
            `)
            .eq("is_published", true)
            .order("created_at", {
              ascending: false,
            })
            .limit(6);

        if (galleryError) {
          console.error(
            "Gallery error:",
            galleryError
          );

          if (mounted) {
            setError(
              galleryError.message ||
                "Unable to load gallery."
            );
          }

          return;
        }

        if (mounted) {
          setItems(
            (data || []) as GalleryItem[]
          );
        }
      } catch (err) {
        console.error(
          "Gallery error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load gallery."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* HEADER */}
        <div className="mb-14 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[#0F2B7B]">
              NSS Gallery
            </p>

            <h2 className="text-4xl font-bold text-[#0F2B7B]">
              Event Gallery
            </h2>

            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              Moments and memories from our NSS events,
              programmes and activities.
            </p>
          </div>

          {!loading &&
            !error &&
            items.length > 0 && (
              <Link
                href="/gallery"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-[#0F2B7B] px-6 py-3 font-semibold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
              >
                View Full Gallery

                <ArrowRight size={18} />
              </Link>
            )}

        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#0F2B7B]">
              <Loader2
                size={26}
                className="animate-spin"
              />

              <span className="font-medium">
                Loading gallery...
              </span>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">
              Unable to load gallery
            </p>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          items.length === 0 && (
            <div className="mx-auto max-w-2xl rounded-3xl bg-slate-50 p-10 text-center">

              <ImageIcon
                size={50}
                className="mx-auto text-[#0F2B7B]"
              />

              <h3 className="mt-5 text-2xl font-bold text-[#0F2B7B]">
                Gallery Coming Soon
              </h3>

              <p className="mt-3 text-gray-600">
                Photos and memories from our NSS
                activities will appear here.
              </p>

            </div>
          )}

        {/* GALLERY GRID */}
        {!loading &&
          !error &&
          items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {items.map((item) => (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group overflow-hidden rounded-3xl bg-slate-50 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* IMAGE */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#0F2B7B]">

                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                    {/* CATEGORY */}
                    {item.category && (
                      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#0F2B7B] shadow">
                        {item.category}
                      </div>
                    )}

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20" />

                  </div>

                  {/* CONTENT */}
                  <div className="p-6">

                    <h3 className="line-clamp-1 text-xl font-bold text-[#0F2B7B]">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                        {item.description}
                      </p>
                    )}

                  </div>

                </Link>
              ))}

            </div>
          )}

        {/* BOTTOM BUTTON */}
        {!loading &&
          !error &&
          items.length > 0 && (
            <div className="mt-10 text-center">

              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-7 py-3.5 font-semibold text-white transition hover:bg-[#143a96]"
              >
                Explore All Gallery

                <ArrowRight size={18} />
              </Link>

            </div>
          )}

      </div>
    </section>
  );
}