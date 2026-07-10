import { Link } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa6";

export default function SocialMedia() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-5xl text-center">

        <h2 className="text-4xl font-bold text-[#0F2B7B]">

          Follow Us

        </h2>

        <p className="mt-4 text-gray-600">

          Stay connected with our latest NSS activities and announcements.

        </p>

        <a
                    href="https://www.instagram.com/nss_aurora_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(45deg,#F58529,#FEDA77,#DD2A7B,#8134AF,#515BD4)",
                    }}
                  >
                    <FaInstagram size={28} color="white" />
                  </a>

      </div>

    </section>
  );
}