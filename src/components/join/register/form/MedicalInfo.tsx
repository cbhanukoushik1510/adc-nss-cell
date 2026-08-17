interface MedicalInfoProps {
  formData: any;
  onChange: (name: string, value: any) => void;
}

export default function MedicalInfo({
  formData,
  onChange,
}: MedicalInfoProps) {
  return (
    <section className="mb-14">

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          Medical Information
        </h2>

        <p className="mt-2 text-gray-600">
          This information will only be used during NSS activities and
          emergency situations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Blood Group */}
        <div>
          <label className="mb-2 block font-semibold">
            Blood Group
          </label>

          <select
            value={formData.blood_group || ""}
            onChange={(e) => onChange("blood_group", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select Blood Group</option>
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

        {/* Height */}
        <div>
          <label className="mb-2 block font-semibold">
            Height (Optional)
          </label>

          <input
            type="text"
            value={formData.height || ""}
            onChange={(e) => onChange("height", e.target.value)}
            placeholder="Example: 170 cm"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="mb-2 block font-semibold">
            Weight (Optional)
          </label>

          <input
            type="text"
            value={formData.weight || ""}
            onChange={(e) => onChange("weight", e.target.value)}
            placeholder="Example: 65 kg"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Emergency Contact Person */}
        <div>
          <label className="mb-2 block font-semibold">
            Emergency Contact Person
          </label>

          <input
            type="text"
            value={formData.emergency_contact_name || ""}
            onChange={(e) =>
              onChange("emergency_contact_name", e.target.value)
            }
            placeholder="Parent / Guardian"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Emergency Contact Number */}
        <div>
          <label className="mb-2 block font-semibold">
            Emergency Contact Number
          </label>

          <input
            type="tel"
            value={formData.emergency_contact_number || ""}
            onChange={(e) =>
              onChange("emergency_contact_number", e.target.value)
            }
            placeholder="+91 XXXXX XXXXX"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

      </div>

      {/* Medical Condition */}
      <div className="mt-8">
        <label className="mb-2 block font-semibold">
          Any Medical Condition?
        </label>

        <textarea
          rows={3}
          value={formData.medical_condition || ""}
          onChange={(e) =>
            onChange("medical_condition", e.target.value)
          }
          placeholder="Mention any medical conditions (if applicable)"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Allergies */}
      <div className="mt-8">
        <label className="mb-2 block font-semibold">
          Allergies
        </label>

        <textarea
          rows={3}
          value={formData.allergies || ""}
          onChange={(e) => onChange("allergies", e.target.value)}
          placeholder="Mention any allergies (if applicable)"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Regular Medication */}
      <div className="mt-8">
        <label className="mb-2 block font-semibold">
          Regular Medication
        </label>

        <textarea
          rows={3}
          value={formData.regular_medication || ""}
          onChange={(e) =>
            onChange("regular_medication", e.target.value)
          }
          placeholder="Mention if you take any regular medication"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
        />
      </div>

    </section>
  );
}