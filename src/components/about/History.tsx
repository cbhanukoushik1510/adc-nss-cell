import { HeartHandshake } from "lucide-react";

export default function History() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2">

        <div>

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            What is NSS?
          </h2>

          <p className="mt-8 text-lg leading-8 text-gray-600">
            The National Service Scheme (NSS) was launched in 1969 with the
            objective of developing the personality and character of students
            through voluntary community service.
          </p>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            NSS provides students with opportunities to participate in social,
            educational, environmental, and health-related programmes that
            create positive change in society while building leadership and
            teamwork skills.
          </p>

        </div>

        <div className="flex items-center justify-center">

          <div className="rounded-3xl bg-[#0F2B7B] p-10 text-center text-white shadow-xl">

            <HeartHandshake
              size={70}
              className="mx-auto mb-6"
            />

            <h3 className="text-3xl font-bold">
              Our Motto
            </h3>

            <p className="mt-6 text-2xl italic text-yellow-300">
              "Not Me, But You"
            </p>

            <p className="mt-6 text-blue-100">
              The motto reflects the essence of democratic living and the need
              for selfless service towards society.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}