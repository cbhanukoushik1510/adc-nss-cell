import AlbumCard from "./AlbumCard";

const albums = [
  {
    emoji: "🌱",
    title: "Tree Plantation",
    photos: "Gallery Coming Soon",
  },
  {
    emoji: "❤️",
    title: "Blood Donation Camp",
    photos: "Gallery Coming Soon",
  },
  {
    emoji: "🧹",
    title: "Swachh Bharat Drive",
    photos: "Gallery Coming Soon",
  },
  {
    emoji: "🩺",
    title: "Health Awareness Camp",
    photos: "Gallery Coming Soon",
  },
  {
    emoji: "📢",
    title: "Awareness Rally",
    photos: "Gallery Coming Soon",
  },
  {
    emoji: "🏕",
    title: "Special NSS Camp",
    photos: "Gallery Coming Soon",
  },
  {
    emoji: "🎉",
    title: "National Celebrations",
    photos: "Gallery Coming Soon",
  },
  {
    emoji: "🏆",
    title: "Awards & Recognition",
    photos: "Gallery Coming Soon",
  },
];

export default function GalleryGrid() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">

            Event Albums

          </h2>

          <p className="mt-4 text-lg text-gray-600">

            Photos from NSS programmes will be uploaded here soon.

          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {albums.map((album) => (

            <AlbumCard

              key={album.title}

              emoji={album.emoji}

              title={album.title}

              photos={album.photos}

            />

          ))}

        </div>

      </div>

    </section>
  );
}