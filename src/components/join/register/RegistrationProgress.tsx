import {
  User,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: User,
    title: "Personal Details",
    description: "Basic personal information",
  },
  {
    icon: GraduationCap,
    title: "Academic Details",
    description: "Course & college information",
  },
  {
    icon: HeartHandshake,
    title: "NSS Information",
    description: "Skills & interests",
  },
  {
    icon: CheckCircle2,
    title: "Review & Submit",
    description: "Declaration & confirmation",
  },
];

export default function RegistrationProgress() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#0F2B7B]">
            Registration Steps
          </h2>

          <p className="mt-3 text-gray-600">
            Complete all sections carefully before submitting your application.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="relative rounded-3xl border bg-slate-50 p-8 shadow-md transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-[#0F2B7B] text-sm font-bold text-white">
                  {index + 1}
                </div>

                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
                  <Icon size={30} />
                </div>

                <h3 className="text-xl font-bold text-[#0F2B7B]">
                  {step.title}
                </h3>

                <p className="mt-3 text-gray-600">
                  {step.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}