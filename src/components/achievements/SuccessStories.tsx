import { Star } from "lucide-react";

const stories = [
  {
    title: "Community Impact",
    description:
      "Our NSS volunteers have actively participated in community outreach programmes, creating awareness on health, education, cleanliness and environmental conservation.",
  },
  {
    title: "Leadership Development",
    description:
      "Through NSS activities, students have developed leadership qualities, teamwork, communication skills and social responsibility.",
  },
  {
    title: "Social Service",
    description:
      "Volunteers have consistently contributed towards blood donation camps, awareness rallies, plantation drives and public welfare initiatives.",
  },
];

export default function SuccessStories() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Success Stories
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Every activity creates a positive impact on both society and our volunteers.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {stories.map((story) => (

            <div
              key={story.title}
              className="rounded-3xl bg-slate-50 p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
            >

              <Star className="mb-6 text-yellow-500" size={40} />

              <h3 className="text-2xl font-bold text-[#0F2B7B]">
                {story.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {story.description}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}