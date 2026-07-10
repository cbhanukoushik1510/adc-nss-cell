import { Clock3, Sparkles } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({
  title,
  description,
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow-xl">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Clock3 className="h-10 w-10 text-[#0F2B7B]" />
        </div>

        <h1 className="mt-6 text-4xl font-bold text-[#0F2B7B]">
          {title}
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          {description ??
            "We're currently building this module. It will be available in a future update."}
        </p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
          <Sparkles className="h-4 w-4" />
          Coming Soon
        </div>

        <div className="mt-10">
          <Link
            href="/volunteer/dashboard"
            className="rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#12379b]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}