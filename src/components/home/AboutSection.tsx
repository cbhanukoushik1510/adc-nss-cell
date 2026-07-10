import { Button } from "@/components/ui/button";

export default function AboutSection() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition">
      <h2 className="mb-5 text-3xl font-bold text-[#0F2B7B]">
        About NSS
      </h2>

      <div className="mb-5 h-1 w-16 rounded bg-[#0F2B7B]" />

      <p className="leading-8 text-gray-600">
        The National Service Scheme (NSS) is a voluntary organization
        under the Ministry of Youth Affairs & Sports, Government of India.
        It aims to develop the personality of students through community
        service and social responsibility.
      </p>

      <Button className="mt-8 bg-[#0F2B7B] hover:bg-[#16398F]">
        Know More
      </Button>
    </div>
  );
}