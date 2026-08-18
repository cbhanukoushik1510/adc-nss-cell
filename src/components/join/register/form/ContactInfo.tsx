interface ContactInfoProps {
  formData: any;
  onChange: (name: string, value: any) => void;
}

export default function ContactInfo({
  formData,
  onChange,
}: ContactInfoProps) {
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
            College Email 
          </label>

          <input
            type="email"
            value={formData.college_email || ""}
            onChange={(e) => onChange("college_email", e.target.value)}
            placeholder="student@adc.edu.in"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Personal Email */}
        <div>
          <label className="mb-2 block font-semibold">
            Personal Email <span className="text-red-500">*</span>
          </label>

          <input
            type="email"
            value={formData.personal_email || ""}
            onChange={(e) => onChange("personal_email", e.target.value)}
            placeholder="example@gmail.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="mb-2 block font-semibold">
            Mobile Number <span className="text-red-500">*</span>
          </label>

          <input
            type="tel"
            value={formData.mobile_number || ""}
            onChange={(e) => onChange("mobile_number", e.target.value)}
            placeholder="+91 9876543210"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* WhatsApp Number */}
        <div>
          <label className="mb-2 block font-semibold">
            WhatsApp Number
          </label>

          <input
            type="tel"
            value={formData.whatsapp_number || ""}
            onChange={(e) => onChange("whatsapp_number", e.target.value)}
            placeholder="+91 9876543210"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Emergency Contact Name */}
        <div>
          <label className="mb-2 block font-semibold">
            Emergency Contact Name
          </label>

          <input
            type="text"
            value={formData.emergency_contact_name || ""}
            onChange={(e) =>
              onChange("emergency_contact_name", e.target.value)
            }
            placeholder="Parent / Guardian Name"
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
          value={formData.address || ""}
          onChange={(e) => onChange("address", e.target.value)}
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
            value={formData.city || ""}
            onChange={(e) => onChange("city", e.target.value)}
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
            value={formData.state || ""}
            onChange={(e) => onChange("state", e.target.value)}
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
            value={formData.pincode || ""}
            onChange={(e) => onChange("pincode", e.target.value)}
            placeholder="500020"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

      </div>
    </section>
  );
}