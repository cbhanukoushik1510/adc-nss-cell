type AlbumCardProps = {
  emoji: string;
  title: string;
  photos: string;
};

export default function AlbumCard({
  emoji,
  title,
  photos,
}: AlbumCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

      <div className="flex h-60 items-center justify-center bg-[#0F2B7B] text-8xl">

        {emoji}

      </div>

      <div className="p-8">

        <h3 className="text-2xl font-bold text-[#0F2B7B]">

          {title}

        </h3>

        <p className="mt-3 text-gray-600">

          {photos}

        </p>

      </div>

    </div>
  );
}