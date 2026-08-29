"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
  RefreshCw,
  Eye,
  UserCheck,
  Clock,
  CalendarDays,
  Building2,
  Filter,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Authority = {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  designation: string;
  phone_number: string | null;
  department: string | null;
  is_active: boolean;
};

type Volunteer = {
  id: string;
  full_name: string;
  roll_number: string;
  hall_ticket_number: string | null;
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

type SortKey =
  | "full_name"
  | "roll_number"
  | "department"
  | "course"
  | "year"
  | "academic_year"
  | "nss_unit"
  | "service_hours"
  | "attendance_percentage";

type SortDirection = "asc" | "desc";

export default function AuthorityVolunteersPage() {
  const router = useRouter();

  const [authority, setAuthority] = useState<Authority | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  const [search, setSearch] = useState("");

  const [academicYear, setAcademicYear] = useState("all");
  const [department, setDepartment] = useState("all");
  const [course, setCourse] = useState("all");
  const [year, setYear] = useState("all");
  const [section, setSection] = useState("all");
  const [nssUnit, setNssUnit] = useState("all");
  const [status, setStatus] = useState("all");

  const [sortKey, setSortKey] = useState<SortKey>("full_name");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        /* --------------------------------
           1. AUTH USER
        -------------------------------- */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        /* --------------------------------
           2. AUTHORITY
        -------------------------------- */

        const { data: authorityData, error: authorityError } =
          await supabase
            .from("authority")
            .select(
              `
                id,
                user_id,
                full_name,
                role,
                designation,
                phone_number,
                department,
                is_active
              `
            )
            .eq("user_id", user.id)
            .eq("is_active", true)
            .maybeSingle();

        if (authorityError) {
          throw new Error(
            authorityError.message ||
              "Unable to verify authority account."
          );
        }

        if (!authorityData) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        /* --------------------------------
           3. PRINCIPAL / VP SECURITY
        -------------------------------- */

        const role = String(
          authorityData.role || ""
        ).toLowerCase();

        const designation = String(
          authorityData.designation || ""
        ).toLowerCase();

        const isPrincipal =
          role.includes("principal") &&
          !role.includes("vice");

        const isVicePrincipal =
          role.includes("vice principal") ||
          designation.includes("vice principal") ||
          role.includes("vp");

        if (!isPrincipal && !isVicePrincipal) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        setAuthority(authorityData);

        /* --------------------------------
           4. VOLUNTEERS
        -------------------------------- */

        const { data: volunteerData, error: volunteerError } =
          await supabase
            .from("volunteers")
            .select(
              `
                id,
                full_name,
                roll_number,
                hall_ticket_number,
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
              `
            )
            .order("full_name", {
              ascending: true,
            });

        if (volunteerError) {
          throw new Error(
            volunteerError.message ||
              "Unable to load volunteers."
          );
        }

        setVolunteers(volunteerData || []);
      } catch (err) {
        console.error(
          "Authority volunteers error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load volunteers."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  /* =====================================================
     UNIQUE FILTER OPTIONS
  ===================================================== */

  const academicYears = useMemo(
    () =>
      uniqueValues(
        volunteers.map((v) => v.academic_year)
      ),
    [volunteers]
  );

  const departments = useMemo(
    () =>
      uniqueValues(
        volunteers.map((v) => v.department)
      ),
    [volunteers]
  );

  const courses = useMemo(
    () =>
      uniqueValues(
        volunteers.map((v) => v.course)
      ),
    [volunteers]
  );

  const years = useMemo(
    () =>
      uniqueValues(
        volunteers.map((v) => v.year)
      ),
    [volunteers]
  );

  const sections = useMemo(
    () =>
      uniqueValues(
        volunteers.map((v) => v.section)
      ),
    [volunteers]
  );

  const nssUnits = useMemo(
    () =>
      uniqueValues(
        volunteers.map((v) => v.nss_unit)
      ),
    [volunteers]
  );

  const statuses = useMemo(
    () =>
      uniqueValues(
        volunteers.map((v) => v.status)
      ),
    [volunteers]
  );

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredVolunteers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const result = volunteers.filter((volunteer) => {
      const matchesSearch =
        !searchValue ||
        volunteer.full_name
          .toLowerCase()
          .includes(searchValue) ||
        volunteer.roll_number
          .toLowerCase()
          .includes(searchValue) ||
        (volunteer.volunteer_id || "")
          .toLowerCase()
          .includes(searchValue) ||
        volunteer.college_email
          .toLowerCase()
          .includes(searchValue) ||
        volunteer.mobile_number
          .toLowerCase()
          .includes(searchValue);

      if (!matchesSearch) return false;

      if (
        academicYear !== "all" &&
        volunteer.academic_year !== academicYear
      ) {
        return false;
      }

      if (
        department !== "all" &&
        volunteer.department !== department
      ) {
        return false;
      }

      if (
        course !== "all" &&
        volunteer.course !== course
      ) {
        return false;
      }

      if (
        year !== "all" &&
        volunteer.year !== year
      ) {
        return false;
      }

      if (
        section !== "all" &&
        volunteer.section !== section
      ) {
        return false;
      }

      if (
        nssUnit !== "all" &&
        volunteer.nss_unit !== nssUnit
      ) {
        return false;
      }

      if (
        status !== "all" &&
        volunteer.status !== status
      ) {
        return false;
      }

      return true;
    });

    result.sort((a, b) => {
      let aValue: string | number =
        a[sortKey] ?? "";

      let bValue: string | number =
        b[sortKey] ?? "";

      if (
        sortKey === "service_hours" ||
        sortKey === "attendance_percentage"
      ) {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;
  }, [
    volunteers,
    search,
    academicYear,
    department,
    course,
    year,
    section,
    nssUnit,
    status,
    sortKey,
    sortDirection,
  ]);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const approvedCount = volunteers.filter(
    (v) =>
      String(v.status || "").toLowerCase() ===
      "approved"
  ).length;

  const pendingCount = volunteers.filter(
    (v) =>
      String(v.status || "").toLowerCase() ===
      "pending"
  ).length;

  const activeUnits = new Set(
    volunteers
      .map((v) => v.nss_unit)
      .filter(Boolean)
  ).size;

  const roleLabel =
    authority?.designation ||
    authority?.role ||
    "Authority";

  /* =====================================================
     SORT
  ===================================================== */

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setAcademicYear("all");
    setDepartment("all");
    setCourse("all");
    setYear("all");
    setSection("all");
    setNssUnit("all");
    setStatus("all");
    setSearch("");
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading volunteers...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Unable to load volunteers
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            onClick={() => loadData()}
            className="mt-6 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white hover:bg-[#163A8C]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!authority) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-slate-200 bg-white lg:flex lg:flex-col">

        <div className="flex h-[68px] items-center border-b border-slate-200 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
            <ShieldCheck size={21} />
          </div>

          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-bold text-[#0F2B7B]">
              ADC NSS CELL
            </p>

            <p className="text-[10px] text-gray-500">
              Authority Portal
            </p>
          </div>
        </div>

        <div className="border-b border-slate-200 p-3">
          <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="truncate text-[11px] text-blue-100">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <div className="mt-3 space-y-1">

            <SidebarLink
              icon={<CalendarDaysIcon />}
              label="Dashboard"
              onClick={() =>
                router.push("/authority")
              }
            />

            <SidebarLink
              icon={<CalendarDaysIcon />}
              label="Events"
              onClick={() =>
                router.push("/authority/events")
              }
            />

            <SidebarLink
              icon={<Users size={18} />}
              label="Volunteers"
              active
              onClick={() =>
                router.push("/authority/volunteers")
              }
            />

            <SidebarLink
              icon={<Clock size={18} />}
              label="Attendance"
              onClick={() =>
                router.push("/authority/attendance")
              }
            />

            <SidebarLink
              icon={<UserCheck size={18} />}
              label="Registrations"
              onClick={() =>
                router.push("/authority/registrations")
              }
            />

            <SidebarLink
              icon={
                <MessageIcon />
              }
              label="Messages & Suggestions"
              onClick={() =>
                router.push("/authority/messages")
              }
            />

          </div>
        </nav>

        <div className="border-t border-slate-200 p-3">

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-[#0F2B7B]">
              <ShieldCheck size={16} />

              <span className="text-xs font-bold">
                View Only Access
              </span>
            </div>

            <p className="mt-2 text-[10px] leading-4 text-gray-500">
              Principal and Vice Principal accounts can
              view NSS information but cannot modify
              administrative records.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />

          <aside className="relative flex h-full w-72 flex-col bg-white shadow-2xl">

            <div className="flex h-[68px] items-center justify-between border-b px-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#0F2B7B]">
                    ADC NSS CELL
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Authority Portal
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-3">
              <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-3 text-white">

                <p className="text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="mt-1 text-[11px] text-blue-100">
                  {roleLabel}
                </p>

              </div>
            </div>

            <nav className="flex-1 px-3 py-4">

              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Main Menu
              </p>

              <div className="mt-3 space-y-1">

                <MobileSidebarLink
                  icon={<CalendarDaysIcon />}
                  label="Dashboard"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority");
                  }}
                />

                <MobileSidebarLink
                  icon={<CalendarDaysIcon />}
                  label="Events"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/events");
                  }}
                />

                <MobileSidebarLink
                  icon={<Users size={18} />}
                  label="Volunteers"
                  active
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/volunteers");
                  }}
                />

                <MobileSidebarLink
                  icon={<Clock size={18} />}
                  label="Attendance"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/attendance");
                  }}
                />

                <MobileSidebarLink
                  icon={<UserCheck size={18} />}
                  label="Registrations"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/registrations");
                  }}
                />

                <MobileSidebarLink
                  icon={<MessageIcon />}
                  label="Messages & Suggestions"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority/messages");
                  }}
                />

              </div>

            </nav>

            <div className="border-t p-3">

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>

          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="lg:pl-60">

        

        {/* CONTENT */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* PAGE HEADER */}

          <section className="mb-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                  <span>Authority Portal</span>
                  <ChevronRight size={13} />
                  <span className="text-[#0F2B7B]">
                    Volunteers
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  NSS Volunteers
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View and explore registered NSS volunteers.
                </p>

              </div>

              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

            </div>

          </section>

          {/* SUMMARY */}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SummaryCard
              icon={<Users size={20} />}
              label="Total Volunteers"
              value={volunteers.length}
            />

            <SummaryCard
              icon={<UserCheck size={20} />}
              label="Approved"
              value={approvedCount}
            />

            <SummaryCard
              icon={<Clock size={20} />}
              label="Pending"
              value={pendingCount}
            />

            <SummaryCard
              icon={<ShieldCheck size={20} />}
              label="NSS Units"
              value={activeUnits}
            />

          </section>

          {/* SEARCH */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by name, roll number, volunteer ID, email or mobile..."
                  className="w-full rounded-xl border border-gray-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <button
                onClick={() =>
                  setFiltersOpen(!filtersOpen)
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-slate-50 lg:w-auto"
              >
                <Filter size={17} />
                Filters
                <ChevronDown
                  size={16}
                  className={
                    filtersOpen
                      ? "rotate-180 transition"
                      : "transition"
                  }
                />
              </button>

            </div>

            {/* FILTERS */}

            {filtersOpen && (
              <div className="mt-5 border-t border-slate-100 pt-5">

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <FilterSelect
                    label="Academic Year"
                    value={academicYear}
                    options={academicYears}
                    onChange={setAcademicYear}
                  />

                  <FilterSelect
                    label="Department / Stream"
                    value={department}
                    options={departments}
                    onChange={setDepartment}
                  />

                  <FilterSelect
                    label="Course"
                    value={course}
                    options={courses}
                    onChange={setCourse}
                  />

                  <FilterSelect
                    label="Year"
                    value={year}
                    options={years}
                    onChange={setYear}
                  />

                  <FilterSelect
                    label="Section"
                    value={section}
                    options={sections}
                    onChange={setSection}
                  />

                  <FilterSelect
                    label="NSS Unit"
                    value={nssUnit}
                    options={nssUnits}
                    onChange={setNssUnit}
                  />

                  <FilterSelect
                    label="Status"
                    value={status}
                    options={statuses}
                    onChange={setStatus}
                  />

                </div>

                <div className="mt-4 flex justify-end">

                  <button
                    onClick={clearFilters}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-50"
                  >
                    Clear Filters
                  </button>

                </div>

              </div>
            )}

          </section>

          {/* RESULT HEADER */}

          <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Volunteer Directory
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                {filteredVolunteers.length} volunteer
                {filteredVolunteers.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[#0F2B7B]">
              View Only
            </div>

          </section>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <section className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <SortableHeader
                      label="Volunteer"
                      sortKey="full_name"
                      currentKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />

                    <SortableHeader
                      label="Roll Number"
                      sortKey="roll_number"
                      currentKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />

                    <SortableHeader
                      label="Department"
                      sortKey="department"
                      currentKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />

                    <SortableHeader
                      label="Course"
                      sortKey="course"
                      currentKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />

                    <SortableHeader
                      label="Year"
                      sortKey="year"
                      currentKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />

                    <SortableHeader
                      label="Academic Year"
                      sortKey="academic_year"
                      currentKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />

                    <SortableHeader
                      label="NSS Unit"
                      sortKey="nss_unit"
                      currentKey={sortKey}
                      direction={sortDirection}
                      onSort={handleSort}
                    />

                    <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-12 text-center"
                      >
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map(
                      (volunteer) => (
                        <tr
                          key={volunteer.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* VOLUNTEER */}

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-[#0F2B7B]">
                                {getInitials(
                                  volunteer.full_name
                                )}
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-gray-900">
                                  {volunteer.full_name}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                  {volunteer.volunteer_id ||
                                    "Volunteer"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* ROLL */}

                          <td className="px-4 py-4 text-sm font-medium text-gray-700">
                            {volunteer.roll_number}
                          </td>

                          {/* DEPARTMENT */}

                          <td className="px-4 py-4">

                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Building2
                                size={15}
                                className="text-gray-400"
                              />
                              {volunteer.department}
                            </div>

                          </td>

                          {/* COURSE */}

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {volunteer.course || "-"}
                          </td>

                          {/* YEAR */}

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {volunteer.year || "-"}
                          </td>

                          {/* ACADEMIC YEAR */}

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {volunteer.academic_year || "-"}
                          </td>

                          {/* NSS UNIT */}

                          <td className="px-4 py-4">

                            {volunteer.nss_unit ? (
                              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0F2B7B]">
                                {volunteer.nss_unit}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                -
                              </span>
                            )}

                          </td>

                          {/* ACTION */}

                          <td className="px-4 py-4 text-right">

                            <button
                              onClick={() =>
                                router.push(
                                  `/authority/volunteers/${volunteer.id}`
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-[#0F2B7B] px-3 py-2 text-xs font-bold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
                            >
                              <Eye size={15} />
                              View
                            </button>

                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* =================================================
              MOBILE / TABLET CARDS
          ================================================= */}

          <section className="mt-4 space-y-4 lg:hidden">

            {filteredVolunteers.length === 0 ? (
              <EmptyState />
            ) : (
              filteredVolunteers.map(
                (volunteer) => (
                  <article
                    key={volunteer.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-[#0F2B7B]">
                          {getInitials(
                            volunteer.full_name
                          )}
                        </div>

                        <div className="min-w-0">

                          <h4 className="truncate font-bold text-gray-900">
                            {volunteer.full_name}
                          </h4>

                          <p className="mt-1 text-xs text-gray-400">
                            {volunteer.volunteer_id ||
                              "Volunteer"}
                          </p>

                        </div>

                      </div>

                      <StatusBadge
                        status={
                          volunteer.status
                        }
                      />

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <InfoItem
                        label="Roll Number"
                        value={
                          volunteer.roll_number
                        }
                      />

                      <InfoItem
                        label="Department"
                        value={
                          volunteer.department
                        }
                      />

                      <InfoItem
                        label="Course"
                        value={
                          volunteer.course || "-"
                        }
                      />

                      <InfoItem
                        label="Year"
                        value={
                          volunteer.year || "-"
                        }
                      />

                      <InfoItem
                        label="Academic Year"
                        value={
                          volunteer.academic_year ||
                          "-"
                        }
                      />

                      <InfoItem
                        label="NSS Unit"
                        value={
                          volunteer.nss_unit ||
                          "-"
                        }
                      />

                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/authority/volunteers/${volunteer.id}`
                        )
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#0F2B7B] px-4 py-3 text-sm font-bold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
                    >
                      <Eye size={17} />
                      View Volunteer Profile
                    </button>

                  </article>
                )
              )
            )}

          </section>

          {/* VIEW ONLY NOTICE */}

          <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                <ShieldCheck size={19} />
              </div>

              <div>

                <h3 className="font-bold text-[#0F2B7B]">
                  Authority View Access
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Principal and Vice Principal accounts
                  can view volunteer information, academic
                  details, NSS participation and performance
                  information. Volunteer records cannot be
                  modified from this portal.
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function uniqueValues(
  values: (string | null | undefined)[]
) {
  return Array.from(
    new Set(
      values
        .filter(
          (value): value is string =>
            Boolean(value && value.trim())
        )
        .map((value) => value.trim())
    )
  ).sort((a, b) =>
    a.localeCompare(b)
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/* =========================================================
   SIDEBAR
========================================================= */

function SidebarLink({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-[#0F2B7B] text-white shadow-sm"
          : "text-gray-600 hover:bg-slate-100 hover:text-[#0F2B7B]"
      }`}
    >
      {icon}

      <span>{label}</span>

      {active && (
        <ChevronRight
          size={15}
          className="ml-auto"
        />
      )}
    </button>
  );
}

function MobileSidebarLink({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${
        active
          ? "bg-[#0F2B7B] text-white"
          : "text-gray-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
          {icon}
        </div>

        <span className="text-2xl font-bold text-gray-900">
          {value}
        </span>

      </div>

      <p className="mt-3 text-sm font-medium text-gray-500">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-bold text-gray-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0F2B7B] focus:bg-white"
      >

        <option value="all">
          All
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}

/* =========================================================
   SORTABLE HEADER
========================================================= */

function SortableHeader({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;

  return (
    <th className="px-4 py-4 text-left">

      <button
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
          active
            ? "text-[#0F2B7B]"
            : "text-gray-500 hover:text-[#0F2B7B]"
        }`}
      >

        {label}

        <ArrowUpDown size={13} />

        {active && (
          <span className="text-[10px]">
            {direction === "asc"
              ? "↑"
              : "↓"}
          </span>
        )}

      </button>

    </th>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-gray-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: string | null;
}) {
  const normalized =
    String(status || "")
      .toLowerCase();

  if (normalized === "approved") {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
        Approved
      </span>
    );
  }

  if (normalized === "pending") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
        Pending
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
        Rejected
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600">
      {status || "Unknown"}
    </span>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="py-12 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-gray-400">
        <Users size={25} />
      </div>

      <h3 className="mt-4 font-bold text-gray-800">
        No volunteers found
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Try changing your search or filters.
      </p>

    </div>
  );
}

/* =========================================================
   ICON HELPERS
========================================================= */

function CalendarDaysIcon() {
  return <CalendarDays size={18} />;
}

function MessageIcon() {
  return <span className="inline-flex"><Users size={18} /></span>;
}