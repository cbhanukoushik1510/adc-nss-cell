export default function ContactForm() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-xl">

        <h2 className="mb-8 text-center text-4xl font-bold text-[#0F2B7B]">

          Send us a Message

        </h2>

        <p className="mb-10 text-center text-gray-600">

          Contact form integration will be available soon.

        </p>

        <div className="grid gap-6 md:grid-cols-2">

          <input
            placeholder="Full Name"
            className="rounded-xl border p-4"
          />

          <input
            placeholder="Email Address"
            className="rounded-xl border p-4"
          />

          <input
            placeholder="Phone Number"
            className="rounded-xl border p-4 md:col-span-2"
          />

          <textarea
            rows={6}
            placeholder="Your Message"
            className="rounded-xl border p-4 md:col-span-2"
          />

        </div>

        <button
          disabled
          className="mt-8 w-full rounded-xl bg-gray-300 py-4 font-bold text-gray-600"
        >

          Send Message

        </button>

      </div>

    </section>
  );
}