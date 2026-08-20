"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  QrCode,
  ClipboardCheck,
  MapPin,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface AttendanceRecord {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
  source: string;
  scanned_at: string | null;
  marked_at: string | null;
  marked_by: string | null;
  created_at: string;
}

interface EventInfo {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  venue: string | null;
}

interface AttendanceWithEvent
  extends AttendanceRecord {
  event: EventInfo | null;
}

export default function AttendancePage() {
  
  const [records, setRecords] =
    useState<AttendanceWithEvent[]>([]);

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    attended: 0,
    percentage: 0,
  });

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);

    try {
      /* ================================
         GET LOGGED-IN USER
      ================================= */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "Unable to get logged-in user:",
          userError
        );
        return;
      }

      /* ================================
         FIND VOLUNTEER
      ================================= */

      const {
        data: volunteer,
        error: volunteerError,
      } = await supabase
        .from("volunteers")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (volunteerError) {
        console.error(
          "Error loading volunteer:",
          volunteerError
        );
        return;
      }

      if (!volunteer) {
        console.error(
          "Volunteer profile not found."
        );
        return;
      }

      /* ================================
         LOAD ATTENDANCE
      ================================= */

      const {
        data: attendanceData,
        error: attendanceError,
      } = await supabase
        .from("attendance")
        .select(`
          id,
          event_id,
          volunteer_id,
          status,
          source,
          scanned_at,
          marked_at,
          marked_by,
          created_at
        `)
        .eq("volunteer_id", volunteer.id)
        .order("created_at", {
          ascending: false,
        });

      if (attendanceError) {
        console.error(
          "Error loading attendance:",
          attendanceError
        );

        setRecords([]);
        return;
      }

      const attendance =
        (attendanceData || []) as AttendanceRecord[];

      /* ================================
         LOAD EVENTS
      ================================= */

      const eventIds = [
        ...new Set(
          attendance.map(
            (item) => item.event_id
          )
        ),
      ];

      let events: EventInfo[] = [];

      if (eventIds.length > 0) {
        const {
          data: eventData,
          error: eventError,
        } = await supabase
          .from("events")
          .select(`
            id,
            title,
            event_date,
            start_time,
            venue
          `)
          .in("id", eventIds);

        if (eventError) {
          console.error(
            "Error loading events:",
            eventError
          );
        } else {
          events =
            (eventData || []) as EventInfo[];
        }
      }

      /* ================================
         COMBINE DATA
      ================================= */

      const combined =
        attendance.map((record) => ({
          ...record,
          event:
            events.find(
              (event) =>
                event.id === record.event_id
            ) || null,
        }));

      setRecords(combined);

      /* ================================
         CALCULATE STATISTICS
      ================================= */

      const total = combined.length;

      const attended = combined.filter(
        (record) =>
          record.status.toLowerCase() ===
          "present"
      ).length;

      const percentage =
        total > 0
          ? Math.round(
              (attended / total) * 100
            )
          : 0;

      setStats({
        total,
        attended,
        percentage,
      });
    } catch (error) {
      console.error(
        "Attendance page error:",
        error
      );

      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     FORMAT DATE
  ================================= */

  const formatDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* ================================
     FORMAT TIME
  ================================= */

  const formatTime = (
    time: string | null
  ) => {
    if (!time) {
      return "Time not specified";
    }

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  /* ================================
     SOURCE LABEL
  ================================= */

  const getSourceLabel = (
    source: string
  ) => {
    if (
      source.toLowerCase() === "qr"
    ) {
      return "QR Scan";
    }

    if (
      source.toLowerCase() ===
      "manual"
    ) {
      return "Manual";
    }

    return source;
  };

  /* ================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <main className="p-6 lg:p-8">
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-[#0F2B7B]">
            Attendance
          </h1>

          <p className="mt-3 text-gray-500">
            Loading your attendance...
          </p>
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout>
      <main className="space-y-8 p-6 lg:p-8">

      {/* =================================
          PAGE HEADER
      ================================== */}

      <div>
        <h1 className="text-3xl font-bold text-[#0F2B7B]">
          Attendance
        </h1>

        <p className="mt-2 text-gray-500">
          View your NSS event attendance
          and participation history.
        </p>
      </div>

      {/* =================================
          STAT CARDS
      ================================== */}

      <div className="grid gap-6 md:grid-cols-3">

        {/* Attendance Percentage */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Attendance Percentage
              </p>

              <h2 className="mt-2 text-4xl font-bold text-[#0F2B7B]">
                {stats.percentage}%
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <CheckCircle2 size={28} />
            </div>

          </div>
        </div>

        {/* Events Attended */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Events Attended
              </p>

              <h2 className="mt-2 text-4xl font-bold text-[#0F2B7B]">
                {stats.attended}
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <CalendarDays size={28} />
            </div>

          </div>
        </div>

        {/* Total Events */}

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Attendance Records
              </p>

              <h2 className="mt-2 text-4xl font-bold text-[#0F2B7B]">
                {stats.total}
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <ClipboardCheck size={28} />
            </div>

          </div>
        </div>

      </div>

      {/* =================================
          ATTENDANCE HISTORY
      ================================== */}

      <section className="rounded-3xl bg-white p-8 shadow-lg">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0F2B7B]">
            Attendance History
          </h2>

          <p className="mt-2 text-gray-500">
            Your attendance for NSS events.
          </p>
        </div>

        {records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">

            <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />

            <p className="mt-4 font-semibold text-gray-600">
              No attendance records yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Your event attendance will
              appear here once it is marked.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {records.map((record) => {

              const isPresent =
                record.status.toLowerCase() ===
                "present";

              return (
                <div
                  key={record.id}
                  className="rounded-2xl border p-5 transition hover:border-[#0F2B7B] hover:shadow-md"
                >

                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                    {/* Event */}

                    <div className="flex items-start gap-4">

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          isPresent
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isPresent ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Clock3 size={24} />
                        )}
                      </div>

                      <div>

                        <h3 className="text-lg font-bold text-[#0F2B7B]">
                          {record.event?.title ||
                            "NSS Event"}
                        </h3>

                        {record.event && (
                          <div className="mt-2 space-y-1 text-sm text-gray-500">

                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={15}
                              />

                              {formatDate(
                                record.event
                                  .event_date
                              )}
                            </div>

                            {record.event
                              .start_time && (
                              <div className="flex items-center gap-2">
                                <Clock3
                                  size={15}
                                />

                                {formatTime(
                                  record.event
                                    .start_time
                                )}
                              </div>
                            )}

                            {record.event
                              .venue && (
                              <div className="flex items-center gap-2">
                                <MapPin
                                  size={15}
                                />

                                {
                                  record.event
                                    .venue
                                }
                              </div>
                            )}

                          </div>
                        )}

                      </div>

                    </div>

                    {/* Status */}

                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          isPresent
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {record.status}
                      </span>

                      <span className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                        {record.source
                          .toLowerCase() ===
                        "qr" ? (
                          <QrCode size={15} />
                        ) : (
                          <ClipboardCheck
                            size={15}
                          />
                        )}

                        {getSourceLabel(
                          record.source
                        )}
                      </span>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

    </main>
    </DashboardLayout>
  );
}