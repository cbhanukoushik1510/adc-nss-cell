const testimonials = [
  {
    name: "NSS Volunteer",
    quote:
      "NSS helped me become more confident, responsible and socially aware.",
  },
  {
    name: "Student Volunteer",
    quote:
      "Every programme taught me leadership, teamwork and compassion.",
  },
  {
    name: "Volunteer Coordinator",
    quote:
      "Serving society through NSS has been one of the most rewarding experiences.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-6xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">

            Volunteer Experiences

          </h2>

          <p className="mt-4 text-lg text-gray-600">

            Hear what our volunteers have to say about their NSS journey.

          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {testimonials.map((item, index) => (

            <div
              key={index}
              className="rounded-3xl bg-white p-8 shadow-lg"
            >

              <div className="text-5xl">💬</div>

              <p className="mt-6 italic leading-8 text-gray-600">

                "{item.quote}"

              </p>

              <h3 className="mt-8 text-xl font-bold text-[#0F2B7B]">

                {item.name}

              </h3>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}