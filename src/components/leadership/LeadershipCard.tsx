import Image from "next/image";
import { FaLinkedin } from "react-icons/fa";

interface Props {
  member: any;
}

export default function LeadershipCard({
  member,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-2">

      <Image
        src={member.photo}
        alt={member.name}
        width={400}
        height={400}
        className="h-80 w-full object-cover"
      />

      <div className="p-6">

        <h2 className="text-2xl font-bold text-[#0F2B7B]">

          {member.name}

        </h2>

        <p className="mt-2 font-semibold">

          {member.role}

        </p>

        <p className="text-gray-500">

          {member.department}

        </p>

        {member.linkedin && (

          <a
            href={member.linkedin}
            target="_blank"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0077B5] px-5 py-3 text-white"
          >

            <FaLinkedin size={20} />

            LinkedIn Profile

          </a>

        )}

      </div>

    </div>
  );
}