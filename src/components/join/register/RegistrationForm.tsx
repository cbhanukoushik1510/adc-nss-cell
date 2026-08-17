"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

import PersonalInfo from "./form/PersonalInfo";
import AcademicInfo from "./form/AcademicInfo";
import ContactInfo from "./form/ContactInfo";
import NSSInfo from "./form/NSSInfo";
import MedicalInfo from "./form/MedicalInfo";
import Declaration from "./form/Declaration";
import SubmitSection from "./form/SubmitSection";

export default function RegistrationForm() {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Check declaration
    if (!formData.declaration_accepted) {
      alert("Please accept the declaration before submitting.");
      return;
    }

    const { error } = await supabase
      .from("volunteers")
      .insert([
        {
          ...formData,
          status: "Pending",
          role: "Volunteer",
        },
      ]);

    if (error) {
  console.log(error);

  alert(JSON.stringify(error, null, 2));

  return;
}

    alert(
      "🎉 Application submitted successfully!\n\nPlease wait for Wing Head approval."
    );

    setFormData({});
  };

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-xl md:p-12"
        >
          <PersonalInfo
            formData={formData}
            onChange={handleChange}
          />

          <AcademicInfo
            formData={formData}
            onChange={handleChange}
          />

          <ContactInfo
            formData={formData}
            onChange={handleChange}
          />

          <NSSInfo
            formData={formData}
            onChange={handleChange}
          />

          <MedicalInfo
            formData={formData}
            onChange={handleChange}
          />

          <Declaration
            formData={formData}
            onChange={handleChange}
          />

          <SubmitSection />
        </form>
      </div>
    </section>
  );
}