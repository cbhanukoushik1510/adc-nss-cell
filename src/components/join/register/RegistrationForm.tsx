"use client";

import { useState } from "react";

import PersonalInfo from "./form/PersonalInfo";
import AcademicInfo from "./form/AcademicInfo";
import ContactInfo from "./form/ContactInfo";
import NSSInfo from "./form/NSSInfo";
import MedicalInfo from "./form/MedicalInfo";
import PasswordInfo from "./form/PasswordInfo";
import Declaration from "./form/Declaration";

import { Button } from "@/components/ui/button";
import { RotateCcw, Send } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function RegistrationForm() {
  const [formData, setFormData] = useState<any>({});

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  /* --------------------------------
     Handle field changes
  -------------------------------- */

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* --------------------------------
     Reset form
  -------------------------------- */

  const handleReset = () => {
    setFormData({});
    setMessage("");
    setMessageType("");
  };

  /* --------------------------------
     Submit
  -------------------------------- */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    /* -----------------------------
       Basic validation
    ----------------------------- */

    if (!formData.college_email) {
      setMessage("Please enter your college email.");
      setMessageType("error");
      return;
    }

    if (!formData.password) {
      setMessage("Please create a login password.");
      setMessageType("error");
      return;
    }

    if (formData.password.length < 12) {
      setMessage(
        "Password must contain at least 12 characters."
      );
      setMessageType("error");
      return;
    }

    if (!formData.confirmPassword) {
      setMessage("Please confirm your password.");
      setMessageType("error");
      return;
    }

    if (
      String(formData.password) !==
      String(formData.confirmPassword)
    ) {
      setMessage(
        "Passwords do not match. Please enter the same password in both fields."
      );
      setMessageType("error");
      return;
    }

    if (!formData.declaration_accepted) {
      setMessage(
        "Please accept all required declarations before submitting."
      );
      setMessageType("error");
      return;
    }

    setSubmitting(true);

    try {
      /* -----------------------------
         1. Create Supabase Auth user
      ----------------------------- */

      const email = String(
        formData.college_email || ""
      )
        .trim()
        .toLowerCase();

      console.log(
        "Email being sent to Supabase:",
        email
      );

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signUp({
        email,
        password: formData.password,

        options: {
          data: {
            full_name: formData.full_name || "",
          },
        },
      });

      if (authError) {
        console.error(
          "Supabase Auth Error:",
          authError
        );

        setMessage(authError.message);
        setMessageType("error");
        return;
      }

      if (!authData.user) {
        setMessage(
          "Unable to create your login account. Please try again."
        );
        setMessageType("error");
        return;
      }

      /* -----------------------------
         2. Save volunteer application
      ----------------------------- */

      const volunteerData = {
        auth_user_id: authData.user.id,

        /* Personal */

        full_name:
          formData.full_name || null,

        roll_number:
          formData.roll_number || null,

        hall_ticket_number:
          formData.hall_ticket_number || null,

        date_of_birth:
          formData.date_of_birth || null,

        gender:
          formData.gender || null,

        blood_group:
          formData.blood_group || null,

        /* Academic */

        department:
          formData.department || null,

        course:
          formData.course || null,

        year:
          formData.year || null,

        semester:
          formData.semester || null,

        section:
          formData.section || null,

        academic_year:
          formData.academic_year || null,

        college_id:
          formData.college_id || null,

        admission_number:
          formData.admission_number || null,

        /* Contact */

        college_email:
          email || null,

        personal_email:
          formData.personal_email || null,

        mobile_number:
          formData.mobile_number || null,

        whatsapp_number:
          formData.whatsapp_number || null,

        emergency_contact_name:
          formData.emergency_contact_name || null,

        emergency_contact_number:
          formData.emergency_contact_number || null,

        address:
          formData.address || null,

        city:
          formData.city || null,

        state:
          formData.state || null,

        pincode:
          formData.pincode || null,

        /* NSS */

        skills:
          formData.skills || null,

        languages_known:
          formData.languages_known || null,

        previous_volunteer_experience:
          formData.previous_volunteer_experience ||
          null,

        why_join_nss:
          formData.why_join_nss || null,

        areas_of_interest:
          formData.areas_of_interest || [],

        availability:
          formData.availability || null,

        /* Medical */

        height:
          formData.height || null,

        weight:
          formData.weight || null,

        medical_condition:
          formData.medical_condition || null,

        allergies:
          formData.allergies || null,

        regular_medication:
          formData.regular_medication || null,

        /* Declaration */

        declaration_accepted:
          formData.declaration_accepted || false,

        /* Photo */

        photo_url:
          formData.photo_url || null,

        /* Status */

        status: "Pending",
      };

      const {
        error: volunteerError,
      } = await supabase
        .from("volunteers")
        .insert(volunteerData);

      if (volunteerError) {
        console.error(
          "Volunteer Insert Error:",
          volunteerError
        );

        setMessage(
          "Your login account was created, but your volunteer application could not be saved. Please contact the administrator."
        );

        setMessageType("error");

        return;
      }

      /* -----------------------------
         3. Success
      ----------------------------- */

      setMessage(
        "Registration successful! Your application is now pending verification. Please wait for background verification and profile acceptance."
      );

      setMessageType("success");

      /* Clear form */

      setFormData({});

    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      setMessage(
        "Something went wrong while submitting your application. Please try again."
      );

      setMessageType("error");

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-50 py-16">

      <div className="mx-auto max-w-7xl px-6">

        <form
          onSubmit={handleSubmit}
          onReset={handleReset}
          className="rounded-3xl bg-white p-8 shadow-xl md:p-12"
        >

          {/* =========================================
              TOP MESSAGE
          ========================================= */}

          {message && (
            <div
              className={`mb-8 rounded-2xl border p-5 ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <p className="font-semibold">
                {message}
              </p>
            </div>
          )}

          {/* =========================================
              FORM SECTIONS
          ========================================= */}

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

          <PasswordInfo
            formData={formData}
            onChange={handleChange}
          />

          <Declaration
            formData={formData}
            onChange={handleChange}
          />

          {/* =========================================
              BUTTONS
          ========================================= */}

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            {/* Submit */}

            <Button
              type="submit"
              disabled={submitting}
              className="h-14 bg-[#0F2B7B] px-8 text-lg font-bold text-white hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="mr-2 h-5 w-5" />

              {submitting
                ? "Submitting Application..."
                : "Submit Application"}
            </Button>

            {/* Reset */}

            <Button
              type="reset"
              disabled={submitting}
              variant="outline"
              className="h-14 border-[#0F2B7B] px-8 text-lg font-semibold text-[#0F2B7B] hover:bg-[#0F2B7B] hover:text-white"
            >
              <RotateCcw className="mr-2 h-5 w-5" />

              Reset Form
            </Button>

          </div>

        </form>

        {/* =========================================
            POPUP
        ========================================= */}

        {message && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">

              {messageType === "success" ? (
                <>
                  {/* Success Icon */}

                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                    ✓
                  </div>

                  {/* Heading */}

                  <h2 className="text-2xl font-bold text-[#0F2B7B]">
                    Registration Successful
                  </h2>

                  {/* Message */}

                  <p className="mt-4 leading-7 text-gray-600">
                    Your application has been submitted
                    successfully.
                  </p>

                  <p className="mt-2 leading-7 text-gray-600">
                    Please wait for{" "}
                    <strong>
                      background verification
                    </strong>{" "}
                    and{" "}
                    <strong>
                      profile acceptance
                    </strong>.
                  </p>

                  {/* Continue */}

                  <button
                    type="button"
                    onClick={() => {
                      setMessage("");
                      setMessageType("");
                    }}
                    className="mt-7 w-full rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#143a96]"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  {/* Error Icon */}

                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
                    !
                  </div>

                  {/* Heading */}

                  <h2 className="text-2xl font-bold text-red-700">
                    Registration Error
                  </h2>

                  {/* Error Message */}

                  <p className="mt-4 leading-7 text-gray-600">
                    {message}
                  </p>

                  {/* Close */}

                  <button
                    type="button"
                    onClick={() => {
                      setMessage("");
                      setMessageType("");
                    }}
                    className="mt-7 w-full rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#143a96]"
                  >
                    Close
                  </button>
                </>
              )}

            </div>

          </div>
        )}

      </div>

    </section>
  );
}