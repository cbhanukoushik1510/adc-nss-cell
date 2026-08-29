"use client";

import {
  AlertCircle,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type HeadAccount = {
  id: string;
  user_id?: string | null;

  full_name?: string | null;
  name?: string | null;

  email?: string | null;
  phone?: string | null;
  mobile?: string | null;

  role?: string | null;
  designation?: string | null;

  unit?: string | null;
  nss_unit?: string | null;

  department?: string | null;

  is_active?: boolean | null;

  created_at?: string | null;
  updated_at?: string | null;

  [key: string]: unknown;
};

/* =========================================================
   HELPERS
========================================================= */

function displayName(
  person: HeadAccount
) {
  return (
    person.full_name ||
    person.name ||
    "Unnamed Head"
  );
}

function displayPhone(
  person: HeadAccount
) {
  return (
    person.phone ||
    person.mobile ||
    "Not provided"
  );
}

function displayUnit(
  person: HeadAccount
) {
  return (
    person.unit ||
    person.nss_unit ||
    "Not assigned"
  );
}

function normalize(
  value?: string | null
) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function formatDate(
  value?: string | null
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function initials(
  name?: string | null
) {
  if (!name) return "HD";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

/* =========================================================
   PAGE
========================================================= */

export default function POHeadsPage() {
  const [heads, setHeads] =
    useState<HeadAccount[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [unitFilter, setUnitFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedHead, setSelectedHead] =
    useState<HeadAccount | null>(null);

  /* =======================================================
     LOAD HEAD ACCOUNTS
  ======================================================= */

  const loadHeads =
    useCallback(async () => {
      setError("");

      /*
       * Heads are currently maintained in
       * the authority table.
       *
       * Only Head / Deputy Head accounts are
       * displayed on this page.
       */

      const { data, error } =
        await supabase
          .from("authority")
          .select("*")
          .order("full_name", {
            ascending: true,
          });

      if (error) {
        throw new Error(
          error.message ||
            "Unable to load Head accounts."
        );
      }

      const headAccounts =
        ((data || []) as HeadAccount[]).filter(
          (person) => {
            const role =
              normalize(person.role);

            const designation =
              normalize(
                person.designation
              );

            return (
              role.includes("head") ||
              designation.includes("head")
            );
          }
        );

      setHeads(headAccounts);
    }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      try {
        await loadHeads();
      } catch (err) {
        console.error(
          "PO Heads error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Head accounts."
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [loadHeads]);

  /* =======================================================
     REALTIME
  ======================================================= */

  useEffect(() => {
    const channel =
      supabase
        .channel("po-head-accounts")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "authority",
          },
          async () => {
            await loadHeads();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [loadHeads]);

  /* =======================================================
     UNIT OPTIONS
  ======================================================= */

  const units = useMemo(() => {
    const values =
      heads
        .map((head) =>
          displayUnit(head)
        )
        .filter(
          (value) =>
            value &&
            value !== "Not assigned"
        );

    return Array.from(
      new Set(values)
    ).sort();
  }, [heads]);

  /* =======================================================
     FILTERED HEADS
  ======================================================= */

  const filteredHeads = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return heads.filter((head) => {
      const name =
        displayName(head)
          .toLowerCase();

      const email =
        String(
          head.email || ""
        ).toLowerCase();

      const phone =
        displayPhone(head)
          .toLowerCase();

      const designation =
        String(
          head.designation ||
            head.role ||
            ""
        ).toLowerCase();

      const unit =
        displayUnit(head);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        designation.includes(query) ||
        unit
          .toLowerCase()
          .includes(query);

      const matchesUnit =
        unitFilter === "all" ||
        unit === unitFilter;

      const active =
        head.is_active !== false;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          active) ||
        (statusFilter ===
          "inactive" &&
          !active);

      return (
        matchesSearch &&
        matchesUnit &&
        matchesStatus
      );
    });
  }, [
    heads,
    search,
    unitFilter,
    statusFilter,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const activeCount =
    heads.filter(
      (head) =>
        head.is_active !== false
    ).length;

  const inactiveCount =
    heads.filter(
      (head) =>
        head.is_active === false
    ).length;

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      await loadHeads();
    } catch (err) {
      console.error(
        "PO Heads refresh error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh Head accounts."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="w-full">
        <div className="mx-auto flex min-h-[60vh] max-w-[1500px] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
              <Users size={23} />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw
                size={15}
                className="animate-spin"
              />
              Loading Head accounts...
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="w-full">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <h2 className="font-bold text-red-800">
                  Unable to load Head accounts
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={refresh}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b225f]"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white shadow-sm sm:h-14 sm:w-14">
                <Users size={25} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F2B7B]">
                  NSS Management
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Heads
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                  View NSS Head and Deputy Head
                  accounts, their assigned units
                  and account information.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 lg:self-auto"
            >
              <RefreshCw
                size={16}
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

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-5 grid gap-4 sm:grid-cols-3">

          <AccountStat
            icon={
              <Users size={19} />
            }
            label="Total Heads"
            value={heads.length}
          />

          <AccountStat
            icon={
              <ShieldCheck size={19} />
            }
            label="Active Accounts"
            value={activeCount}
          />

          <AccountStat
            icon={
              <UserRound size={19} />
            }
            label="Inactive Accounts"
            value={inactiveCount}
          />

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search Head name, email, phone or unit..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-[#0F2B7B]/10"
              />
            </div>

            <select
              value={unitFilter}
              onChange={(e) =>
                setUnitFilter(
                  e.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
            >
              <option value="all">
                All Units
              </option>

              {units.map((unit) => (
                <option
                  key={unit}
                  value={unit}
                >
                  {unit}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
            >
              <option value="all">
                All Accounts
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>
        </section>

        {/* =================================================
            ACCOUNT LIST
        ================================================= */}

        <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-1 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Head Accounts
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredHeads.length} account
                {filteredHeads.length === 1
                  ? ""
                  : "s"}{" "}
                displayed
              </p>
            </div>
          </div>

          {filteredHeads.length ===
          0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
                <Users size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No Head accounts found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                No accounts match the current
                search or filters.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {filteredHeads.map(
                (head) => {

                  const active =
                    head.is_active !== false;

                  return (
                    <div
                      key={head.id}
                      className="p-5 transition hover:bg-gray-50 sm:p-6"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* PERSON */}

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1F4FA] text-sm font-bold text-[#0F2B7B]">
                            {initials(
                              displayName(
                                head
                              )
                            )}
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="truncate text-base font-bold text-gray-900">
                                {displayName(
                                  head
                                )}
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  active
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {active
                                  ? "Active"
                                  : "Inactive"}
                              </span>

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              {head.designation ||
                                head.role ||
                                "NSS Head"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                              <span className="inline-flex items-center gap-1.5">
                                <Mail
                                  size={14}
                                />

                                {head.email ||
                                  "No email"}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <Phone
                                  size={14}
                                />

                                {displayPhone(
                                  head
                                )}
                              </span>

                            </div>

                          </div>

                        </div>

                        {/* UNIT */}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">

                          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              NSS Unit
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                              {displayUnit(
                                head
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedHead(
                                head
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2B7B] hover:bg-[#F5F7FC]"
                          >
                            <Eye size={16} />
                            View Account
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>

      {/* =====================================================
          VIEW ACCOUNT MODAL
      ===================================================== */}

      {selectedHead && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">

            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-5 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4FA] font-bold text-[#0F2B7B]">
                  {initials(
                    displayName(
                      selectedHead
                    )
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0F2B7B]">
                    Head Account
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {displayName(
                      selectedHead
                    )}
                  </h2>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedHead(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>

            </div>

            {/* DETAILS */}

            <div className="space-y-5 px-5 py-6 sm:px-7">

              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">

                <div className="flex items-center gap-3">

                  <ShieldCheck
                    size={19}
                    className="text-[#0F2B7B]"
                  />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Account Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {selectedHead.is_active !==
                      false
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>

                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedHead.is_active !==
                    false
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {selectedHead.is_active !==
                  false
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <DetailCard
                  label="Full Name"
                  value={displayName(
                    selectedHead
                  )}
                />

                <DetailCard
                  label="Role"
                  value={
                    selectedHead.role ||
                    "Head"
                  }
                />

                <DetailCard
                  label="Designation"
                  value={
                    selectedHead.designation ||
                    "NSS Head"
                  }
                />

                <DetailCard
                  label="NSS Unit"
                  value={displayUnit(
                    selectedHead
                  )}
                />

                <DetailCard
                  label="Department"
                  value={
                    selectedHead.department ||
                    "Not provided"
                  }
                />

                <DetailCard
                  label="Phone"
                  value={displayPhone(
                    selectedHead
                  )}
                />

                <DetailCard
                  label="Email"
                  value={
                    selectedHead.email ||
                    "Not provided"
                  }
                />

                <DetailCard
                  label="Account Created"
                  value={formatDate(
                    selectedHead.created_at
                  )}
                />

              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                    <Eye size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#0F2B7B]">
                      View-only account management
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      This PO page currently provides
                      account viewing only. Editing,
                      creating and account-management
                      actions can be added later.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="border-t border-gray-200 p-4 sm:p-5">

              <button
                type="button"
                onClick={() =>
                  setSelectedHead(
                    null
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

/* =========================================================
   STAT
========================================================= */

function AccountStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F4FA] text-[#0F2B7B]">
          {icon}
        </div>

        <span className="text-2xl font-bold text-gray-900">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>

    </div>
  );
}