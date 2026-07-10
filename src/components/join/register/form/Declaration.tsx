export default function Declaration() {
  return (
    <section className="mb-14">

      <div className="rounded-3xl border border-yellow-300 bg-yellow-50 p-8">

        <h2 className="mb-4 text-3xl font-bold text-[#0F2B7B]">
          Declaration
        </h2>

        <p className="mb-8 text-gray-700 leading-7">
          Please read the following declaration carefully before submitting
          your application.
        </p>

        <div className="space-y-5">

          <label className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm">

            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#0F2B7B]"
            />

            <span>
              I hereby declare that all the information provided in this
              application is true and correct to the best of my knowledge.
            </span>

          </label>

          <label className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm">

            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#0F2B7B]"
            />

            <span>
              I agree to follow all rules, regulations, and code of conduct
              of the National Service Scheme (NSS) and Aurora's Degree & PG
              College.
            </span>

          </label>

          <label className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm">

            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#0F2B7B]"
            />

            <span>
              I understand that my application will be reviewed by the NSS
              Coordinator and Programme Officer before approval.
            </span>

          </label>

          <label className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm">

            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#0F2B7B]"
            />

            <span>
              I am willing to actively participate in NSS programmes,
              community service, awareness campaigns, and special camps.
            </span>

          </label>

        </div>

      </div>

    </section>
  );
}