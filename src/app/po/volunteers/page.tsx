"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  UserCheck,
  Clock3,
  ShieldCheck,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CalendarDays,
  HeartPulse,
  Award,
  Briefcase,
  Languages,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Volunteer = {
  id: string;
  full_name: string;
  roll_number: string;
  hall_ticket_number: string | null;
  date_of_birth: string | null;
  gender: string;
  blood_group: string | null;
  photo_url: string | null;

  department: string;
  course: string | null;
  year: string;
  semester: string | null;
  section: string | null;
  academic_year: string | null;
  college_id: string | null;
  admission_number: string | null;

  college_email: string;
  personal_email: string | null;
  mobile_number: string;
  whatsapp_number: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;

  emergency_contact_name: string | null;
  emergency_contact_number: string | null;

  nss_unit: string | null;
  skills: string | null;
  languages_known: string | null;
  previous_volunteer_experience: string | null;
  why_join_nss: string | null;

  areas_of_interest: string[] | null;
  availability: string | null;

  height: string | null;
  weight: string | null;
  medical_condition: string | null;
  allergies: string | null;
  regular_medication: string | null;

  declaration_accepted: boolean | null;

  status: string | null;
  role: string | null;
  service_hours: number | null;
  attendance_percentage: number | null;
  certificates_count: number | null;

  created_at: string | null;
  updated_at: string | null;

  auth_user_id: string | null;
  approved_at: string | null;
  approved_by: string | null;

  volunteer_id: string | null;
  verification_status: string | null;
};

type FilterValue = string;

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => Boolean(value))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalize(value: string | null | undefined) {
  return String(value ?? "").toLowerCase().trim();
}

function statusLabel(value: string | null) {
  const normalized = normalize(value);

  if (!normalized) return "Unknown";

  if (normalized === "active") return "Active";
  if (normalized === "approved") return "Approved";
  if (normalized === "pending") return "Pending";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "inactive") return "Inactive";

  return value || "Unknown";
}

function statusClass(value: string | null) {
  const normalized = normalize(value);

  if (
    normalized === "active" ||
    normalized === "approved" ||
    normalized === "verified"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized === "pending") {
    return "bg-amber-50 text-amber-700";
  }

  if (normalized === "rejected" || normalized === "inactive") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

function verificationClass(value: string | null) {
  const normalized = normalize(value);

  if (
    normalized === "verified" ||
    normalized === "approved" ||
    normalized === "approved"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized === "pending") {
    return "bg-amber-50 text-amber-700";
  }

  if (normalized === "rejected") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: FilterValue;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#12358f] focus:ring-2 focus:ring-[#12358f]/10"
      >
        <option value="">All</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#12358f]">
          {icon}
        </div>

        <div className="text-right">
          <p className="font-serif text-2xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Users size={25} />
      </div>

      <h3 className="font-serif text-lg font-bold text-slate-900">
        No volunteers found
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Try changing the search or filters.
      </p>
    </div>
  );
}

