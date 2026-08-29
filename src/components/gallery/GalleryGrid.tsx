"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import AlbumCard from "./AlbumCard";
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

type Album = {
  title: string;
  category: string;
  coverImage: string | null;
  photoCount: number;
  latestDate: string;
};

export default function GalleryGrid() {
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
            .in("media_type", ["photo", "image"])
            .order("created_at", {
              ascending: false,
            });

        if (galleryError) {
          console.error(
            "Gallery loading error:",
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
          "Gallery loading error:",
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

  /*
   * Convert gallery photos into albums.
   * Each category becomes one album.
   */
  const albums = useMemo<Album[]>(() => {
    const albumMap = new Map<string, Album>();

    items.forEach((item) => {
      const category =
        item.category?.trim() ||
        "NSS Activities";

      const existing =
        albumMap.get(category);

      if (!existing) {
        albumMap.set(category, {
          title: category,
          category,
          coverImage: item.image_url,
          photoCount: 1,
          latestDate: item.created_at,
        });

        return;
      }

      existing.photoCount += 1;

      /*
       * Keep the newest image as the
       * album cover.
       */
      if (
        new Date(item.created_at).getTime() >
        new Date(
          existing.latestDate
        ).getTime()
      ) {
        existing.coverImage =
          item.image_url;

        existing.latestDate =
          item.created_at;
      }
    });

    return Array.from(
      albumMap.values()
    );
  }, [items]);

  function formatPhotos(count: number) {
    return `${count} ${
      count === 1 ? "Photo" : "Photos"
    }`;
  }

  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* SECTION HEADER */}
        <div className="mx-auto mb-14 max-w-3xl text-center">

          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0F2B7B]/10 px-4 py-2 text-sm font-semibold text-[#0F2B7B]">
              <ImageIcon size={16} />

              NSS Memories
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[#0F2B7B] sm:text-4xl lg:text-5xl">
            Event Albums
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Explore photos from our NSS programmes,
            events and activities.
          </p>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm">
              <Loader2
                size={24}
                className="animate-spin text-[#0F2B7B]"
              />

              <span className="font-medium text-gray-700">
                Loading albums...
              </span>
            </div>

          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <ImageIcon
                size={26}
                className="text-red-600"
              />
            </div>

            <h3 className="mt-5 text-xl font-bold text-red-700">
              Unable to load gallery
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          albums.length === 0 && (
            <div className="mx-auto max-w-xl rounded-3xl bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B]/10">
                <ImageIcon
                  size={30}
                  className="text-[#0F2B7B]"
                />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-[#0F2B7B]">
                Gallery Coming Soon
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Photos from NSS programmes and
                activities will appear here once
                they are published.
              </p>

            </div>
          )}

        {/* ALBUM GRID */}
        {!loading &&
          !error &&
          albums.length > 0 && (
            <div
              className={`
                grid
                grid-cols-1
                justify-items-center
                gap-8
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              `}
            >

              {albums.map((album) => (
                <div
                  key={album.category}
                  className="w-full max-w-sm"
                >

                  <AlbumCard
                    emoji="📸"
                    title={album.title}
                    photos={formatPhotos(
                      album.photoCount
                    )}
                    imageUrl={
                      album.coverImage ||
                      undefined
                    }
                  />

                </div>
              ))}

            </div>
          )}

      </div>
    </section>
  );
}