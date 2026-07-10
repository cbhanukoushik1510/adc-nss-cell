"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Who can join the NSS?",
    answer:
      "Any regular student of Aurora's Degree & PG College with an interest in community service and social responsibility can apply to become an NSS volunteer.",
  },
  {
    question: "Is there any registration fee?",
    answer:
      "No. Joining the National Service Scheme is completely free for eligible students.",
  },
  {
    question: "Will I receive an NSS Certificate?",
    answer:
      "Yes. Volunteers who actively participate in NSS activities and complete the required service hours will be eligible for certificates as per NSS guidelines.",
  },
  {
    question: "How many service hours are required?",
    answer:
      "Service hours depend on NSS guidelines and college requirements. Volunteers are expected to participate regularly in activities throughout the academic year.",
  },
  {
    question: "Can I participate in all NSS events?",
    answer:
      "Yes. Registered volunteers can participate in all eligible NSS programmes, subject to event capacity and coordinator approval.",
  },
  {
    question: "How will I know if my application is approved?",
    answer:
      "Once your application is reviewed and approved by the NSS Coordinator and Programme Officer, you will receive your volunteer login credentials.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">

        <div className="mb-14 text-center">

          <HelpCircle
            size={55}
            className="mx-auto text-[#0F2B7B]"
          />

          <h2 className="mt-4 text-4xl font-bold text-[#0F2B7B]">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Have questions about joining NSS? Here are some commonly asked
            questions.
          </p>

        </div>

        <div className="space-y-5">

          {faqs.map((faq, index) => {

            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-50 shadow-sm"
              >

                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >

                  <span className="text-lg font-semibold text-[#0F2B7B]">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />

                </button>

                {isOpen && (
                  <div className="border-t bg-white px-6 py-5 text-gray-600 leading-7">
                    {faq.answer}
                  </div>
                )}

              </div>
            );

          })}

        </div>

      </div>
    </section>
  );
}