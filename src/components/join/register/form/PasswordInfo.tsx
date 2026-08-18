"use client";

interface PasswordInfoProps {
  formData: any;
  onChange: (name: string, value: string) => void;
}

export default function PasswordInfo({
  formData,
  onChange,
}: PasswordInfoProps) {
  return (
    <section className="mb-14">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          Create Login Password
        </h2>

        <p className="mt-2 text-gray-600">
          Create a password for your future Volunteer Portal login.
          Please remember this password and keep it safe.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

        <p className="mb-6 leading-7 text-blue-900">
          After your profile is accepted, you will use your{" "}
          <strong>college email</strong> and this password to
          access your Volunteer Portal.
        </p>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Password */}
          <div>
            <label className="mb-2 block font-semibold">
              Create Password{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="password"
              name="password"
              value={formData.password ?? ""}
              onChange={(e) =>
                onChange("password", e.target.value)
              }
              placeholder="Create your password"
              minLength={12}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-sm text-gray-500">
              Minimum 12 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block font-semibold">
              Confirm Password{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword ?? ""}
              onChange={(e) =>
                onChange("confirmPassword", e.target.value)
              }
              placeholder="Confirm your password"
              minLength={12}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        {/* Password match indicator */}
        {formData.confirmPassword && (
          <div
            className={`mt-4 rounded-xl p-3 text-sm font-medium ${
              formData.password === formData.confirmPassword
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {formData.password === formData.confirmPassword
              ? "✓ Passwords match"
              : "✕ Passwords do not match"}
          </div>
        )}

        <div className="mt-6 rounded-xl bg-white p-4 text-sm text-gray-700">
          🔐 <strong>Important:</strong> Save this password safely.
          You will use your college email and this password for
          Volunteer Portal login after your profile is accepted.
        </div>

      </div>
    </section>
  );
}