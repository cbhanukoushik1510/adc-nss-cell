"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface PersonalInfoProps {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export default function PersonalInfo({
  formData,
  onChange,
}: PersonalInfoProps) {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Photo must be smaller than 2MB.");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const filePath = `volunteers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("volunteer-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        alert("Photo upload failed. Please try again.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("volunteer-photos")
        .getPublicUrl(filePath);

      onChange("photo_url", publicUrl);

      alert("Photo uploaded successfully!");
    } catch (error) {
      console.error("Photo upload error:", error);
      alert("Something went wrong while uploading the photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="mb-14">
      {/* Heading */}
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
            value={formData.full_name || ""}
            onChange={(e) => onChange("full_name", e.target.value)}
            placeholder="Enter your full name"
            required
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
            value={formData.roll_number || ""}
            onChange={(e) => onChange("roll_number", e.target.value)}
            placeholder="Enter roll number"
            required
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
            value={formData.hall_ticket_number || ""}
            onChange={(e) =>
              onChange("hall_ticket_number", e.target.value)
            }
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
            value={formData.date_of_birth || ""}
            onChange={(e) => onChange("date_of_birth", e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="mb-2 block font-semibold">
            Gender <span className="text-red-500">*</span>
          </label>

          <select
            value={formData.gender || ""}
            onChange={(e) => onChange("gender", e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

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
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* Passport Photo */}
      <div className="mt-8">
        <label className="mb-2 block font-semibold">
          Passport Size Photo
        </label>

        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50 p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Preview */}
            {formData.photo_url ? (
              <div className="relative h-32 w-28 overflow-hidden rounded-xl border bg-white">
                <Image
                  src={formData.photo_url}
                  alt="Volunteer passport photo"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-32 w-28 items-center justify-center rounded-xl border bg-white text-center text-sm text-gray-400">
                Photo
              </div>
            )}

            <div className="text-center sm:text-left">
              <input
                id="volunteer-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#0F2B7B] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#143a96]"
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG or WebP • Maximum 2MB
              </p>

              {uploading && (
                <p className="mt-2 text-sm font-medium text-[#0F2B7B]">
                  Uploading photo...
                </p>
              )}

              {formData.photo_url && !uploading && (
                <p className="mt-2 text-sm font-medium text-green-600">
                  ✓ Photo uploaded
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}