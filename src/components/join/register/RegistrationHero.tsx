import { ClipboardCheck } from "lucide-react";

export default function RegistrationHero() {
  return (
    <section className="bg-gradient-to-r from-[#0F2B7B] to-[#1746A2] py-20 text-white">
      <div className="mx-auto max-w-6xl px-6 text-center">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
          <ClipboardCheck size={50} />
        </div>

        <h1 className="mt-8 text-5xl font-bold">
          NSS Volunteer Registration
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">
          Thank you for choosing to become a part of the National Service
          Scheme. Complete the registration form carefully. After submission,
          your application will be reviewed by the NSS Coordinator and
          Programme Officer.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-8">

          <div className="rounded-xl bg-white/10 px-6 py-4 backdrop-blur">
            ⏱ Estimated Time
            <br />
            <span className="font-bold">5 Minutes</span>
          </div>

          <div className="rounded-xl bg-white/10 px-6 py-4 backdrop-blur">
            📄 Application Type
            <br />
            <span className="font-bold">New Volunteer</span>
          </div>

          <div className="rounded-xl bg-white/10 px-6 py-4 backdrop-blur">
            👨‍💼 Status
            <br />
            <span className="font-bold">Pending Review</span>
          </div>

        </div>

      </div>
    </section>
  );
}