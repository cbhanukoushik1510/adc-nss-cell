import { Button } from "@/components/ui/button";
import { Send, RotateCcw } from "lucide-react";

export default function SubmitSection() {
  return (
    <section className="pt-6">

      <div className="rounded-3xl bg-[#0F2B7B] p-10 text-center text-white">

        <h2 className="text-3xl font-bold">
          Ready to Submit?
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-blue-100 leading-7">
          Please review all the information before submitting your
          application. Once submitted, your application will be reviewed by
          the NSS Coordinator and Programme Officer.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-5 md:flex-row">

          <Button
            type="submit"
            className="h-14 bg-yellow-400 px-10 text-lg font-bold text-[#0F2B7B] hover:bg-yellow-300"
          >
            <Send className="mr-2 h-5 w-5" />
            Submit Application
          </Button>

          <Button
            type="reset"
            variant="outline"
            className="h-14 border-white bg-transparent px-10 text-lg text-white hover:bg-white hover:text-[#0F2B7B]"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset Form
          </Button>

        </div>

        <div className="mt-10 rounded-2xl bg-white/10 p-6 text-left">

          <h3 className="mb-3 text-xl font-semibold">
            What happens after submission?
          </h3>

          <ul className="space-y-2 text-blue-100">

            <li>✅ Your application will be securely recorded.</li>

            <li>✅ NSS Coordinator will verify your details.</li>

            <li>✅ Programme Officer will review your application.</li>

            <li>✅ After approval, your Volunteer ID will be generated.</li>

            <li>✅ Login credentials will be shared with you.</li>

          </ul>

        </div>

      </div>

    </section>
  );
}