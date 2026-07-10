export default function PersonalInfo() {
  return (
    <section className="mb-14">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          Personal Information
        </h2>

        <p className="mt-2 text-gray-600">
          Please provide your personal details accurately.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Full Name */}

        <div>
          <label className="mb-2 block font-semibold">
            Full Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Roll Number */}

        <div>
          <label className="mb-2 block font-semibold">
            Roll Number <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter roll number"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Hall Ticket */}

        <div>
          <label className="mb-2 block font-semibold">
            Hall Ticket Number
          </label>

          <input
            type="text"
            placeholder="Hall Ticket Number"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Date of Birth */}

        <div>
          <label className="mb-2 block font-semibold">
            Date of Birth <span className="text-red-500">*</span>
          </label>

          <input
            type="date"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Gender */}

        <div>
          <label className="mb-2 block font-semibold">
            Gender <span className="text-red-500">*</span>
          </label>

          <select className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100">
            <option>Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        {/* Blood Group */}

        <div>
          <label className="mb-2 block font-semibold">
            Blood Group
          </label>

          <select className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100">
            <option>Select Blood Group</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>

      </div>

      {/* Student Photo */}

      <div className="mt-8">

        <label className="mb-2 block font-semibold">
          Passport Size Photo
        </label>

        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50 p-8 text-center">

          <p className="text-gray-500">
            Photo upload will be enabled after backend integration.
          </p>

        </div>

      </div>

    </section>
  );
}