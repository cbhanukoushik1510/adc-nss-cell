export default function AcademicInfo() {
  return (
    <section className="mb-14">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          Academic Information
        </h2>

        <p className="mt-2 text-gray-600">
          Provide your current academic details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Department */}

        <div>
          <label className="mb-2 block font-semibold">
            Department <span className="text-red-500">*</span>
          </label>

          <select className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100">
            <option>Select Department</option>
            <option>BCA</option>
            <option>BBA</option>
            <option>B.Com</option>
            <option>B.Sc</option>
            <option>BA</option>
          </select>
        </div>

        {/* Course */}

        <div>
          <label className="mb-2 block font-semibold">
            Course <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            placeholder="Example: Bachelor of Computer Applications"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Year */}

        <div>
          <label className="mb-2 block font-semibold">
            Year <span className="text-red-500">*</span>
          </label>

          <select className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100">
            <option>Select Year</option>
            <option>First Year</option>
            <option>Second Year</option>
            <option>Third Year</option>
          </select>
        </div>

        {/* Semester */}

        <div>
          <label className="mb-2 block font-semibold">
            Semester <span className="text-red-500">*</span>
          </label>

          <select className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100">
            <option>Select Semester</option>
            <option>I</option>
            <option>II</option>
            <option>III</option>
            <option>IV</option>
            <option>V</option>
            <option>VI</option>
          </select>
        </div>

        {/* Section */}

        <div>
          <label className="mb-2 block font-semibold">
            Section <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            placeholder="Example: A"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Academic Year */}

        <div>
          <label className="mb-2 block font-semibold">
            Academic Year <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            placeholder="2026 - 2027"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* College ID */}

        <div>
          <label className="mb-2 block font-semibold">
            College ID (Optional)
          </label>

          <input
            type="text"
            placeholder="College ID"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Admission Number */}

        <div>
          <label className="mb-2 block font-semibold">
            Admission Number (Optional)
          </label>

          <input
            type="text"
            placeholder="Admission Number"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

      </div>

    </section>
  );
}