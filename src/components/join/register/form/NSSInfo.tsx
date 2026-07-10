export default function NSSInfo() {
  return (
    <section className="mb-14">

      {/* Heading */}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          NSS Information
        </h2>

        <p className="mt-2 text-gray-600">
          Help us understand your interests, skills and motivation to join
          the National Service Scheme.
        </p>
      </div>

      {/* Skills */}

      <div className="mb-8">

        <label className="mb-2 block font-semibold">
          Skills
        </label>

        <input
          type="text"
          placeholder="Leadership, Photography, Public Speaking, Designing..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* Languages */}

      <div className="mb-8">

        <label className="mb-2 block font-semibold">
          Languages Known
        </label>

        <input
          type="text"
          placeholder="English, Telugu, Hindi..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* Volunteer Experience */}

      <div className="mb-8">

        <label className="mb-2 block font-semibold">
          Previous Volunteer Experience
        </label>

        <textarea
          rows={4}
          placeholder="Mention any volunteering experience (if any)..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* Why Join */}

      <div className="mb-8">

        <label className="mb-2 block font-semibold">
          Why do you want to join NSS?
          <span className="text-red-500"> *</span>
        </label>

        <textarea
          rows={5}
          placeholder="Tell us why you wish to become an NSS Volunteer..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* Areas of Interest */}

      <div className="mb-10">

        <label className="mb-5 block text-xl font-bold text-[#0F2B7B]">
          Areas of Interest
        </label>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {[
            "Tree Plantation",
            "Blood Donation",
            "Health Camps",
            "Awareness Programmes",
            "Teaching",
            "Photography",
            "Event Management",
            "Environment",
            "Technical Support",
            "Social Media",
            "Rural Development",
            "Women Empowerment",
          ].map((item) => (

            <label
              key={item}
              className="flex items-center gap-3 rounded-xl border p-4 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                className="h-5 w-5"
              />

              <span>{item}</span>

            </label>

          ))}

        </div>

      </div>

      {/* Availability */}

      <div>

        <label className="mb-5 block text-xl font-bold text-[#0F2B7B]">
          Availability
        </label>

        <div className="grid gap-4 md:grid-cols-2">

          {[
            "Weekdays",
            "Weekends",
            "Both",
            "Special Camps Only",
          ].map((item) => (

            <label
              key={item}
              className="flex items-center gap-3 rounded-xl border p-4 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="availability"
                className="h-5 w-5"
              />

              <span>{item}</span>

            </label>

          ))}

        </div>

      </div>

    </section>
  );
}