function VolunteerAvatar({
  volunteer,
  large = false,
}: {
  volunteer: Volunteer;
  large?: boolean;
}) {
  const size = large ? "h-20 w-20" : "h-11 w-11";

  if (volunteer.photo_url) {
    return (
      <img
        src={volunteer.photo_url}
        alt=""
        className={`${size} shrink-0 rounded-full object-cover ring-2 ring-slate-100`}
      />
    );
  }

  const initial = volunteer.full_name?.trim()?.charAt(0)?.toUpperCase() || "V";

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#12358f] font-bold text-white`}
    >
      {initial}
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-[#12358f]">
        {icon}

        <span className="text-xs font-semibold">{label}</span>
      </div>

      <p className="break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

export default function POVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [academicYear, setAcademicYear] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [nssUnit, setNssUnit] = useState("");

  const [selectedVolunteer, setSelectedVolunteer] =
    useState<Volunteer | null>(null);

  const loadVolunteers = useCallback(async () => {
    try {
      setRefreshing(true);

      const { data, error } = await supabase
        .from("volunteers")
        .select(`
          id,
          full_name,
          roll_number,
          hall_ticket_number,
          date_of_birth,
          gender,
          blood_group,
          photo_url,
          department,
          course,
          year,
          semester,
          section,
          academic_year,
          college_id,
          admission_number,
          college_email,
          personal_email,
          mobile_number,
          whatsapp_number,
          address,
          city,
          state,
          pincode,
          emergency_contact_name,
          emergency_contact_number,
          nss_unit,
          skills,
          languages_known,
          previous_volunteer_experience,
          why_join_nss,
          areas_of_interest,
          availability,
          height,
          weight,
          medical_condition,
          allergies,
          regular_medication,
          declaration_accepted,
          status,
          role,
          service_hours,
          attendance_percentage,
          certificates_count,
          created_at,
          updated_at,
          auth_user_id,
          approved_at,
          approved_by,
          volunteer_id,
          verification_status
        `)
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Volunteers loading error:", error);
        throw error;
      }

      setVolunteers((data as Volunteer[]) || []);
    } catch (error) {
      console.error("Failed to load volunteers:", error);
      setVolunteers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers]);

  const academicYears = useMemo(
    () => uniqueValues(volunteers.map((item) => item.academic_year)),
    [volunteers]
  );

  const departments = useMemo(
    () => uniqueValues(volunteers.map((item) => item.department)),
    [volunteers]
  );

  const courses = useMemo(
    () => uniqueValues(volunteers.map((item) => item.course)),
    [volunteers]
  );

  const years = useMemo(
    () => uniqueValues(volunteers.map((item) => item.year)),
    [volunteers]
  );

  const sections = useMemo(
    () => uniqueValues(volunteers.map((item) => item.section)),
    [volunteers]
  );

  const nssUnits = useMemo(
    () => uniqueValues(volunteers.map((item) => item.nss_unit)),
    [volunteers]
  );

  const filteredVolunteers = useMemo(() => {
    const query = normalize(search);

    return volunteers.filter((volunteer) => {
      const matchesSearch =
        !query ||
        [
          volunteer.full_name,
          volunteer.roll_number,
          volunteer.volunteer_id,
          volunteer.hall_ticket_number,
          volunteer.admission_number,
          volunteer.college_email,
          volunteer.personal_email,
          volunteer.mobile_number,
          volunteer.department,
          volunteer.course,
        ].some((value) => normalize(value).includes(query));

      const matchesAcademicYear =
        !academicYear || volunteer.academic_year === academicYear;

      const matchesDepartment =
        !department || volunteer.department === department;

      const matchesCourse = !course || volunteer.course === course;

      const matchesYear = !year || volunteer.year === year;

      const matchesSection = !section || volunteer.section === section;

      const matchesNssUnit = !nssUnit || volunteer.nss_unit === nssUnit;

      return (
        matchesSearch &&
        matchesAcademicYear &&
        matchesDepartment &&
        matchesCourse &&
        matchesYear &&
        matchesSection &&
        matchesNssUnit
      );
    });
  }, [
    volunteers,
    search,
    academicYear,
    department,
    course,
    year,
    section,
    nssUnit,
  ]);

  const totalVolunteers = volunteers.length;

  const activeVolunteers = volunteers.filter((volunteer) => {
    const status = normalize(volunteer.status);
    return status === "active" || status === "approved";
  }).length;

  const pendingVolunteers = volunteers.filter((volunteer) => {
    const status = normalize(volunteer.status);
    const verification = normalize(volunteer.verification_status);

    return status === "pending" || verification === "pending";
  }).length;

  const verifiedVolunteers = volunteers.filter((volunteer) => {
    const verification = normalize(volunteer.verification_status);

    return (
      verification === "verified" ||
      verification === "approved"
    );
  }).length;

  function clearFilters() {
    setAcademicYear("");
    setDepartment("");
    setCourse("");
    setYear("");
    setSection("");
    setNssUnit("");
    setSearch("");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-52 rounded bg-slate-200" />
            <div className="h-4 w-80 rounded bg-slate-200" />

            <div className="grid gap-4 md:grid-cols-4">
              <div className="h-28 rounded-2xl bg-white" />
              <div className="h-28 rounded-2xl bg-white" />
              <div className="h-28 rounded-2xl bg-white" />
              <div className="h-28 rounded-2xl bg-white" />
            </div>

            <div className="h-32 rounded-2xl bg-white" />
            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
          {/* HEADER */}
          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 text-xs text-slate-400">
                Program Officer Portal
                <span className="mx-2">›</span>
                Volunteers
              </div>

              <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-950">
                Volunteers
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and monitor NSS volunteer profiles and participation
                information.
              </p>
            </div>

            <button
              type="button"
              onClick={loadVolunteers}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* STATISTICS */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users size={20} />}
              value={totalVolunteers}
              label="Total Volunteers"
            />

            <StatCard
              icon={<UserCheck size={20} />}
              value={activeVolunteers}
              label="Active Volunteers"
            />

            <StatCard
              icon={<Clock3 size={20} />}
              value={pendingVolunteers}
              label="Pending"
            />

            <StatCard
              icon={<ShieldCheck size={20} />}
              value={verifiedVolunteers}
              label="Verified"
            />
          </div>

          {/* SEARCH + FILTERS */}
          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Search Volunteers
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, roll number, volunteer ID, email, mobile..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#12358f] focus:bg-white focus:ring-2 focus:ring-[#12358f]/10"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <SelectFilter
                label="Academic Year"
                value={academicYear}
                onChange={setAcademicYear}
                options={academicYears}
              />

              <SelectFilter
                label="Department"
                value={department}
                onChange={setDepartment}
                options={departments}
              />

              <SelectFilter
                label="Course"
                value={course}
                onChange={setCourse}
                options={courses}
              />

              <SelectFilter
                label="Year"
                value={year}
                onChange={setYear}
                options={years}
              />

              <SelectFilter
                label="Section"
                value={section}
                onChange={setSection}
                options={sections}
              />

              <SelectFilter
                label="NSS Unit"
                value={nssUnit}
                onChange={setNssUnit}
                options={nssUnits}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {filteredVolunteers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                  {totalVolunteers}
                </span>{" "}
                volunteers
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="text-left text-xs font-semibold text-[#12358f] hover:underline sm:text-right"
              >
                Clear all filters
              </button>
            </div>
          </section>

          {/* VOLUNTEER LIST */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-950">
                  Volunteer Directory
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select a volunteer to view the complete profile.
                </p>
              </div>
            </div>

            {filteredVolunteers.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Volunteer
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Academic
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Department / Course
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            NSS Unit
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredVolunteers.map((volunteer) => (
                          <tr
                            key={volunteer.id}
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <VolunteerAvatar volunteer={volunteer} />

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-900">
                                    {volunteer.full_name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {volunteer.volunteer_id ||
                                      volunteer.roll_number}
                                  </p>

                                  {volunteer.college_email && (
                                    <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                                      {volunteer.college_email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-800">
                                {volunteer.year || "—"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {volunteer.academic_year || "Academic year —"}
                              </p>

                              {volunteer.section && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  Section {volunteer.section}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[190px] truncate text-sm font-medium text-slate-800">
                                {volunteer.department || "—"}
                              </p>

                              <p className="mt-0.5 max-w-[190px] truncate text-xs text-slate-500">
                                {volunteer.course || "Course —"}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#12358f]">
                                {volunteer.nss_unit || "Not assigned"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-col items-start gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                                    volunteer.status
                                  )}`}
                                >
                                  {statusLabel(volunteer.status)}
                                </span>

                                {volunteer.verification_status && (
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${verificationClass(
                                      volunteer.verification_status
                                    )}`}
                                  >
                                    {statusLabel(
                                      volunteer.verification_status
                                    )}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedVolunteer(volunteer)
                                }
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-[#12358f] hover:text-[#12358f]"
                              >
                                <Eye size={15} />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MOBILE / TABLET CARDS */}
                <div className="grid gap-4 lg:hidden">
                  {filteredVolunteers.map((volunteer) => (
                    <article
                      key={volunteer.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <VolunteerAvatar volunteer={volunteer} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              {volunteer.full_name}
                            </h3>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(
                                volunteer.status
                              )}`}
                            >
                              {statusLabel(volunteer.status)}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {volunteer.volunteer_id ||
                              volunteer.roll_number}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {volunteer.department || "Department —"}
                            {volunteer.course
                              ? ` • ${volunteer.course}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <MiniInfo
                          label="Year"
                          value={volunteer.year || "—"}
                        />

                        <MiniInfo
                          label="Section"
                          value={volunteer.section || "—"}
                        />

                        <MiniInfo
                          label="Academic Year"
                          value={volunteer.academic_year || "—"}
                        />

                        <MiniInfo
                          label="NSS Unit"
                          value={volunteer.nss_unit || "—"}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedVolunteer(volunteer)}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#12358f] text-sm font-semibold text-[#12358f] transition hover:bg-[#12358f] hover:text-white"
                      >
                        <Eye size={16} />
                        View Full Profile
                      </button>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* PROFILE DRAWER */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close profile"
            onClick={() => setSelectedVolunteer(null)}
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-[650px] overflow-y-auto bg-white shadow-2xl">
            {/* DRAWER HEADER */}
            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Volunteer Profile
                  </p>

                  <h2 className="mt-1 font-serif text-xl font-bold text-slate-950">
                    {selectedVolunteer.full_name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVolunteer(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-7 p-6">
              {/* PROFILE INTRO */}
              <section className="rounded-2xl bg-[#102f8f] p-6 text-white">
                <div className="flex items-center gap-4">
                  <VolunteerAvatar
                    volunteer={selectedVolunteer}
                    large
                  />

                  <div className="min-w-0">
                    <h3 className="font-serif text-2xl font-bold">
                      {selectedVolunteer.full_name}
                    </h3>

                    <p className="mt-1 text-sm text-white/75">
                      {selectedVolunteer.volunteer_id ||
                        selectedVolunteer.roll_number}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
                        {statusLabel(selectedVolunteer.status)}
                      </span>

                      {selectedVolunteer.verification_status && (
                        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold">
                          {statusLabel(
                            selectedVolunteer.verification_status
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ACADEMIC */}
              <section>
                <SectionTitle
                  icon={<GraduationCap size={18} />}
                  title="Academic Information"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={<Users size={16} />}
                    label="Roll Number"
                    value={selectedVolunteer.roll_number}
                  />

                  <InfoBox
                    icon={<Briefcase size={16} />}
                    label="Volunteer ID"
                    value={selectedVolunteer.volunteer_id || "—"}
                  />

                  <InfoBox
                    icon={<GraduationCap size={16} />}
                    label="Department"
                    value={selectedVolunteer.department}
                  />

                  <InfoBox
                    icon={<GraduationCap size={16} />}
                    label="Course"
                    value={selectedVolunteer.course || "—"}
                  />

                  <InfoBox
                    icon={<CalendarDays size={16} />}
                    label="Year"
                    value={selectedVolunteer.year}
                  />

                  <InfoBox
                    icon={<CalendarDays size={16} />}
                    label="Semester"
                    value={selectedVolunteer.semester || "—"}
                  />

                  <InfoBox
                    icon={<Users size={16} />}
                    label="Section"
                    value={selectedVolunteer.section || "—"}
                  />

                  <InfoBox
                    icon={<CalendarDays size={16} />}
                    label="Academic Year"
                    value={selectedVolunteer.academic_year || "—"}
                  />

                  <InfoBox
                    icon={<Briefcase size={16} />}
                    label="Admission Number"
                    value={selectedVolunteer.admission_number || "—"}
                  />

                  <InfoBox
                    icon={<Briefcase size={16} />}
                    label="Hall Ticket Number"
                    value={selectedVolunteer.hall_ticket_number || "—"}
                  />
                </div>
              </section>

              {/* CONTACT */}
              <section>
                <SectionTitle
                  icon={<Phone size={18} />}
                  title="Contact Information"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={<Mail size={16} />}
                    label="College Email"
                    value={selectedVolunteer.college_email}
                  />

                  <InfoBox
                    icon={<Mail size={16} />}
                    label="Personal Email"
                    value={selectedVolunteer.personal_email || "—"}
                  />

                  <InfoBox
                    icon={<Phone size={16} />}
                    label="Mobile Number"
                    value={selectedVolunteer.mobile_number}
                  />

                  <InfoBox
                    icon={<Phone size={16} />}
                    label="WhatsApp Number"
                    value={selectedVolunteer.whatsapp_number || "—"}
                  />
                </div>
              </section>

              {/* PERSONAL */}
              <section>
                <SectionTitle
                  icon={<Users size={18} />}
                  title="Personal Information"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={<CalendarDays size={16} />}
                    label="Date of Birth"
                    value={formatDate(selectedVolunteer.date_of_birth)}
                  />

                  <InfoBox
                    icon={<Users size={16} />}
                    label="Gender"
                    value={selectedVolunteer.gender}
                  />

                  <InfoBox
                    icon={<HeartPulse size={16} />}
                    label="Blood Group"
                    value={selectedVolunteer.blood_group || "—"}
                  />

                  <InfoBox
                    icon={<Users size={16} />}
                    label="NSS Unit"
                    value={selectedVolunteer.nss_unit || "—"}
                  />
                </div>
              </section>

              {/* ADDRESS */}
              <section>
                <SectionTitle
                  icon={<MapPin size={18} />}
                  title="Address"
                />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-700">
                    {selectedVolunteer.address || "Address not provided"}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {[
                      selectedVolunteer.city,
                      selectedVolunteer.state,
                      selectedVolunteer.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Location not provided"}
                  </p>
                </div>
              </section>

              {/* EMERGENCY */}
              <section>
                <SectionTitle
                  icon={<Phone size={18} />}
                  title="Emergency Contact"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={<Users size={16} />}
                    label="Contact Name"
                    value={
                      selectedVolunteer.emergency_contact_name || "—"
                    }
                  />

                  <InfoBox
                    icon={<Phone size={16} />}
                    label="Contact Number"
                    value={
                      selectedVolunteer.emergency_contact_number || "—"
                    }
                  />
                </div>
              </section>

              {/* NSS */}
              <section>
                <SectionTitle
                  icon={<Award size={18} />}
                  title="NSS & Volunteer Information"
                />

                <div className="space-y-3">
                  <InfoBox
                    icon={<Briefcase size={16} />}
                    label="Skills"
                    value={selectedVolunteer.skills || "—"}
                  />

                  <InfoBox
                    icon={<Languages size={16} />}
                    label="Languages Known"
                    value={selectedVolunteer.languages_known || "—"}
                  />

                  <InfoBox
                    icon={<Users size={16} />}
                    label="Previous Volunteer Experience"
                    value={
                      selectedVolunteer.previous_volunteer_experience ||
                      "—"
                    }
                  />

                  <InfoBox
                    icon={<HeartPulse size={16} />}
                    label="Why Join NSS"
                    value={selectedVolunteer.why_join_nss || "—"}
                  />

                  <InfoBox
                    icon={<Briefcase size={16} />}
                    label="Availability"
                    value={selectedVolunteer.availability || "—"}
                  />

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-[#12358f]">
                      <Award size={16} />

                      <span className="text-xs font-semibold">
                        Areas of Interest
                      </span>
                    </div>

                    {selectedVolunteer.areas_of_interest &&
                    selectedVolunteer.areas_of_interest.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedVolunteer.areas_of_interest.map(
                          (interest, index) => (
                            <span
                              key={`${interest}-${index}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                            >
                              {interest}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No areas of interest provided.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* HEALTH */}
              <section>
                <SectionTitle
                  icon={<HeartPulse size={18} />}
                  title="Health Information"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={<HeartPulse size={16} />}
                    label="Height"
                    value={selectedVolunteer.height || "—"}
                  />

                  <InfoBox
                    icon={<HeartPulse size={16} />}
                    label="Weight"
                    value={selectedVolunteer.weight || "—"}
                  />

                  <InfoBox
                    icon={<HeartPulse size={16} />}
                    label="Medical Condition"
                    value={selectedVolunteer.medical_condition || "—"}
                  />

                  <InfoBox
                    icon={<HeartPulse size={16} />}
                    label="Allergies"
                    value={selectedVolunteer.allergies || "—"}
                  />

                  <div className="sm:col-span-2">
                    <InfoBox
                      icon={<HeartPulse size={16} />}
                      label="Regular Medication"
                      value={
                        selectedVolunteer.regular_medication || "—"
                      }
                    />
                  </div>
                </div>
              </section>

              {/* NSS PERFORMANCE */}
              <section>
                <SectionTitle
                  icon={<Award size={18} />}
                  title="NSS Performance"
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <PerformanceCard
                    value={selectedVolunteer.service_hours ?? 0}
                    label="Service Hours"
                  />

                  <PerformanceCard
                    value={`${Number(
                      selectedVolunteer.attendance_percentage ?? 0
                    ).toFixed(1)}%`}
                    label="Attendance"
                  />

                  <PerformanceCard
                    value={selectedVolunteer.certificates_count ?? 0}
                    label="Certificates"
                  />
                </div>
              </section>

              {/* ACCOUNT */}
              <section>
                <SectionTitle
                  icon={<ShieldCheck size={18} />}
                  title="Account & Verification"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    icon={<ShieldCheck size={16} />}
                    label="Status"
                    value={statusLabel(selectedVolunteer.status)}
                  />

                  <InfoBox
                    icon={<ShieldCheck size={16} />}
                    label="Verification"
                    value={statusLabel(
                      selectedVolunteer.verification_status
                    )}
                  />

                  <InfoBox
                    icon={<CalendarDays size={16} />}
                    label="Registered On"
                    value={formatDate(selectedVolunteer.created_at)}
                  />

                  <InfoBox
                    icon={<CalendarDays size={16} />}
                    label="Last Updated"
                    value={formatDate(selectedVolunteer.updated_at)}
                  />

                  <InfoBox
                    icon={<ShieldCheck size={16} />}
                    label="Declaration"
                    value={
                      selectedVolunteer.declaration_accepted
                        ? "Accepted"
                        : "Not accepted"
                    }
                  />
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#12358f]">
        {icon}
      </div>

      <h3 className="font-serif text-lg font-bold text-slate-950">
        {title}
      </h3>
    </div>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function PerformanceCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="font-serif text-2xl font-bold text-[#12358f]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}