import {
  FileText,
  UserCheck,
  ShieldCheck,
  IdCard,
  PartyPopper,
} from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Fill Registration Form",
    description:
      "Complete the online volunteer registration form with your academic and personal details.",
  },
  {
    icon: UserCheck,
    title: "Coordinator Review",
    description:
      "The NSS Coordinator reviews your application and verifies the submitted information.",
  },
  {
    icon: ShieldCheck,
    title: "Programme Officer Approval",
    description:
      "The Programme Officer approves eligible applications for NSS membership.",
  },
  {
    icon: IdCard,
    title: "Volunteer ID Creation",
    description:
      "Your NSS Volunteer ID and profile are created in the NSS Management System.",
  },
  {
    icon: PartyPopper,
    title: "Welcome to Aurora NSS",
    description:
      "Congratulations! You officially become an NSS Volunteer and can participate in all activities.",
  },
];

export default function RegistrationProcess() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Registration Process
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Follow these simple steps to become an NSS Volunteer.
          </p>
        </div>

        <div className="relative">

          {/* Vertical Line */}
          <div className="absolute left-8 top-0 h-full w-1 bg-blue-200 hidden md:block"></div>

          <div className="space-y-10">

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={index}
                  className="relative flex flex-col gap-6 rounded-3xl bg-slate-50 p-8 shadow-lg md:flex-row md:items-center"
                >

                  <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#0F2B7B] text-white shadow-lg">
                    <Icon size={30} />
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center gap-4">

                      <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-[#0F2B7B]">
                        Step {index + 1}
                      </span>

                      <h3 className="text-2xl font-bold text-[#0F2B7B]">
                        {step.title}
                      </h3>

                    </div>

                    <p className="mt-4 text-gray-600 leading-7">
                      {step.description}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>
    </section>
  );
}