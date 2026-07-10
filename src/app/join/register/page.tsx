import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import RegistrationHero from "@/components/join/register/RegistrationHero";
import RegistrationProgress from "@/components/join/register/RegistrationProgress";
import RegistrationForm from "@/components/join/register/RegistrationForm";

export default function RegisterPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">
        <RegistrationHero />

        <RegistrationProgress />

        <RegistrationForm />
      </main>

      <Footer />
    </>
  );
}