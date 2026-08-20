"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ImageIcon,
  CalendarDays,
  X,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  event_id: string | null;
  created_at: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] =
    useState<GalleryItem | null>(null);

  const [category, setCategory] =
    useState("All");

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("gallery")
        .select(`
          id,
          title,
          description,
          image_url,
          category,
          event_id,
          created_at
        `)
        .eq("is_published", true)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error loading gallery:",
          error
        );

        setItems([]);
        return;
      }

      setItems((data || []) as GalleryItem[]);
    } catch (error) {
      console.error(
        "Gallery loading error:",
        error
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(
      new Set(items.map((item) => item.category))
    ),
  ];

  const filteredItems =
    category === "All"
      ? items
      : items.filter(
          (item) => item.category === category
        );

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
    <DashboardLayout>
      <section className="space-y-8">

        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-[#0F2B7B]">
            NSS Gallery
          </h1>

          <p className="mt-2 text-gray-600">
            Explore moments and memories from NSS
            activities and events.
          </p>
        </div>

        {/* Category Filter */}

        {!loading && items.length > 0 && (
          <div className="flex flex-wrap gap-3">

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setCategory(item)
                }
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "bg-[#0F2B7B] text-white"
                    : "bg-white text-gray-600 shadow-sm hover:bg-blue-50 hover:text-[#0F2B7B]"
                }`}
              >
                {item}
              </button>
            ))}

          </div>
        )}

        {/* Loading */}

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-lg">

            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

            <p className="mt-4 text-gray-500">
              Loading gallery...
            </p>

          </div>
        ) : filteredItems.length === 0 ? (

          /* Empty */

          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">

            <ImageIcon className="mx-auto h-14 w-14 text-gray-400" />

            <h2 className="mt-5 text-xl font-bold text-gray-700">
              No gallery photos yet
            </h2>

            <p className="mt-2 text-gray-500">
              NSS event photos will appear here.
            </p>

          </div>

        ) : (

          /* Gallery */

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setSelectedImage(item)
                }
                className="group overflow-hidden rounded-3xl bg-white text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >

                {/* Image */}

                <div className="relative h-64 w-full overflow-hidden bg-slate-200">

                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />

                </div>

                {/* Details */}

                <div className="p-5">

                  <div className="flex items-center justify-between gap-3">

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {item.category}
                    </span>

                    <span className="text-xs text-gray-400">
                      {formatDate(item.created_at)}
                    </span>

                  </div>

                  <h2 className="mt-4 text-lg font-bold text-[#0F2B7B]">
                    {item.title}
                  </h2>

                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {item.description}
                    </p>
                  )}

                </div>

              </button>
            ))}

          </div>
        )}

      </section>

      {/* Image Preview */}

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() =>
            setSelectedImage(null)
          }
        >

          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Close */}

            <button
              type="button"
              onClick={() =>
                setSelectedImage(null)
              }
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              <X size={22} />
            </button>

            {/* Image */}

            <div className="relative h-[50vh] w-full bg-black sm:h-[65vh]">

              <Image
                src={selectedImage.image_url}
                alt={selectedImage.title}
                fill
                sizes="100vw"
                className="object-contain"
              />

            </div>

            {/* Info */}

            <div className="p-6">

              <div className="flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  {selectedImage.category}
                </span>

                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <CalendarDays size={15} />
                  {formatDate(
                    selectedImage.created_at
                  )}
                </span>

              </div>

              <h2 className="mt-4 text-2xl font-bold text-[#0F2B7B]">
                {selectedImage.title}
              </h2>

              {selectedImage.description && (
                <p className="mt-2 text-gray-600">
                  {selectedImage.description}
                </p>
              )}

            </div>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
}