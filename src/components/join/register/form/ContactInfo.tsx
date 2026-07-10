export default function ContactInfo() {
  return (
    <section className="mb-14">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          Contact Information
        </h2>

        <p className="mt-2 text-gray-600">
          Please provide your active contact details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* College Email */}

        <div>
          <label className="mb-2 block font-semibold">
            College Email <span className="text-red-500">*</span>
          </label>

          <input
            type="email"
            placeholder="student@adc.edu.in"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Personal Email */}

        <div>
          <label className="mb-2 block font-semibold">
            Personal Email
          </label>

          <input
            type="email"
            placeholder="example@gmail.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Mobile */}

        <div>
          <label className="mb-2 block font-semibold">
            Mobile Number <span className="text-red-500">*</span>
          </label>

          <input
            type="tel"
            placeholder="+91 9876543210"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* WhatsApp */}

        <div>
          <label className="mb-2 block font-semibold">
            WhatsApp Number
          </label>

          <input
            type="tel"
            placeholder="+91 9876543210"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Emergency Contact */}

        <div>
          <label className="mb-2 block font-semibold">
            Emergency Contact Name
          </label>

          <input
            type="text"
            placeholder="Parent / Guardian Name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Emergency Number */}

        <div>
          <label className="mb-2 block font-semibold">
            Emergency Contact Number
          </label>

          <input
            type="tel"
            placeholder="+91 9876543210"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

      </div>

      {/* Address */}

      <div className="mt-8">

        <label className="mb-2 block font-semibold">
          Address <span className="text-red-500">*</span>
        </label>

        <textarea
          rows={4}
          placeholder="Enter your complete residential address"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
        />

      </div>

      {/* City, State & Pincode */}

      <div className="mt-8 grid gap-6 md:grid-cols-3">

        <div>
          <label className="mb-2 block font-semibold">
            City
          </label>

          <input
            type="text"
            placeholder="Hyderabad"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            State
          </label>

          <input
            type="text"
            placeholder="Telangana"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Pincode
          </label>

          <input
            type="text"
            placeholder="500020"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

      </div>

    </section>
  );
}