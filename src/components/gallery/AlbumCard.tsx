import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";

interface AlbumCardProps {
  emoji: string;
  title: string;
  photos: string;
  imageUrl?: string;
  description?: string;
}

export default function AlbumCard({
  emoji,
  title,
  photos,
  imageUrl,
  description,
}: AlbumCardProps) {
  return (
    <Link
      href={`/gallery?category=${encodeURIComponent(title)}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden bg-[#0F2B7B]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-7xl transition duration-300 group-hover:scale-110">
              {emoji}
            </span>
          </div>
        )}

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* PHOTO COUNT */}
        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#0F2B7B] shadow-lg">
          <Camera size={14} />
          {photos}
        </div>
      </div>

      {/* INFORMATION */}
      <div className="p-6">

        {/* CATEGORY / LABEL */}
        <p className="text-xs font-bold uppercase tracking-wider text-[#0F2B7B]/60">
          NSS Event Album
        </p>

        {/* TITLE */}
        <h3 className="mt-2 text-xl font-bold text-[#0F2B7B]">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
          {description ||
            `Photos and memories from our ${title.toLowerCase()} NSS programme.`}
        </p>

        {/* VIEW ALBUM */}
        <div className="mt-5 inline-flex items-center gap-2 font-semibold text-[#0F2B7B] transition-all duration-300 group-hover:gap-3">
          View Album
          <ArrowRight size={17} />
        </div>

      </div>
    </Link>
  );
}