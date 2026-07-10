export default function LeadershipMessage() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Leadership Messages
          </h2>

          <p className="mt-3 text-gray-600">
            Inspiring students through leadership and community service.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Principal */}

          <div className="rounded-3xl bg-slate-50 p-8 shadow-lg transition hover:shadow-xl">

            <div className="flex items-center gap-6">

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-6xl shadow">
                👨‍🏫
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#0F2B7B]">
                  Principal
                </h3>

                <p className="text-gray-500">
                  Aurora's Degree & PG College
                </p>
              </div>

            </div>

            <p className="mt-8 leading-8 text-gray-600 italic">
              "Education is not only about academic excellence but also about
              building responsible citizens. NSS provides students an
              opportunity to serve society while developing leadership,
              compassion and discipline."
            </p>

          </div>

          {/* Programme Officer */}

          <div className="rounded-3xl bg-slate-50 p-8 shadow-lg transition hover:shadow-xl">

            <div className="flex items-center gap-6">

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-6xl shadow">
                👩‍🏫
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#0F2B7B]">
                  Programme Officer
                </h3>

                <p className="text-gray-500">
                  National Service Scheme
                </p>
              </div>

            </div>

            <p className="mt-8 leading-8 text-gray-600 italic">
              "The National Service Scheme empowers young minds to contribute
              towards nation building through selfless service, teamwork and
              community engagement."
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}