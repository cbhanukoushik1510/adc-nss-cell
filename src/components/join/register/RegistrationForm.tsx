import PersonalInfo from "./form/PersonalInfo";
import AcademicInfo from "./form/AcademicInfo";
import ContactInfo from "./form/ContactInfo";
import NSSInfo from "./form/NSSInfo";
import MedicalInfo from "./form/MedicalInfo";
import Declaration from "./form/Declaration";
import SubmitSection from "./form/SubmitSection";

export default function RegistrationForm() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">

        <form className="rounded-3xl bg-white p-8 shadow-xl md:p-12">

          <PersonalInfo />

          <AcademicInfo />

          <ContactInfo />

          <NSSInfo />

          <MedicalInfo />

          <Declaration />

          <SubmitSection />

        </form>

      </div>
    </section>
  );
}