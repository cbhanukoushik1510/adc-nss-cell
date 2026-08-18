interface AcademicInfoProps {
  formData: any;
  onChange: (name: string, value: any) => void;
}

export default function AcademicInfo({
  formData,
  onChange,
}: AcademicInfoProps) {
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

          <select
            value={formData.department || ""}
            onChange={(e) => onChange("department", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select Department</option>
            <option>BCA</option>
            <option>BBA</option>
            <option>B.Com</option>
            <option>B.Sc</option>
            <option>BA</option>
            <option>Life Sciences</option>
          </select>
        </div>

        {/* Course */}
        <div>
          <label className="mb-2 block font-semibold">
            Course <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={formData.course || ""}
            onChange={(e) => onChange("course", e.target.value)}
            placeholder="Example: Bachelor of Computer Applications"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Year */}
        <div>
          <label className="mb-2 block font-semibold">
            Year <span className="text-red-500">*</span>
          </label>

          <select
            value={formData.year || ""}
            onChange={(e) => onChange("year", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select Year</option>
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

          <select
            value={formData.semester || ""}
            onChange={(e) => onChange("semester", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select Semester</option>
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
            value={formData.section || ""}
            onChange={(e) => onChange("section", e.target.value)}
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
            value={formData.academic_year || ""}
            onChange={(e) => onChange("academic_year", e.target.value)}
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
            value={formData.college_id || ""}
            onChange={(e) => onChange("college_id", e.target.value)}
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
            value={formData.admission_number || ""}
            onChange={(e) => onChange("admission_number", e.target.value)}
            placeholder="Admission Number"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

      </div>
    </section>
  );
}