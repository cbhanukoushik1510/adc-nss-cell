import { Button } from "@/components/ui/button";

const activities = [
  {
    emoji: "🌳",
    title: "Tree Plantation Drive",
    description:
      "Promoting environmental sustainability by planting trees on campus and in nearby communities.",
  },
  {
    emoji: "🩸",
    title: "Blood Donation Camp",
    description:
      "Organizing voluntary blood donation camps to support hospitals and save lives.",
  },
  {
    emoji: "🧹",
    title: "Swachh Bharat Abhiyan",
    description:
      "Conducting cleanliness drives to promote hygiene and civic responsibility.",
  },
  {
    emoji: "🏥",
    title: "Health Awareness Camp",
    description:
      "Creating awareness about health, nutrition, and preventive healthcare in the community.",
  },
  {
    emoji: "📚",
    title: "Literacy & Education Drive",
    description:
      "Supporting education through teaching initiatives and awareness programmes.",
  },
  {
    emoji: "🌍",
    title: "Community Service",
    description:
      "Serving society through impactful outreach programmes and volunteer activities.",
  },
];

export default function FeaturedActivities() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Featured NSS Activities
          </h2>

          <p className="mt-3 text-gray-600">
            Our volunteers actively participate in programmes that create a
            positive impact on society.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {activities.map((activity, index) => (
            <div
              key={index}
              className="rounded-3xl border border-gray-200 bg-slate-50 p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 text-6xl">
                {activity.emoji}
              </div>

              <h3 className="text-2xl font-bold text-[#0F2B7B]">
                {activity.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {activity.description}
              </p>

              <Button className="mt-6 bg-[#0F2B7B] hover:bg-[#16398F]">
                View Details
              </Button>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}