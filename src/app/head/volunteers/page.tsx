import Hero from "@/components/management/volunteers/Hero";
import StatsCards from "@/components/management/volunteers/StatsCards";
import VolunteerFilters from "@/components/management/volunteers/VolunteerFilters";
import VolunteerTable from "@/components/management/volunteers/VolunteerTable";

export default function VolunteersPage() {
  return (
    <main className="space-y-8">

      <Hero />

      <StatsCards />

      <VolunteerFilters />

      <VolunteerTable />

    </main>
  );
}