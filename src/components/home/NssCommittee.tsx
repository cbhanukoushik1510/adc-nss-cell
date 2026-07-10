export default function NssCommittee() {
  const members = [
    {
      emoji: "👨‍🏫",
      name: "Dr. Principal Name",
      role: "Principal",
      color: "bg-blue-100",
    },
    {
      emoji: "👩‍🏫",
      name: "Programme Officer",
      role: "NSS Programme Officer",
      color: "bg-green-100",
    },
    {
      emoji: "👨",
      name: "Bhanu Koushik",
      role: "NSS Head",
      color: "bg-yellow-100",
    },
    {
      emoji: "👩",
      name: "Vice Head",
      role: "NSS Vice Head",
      color: "bg-pink-100",
    },
    {
      emoji: "👥",
      name: "Volunteer Coordinators",
      role: "Student Coordinators",
      color: "bg-purple-100",
    },
    {
      emoji: "🎓",
      name: "Faculty Coordinators",
      role: "Faculty Members",
      color: "bg-orange-100",
    },
  ];

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Meet Our NSS Team
          </h2>

          <p className="mt-3 text-gray-600">
            Dedicated leaders working together to build a better society.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {members.map((member, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white p-8 text-center shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-5xl ${member.color}`}
              >
                {member.emoji}
              </div>

              <h3 className="mt-6 text-2xl font-bold text-[#0F2B7B]">
                {member.name}
              </h3>

              <p className="mt-2 text-gray-500">
                {member.role}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}