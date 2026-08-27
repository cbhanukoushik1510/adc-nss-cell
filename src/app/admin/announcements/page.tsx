"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Megaphone,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

interface AnnouncementItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  color: string | null;
  created_by: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface AnnouncementForm {
  title: string;
  description: string;
  category: string;
  color: string;
  is_published: boolean;
}

const emptyForm: AnnouncementForm = {
  title: "",
  description: "",
  category: "General",
  color: "#0F2B7B",
  is_published: false,
};

type AnnouncementFilter = "All" | "Published" | "Draft";

const categories = [
  "General",
  "Important",
  "Notice",
  "Event",
  "Volunteer",
  "Meeting",
  "Opportunity",
  "Achievement",
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<
    AnnouncementItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<AnnouncementFilter>("All");

  const [showForm, setShowForm] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementItem | null>(null);

  const [form, setForm] =
    useState<AnnouncementForm>(emptyForm);

  /* =========================================================
     LOAD ANNOUNCEMENTS
  ========================================================= */

  const loadAnnouncements = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const { data, error: announcementsError } =
        await supabase
          .from("announcements")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (announcementsError) {
        console.error("Supabase announcements error:", {
          message: announcementsError.message,
          details: announcementsError.details,
          hint: announcementsError.hint,
          code: announcementsError.code,
        });

        throw new Error(
          announcementsError.message ||
            announcementsError.details ||
            "Unable to load announcements."
        );
      }

      setAnnouncements(
        (data ?? []) as AnnouncementItem[]
      );
    } catch (err) {
      console.error(
        "Announcements loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load announcements."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const updateForm = (
    field: keyof AnnouncementForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =========================================================
     CREATE
  ========================================================= */

  const openCreateForm = () => {
    clearMessages();

    setEditingAnnouncement(null);
    setForm({
      ...emptyForm,
    });

    setShowForm(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const openEditForm = (
    announcement: AnnouncementItem
  ) => {
    clearMessages();

    setEditingAnnouncement(announcement);

    setForm({
      title: announcement.title || "",
      description: announcement.description || "",
      category: announcement.category || "General",
      color: announcement.color || "#0F2B7B",
      is_published: announcement.is_published,
    });

    setShowForm(true);
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingAnnouncement(null);

    setForm({
      ...emptyForm,
    });
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    if (!form.title.trim()) {
      setError("Announcement title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Announcement description is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),

        description:
          form.description.trim() || null,

        category:
          form.category.trim() || "General",

        color:
          form.color || "#0F2B7B",

        is_published:
          form.is_published,

        updated_at:
          new Date().toISOString(),
      };

      if (editingAnnouncement) {
        const { error: updateError } =
          await supabase
            .from("announcements")
            .update(payload)
            .eq(
              "id",
              editingAnnouncement.id
            );

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          form.is_published
            ? "Announcement updated and published successfully."
            : "Announcement updated and saved as draft."
        );
      } else {
        const { error: insertError } =
          await supabase
            .from("announcements")
            .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          form.is_published
            ? "Announcement created and published successfully."
            : "Announcement saved as draft successfully."
        );
      }

      closeForm();

      await loadAnnouncements(true);
    } catch (err) {
      console.error(
        "Announcement save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save announcement."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (
    announcement: AnnouncementItem
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${announcement.title}"?`
    );

    if (!confirmed) return;

    clearMessages();

    setDeletingId(announcement.id);

    try {
      const { error: deleteError } =
        await supabase
          .from("announcements")
          .delete()
          .eq("id", announcement.id);

      if (deleteError) {
        throw deleteError;
      }

      setAnnouncements((current) =>
        current.filter(
          (item) =>
            item.id !== announcement.id
        )
      );

      setSuccess(
        "Announcement deleted successfully."
      );
    } catch (err) {
      console.error(
        "Announcement delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete announcement."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================================
     PUBLISH
  ========================================================= */

  const togglePublish = async (
    announcement: AnnouncementItem
  ) => {
    clearMessages();

    setPublishingId(announcement.id);

    try {
      const newStatus =
        !announcement.is_published;

      const { error: updateError } =
        await supabase
          .from("announcements")
          .update({
            is_published: newStatus,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            announcement.id
          );

      if (updateError) {
        throw updateError;
      }

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === announcement.id
            ? {
                ...item,
                is_published:
                  newStatus,
              }
            : item
        )
      );

      setSuccess(
        newStatus
          ? "Announcement published successfully."
          : "Announcement unpublished successfully."
      );
    } catch (err) {
      console.error(
        "Announcement publish error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to change publish status."
      );
    } finally {
      setPublishingId(null);
    }
  };

  /* =========================================================
     COUNTS
  ========================================================= */

  const totalCount =
    announcements.length;

  const publishedCount =
    announcements.filter(
      (item) => item.is_published
    ).length;

  const draftCount =
    announcements.filter(
      (item) => !item.is_published
    ).length;

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredAnnouncements =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      return announcements.filter(
        (announcement) => {
          if (
            filter === "Published" &&
            !announcement.is_published
          ) {
            return false;
          }

          if (
            filter === "Draft" &&
            announcement.is_published
          ) {
            return false;
          }

          if (!searchText) {
            return true;
          }

          const searchableText = [
            announcement.title,
            announcement.description,
            announcement.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            searchText
          );
        }
      );
    }, [
      announcements,
      search,
      filter,
    ]);

  /* =========================================================
     DATE
  ========================================================= */

  const formatDate = (
    value: string
  ) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <AdminDashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0F2B7B]">
              <Megaphone className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0F2B7B]">
                Announcements
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create, manage and publish NSS announcements.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                loadAnnouncements(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#143a96]"
            >
              <Plus className="h-5 w-5" />

              Add Announcement
            </button>
          </div>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0" />

              <p className="text-sm font-semibold">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Total Announcements
            </p>

            <p className="mt-2 text-3xl font-bold text-[#0F2B7B]">
              {totalCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {draftCount}
            </p>
          </div>
        </div>

        {/* MANAGEMENT */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Announcement Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage notices and announcements displayed on the public website.
                </p>
              </div>

              <div className="relative w-full lg:w-[380px]">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search announcements..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* FILTER */}

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  "All",
                  "Published",
                  "Draft",
                ] as AnnouncementFilter[]
              ).map((item) => {
                const count =
                  item === "All"
                    ? totalCount
                    : item === "Published"
                    ? publishedCount
                    : draftCount;

                const active =
                  filter === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      active
                        ? "bg-[#0F2B7B] text-white"
                        : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}

                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-white/15"
                          : "bg-white"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="p-14 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading announcements...
              </p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (

            /* EMPTY */

            <div className="p-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No announcements found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "No announcements match your search."
                  : filter === "Published"
                  ? "There are no published announcements."
                  : filter === "Draft"
                  ? "There are no draft announcements."
                  : "Create your first announcement."}
              </p>

              {!search &&
                filter === "All" && (
                  <button
                    type="button"
                    onClick={
                      openCreateForm
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white"
                  >
                    <Plus className="h-4 w-4" />

                    Create Announcement
                  </button>
                )}
            </div>
          ) : (

            /* LIST */

            <div className="divide-y divide-slate-200">
              {filteredAnnouncements.map(
                (announcement) => (
                  <article
                    key={announcement.id}
                    className="p-5 transition hover:bg-slate-50 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                      {/* COLOR ICON */}

                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                        style={{
                          backgroundColor:
                            announcement.color ||
                            "#0F2B7B",
                        }}
                      >
                        <Megaphone className="h-6 w-6" />
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-bold text-gray-900">
                            {announcement.title}
                          </h3>

                          {announcement.is_published ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                              <EyeOff className="h-3.5 w-3.5" />
                              Draft
                            </span>
                          )}

                          {announcement.category && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0F2B7B]">
                              {announcement.category}
                            </span>
                          )}
                        </div>

                        {announcement.description && (
                          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                            {announcement.description}
                          </p>
                        )}

                        <p className="mt-3 text-xs font-medium text-gray-400">
                          Created{" "}
                          {formatDate(
                            announcement.created_at
                          )}
                        </p>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2 lg:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            togglePublish(
                              announcement
                            )
                          }
                          disabled={
                            publishingId ===
                            announcement.id
                          }
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
                            announcement.is_published
                              ? "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {publishingId ===
                          announcement.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : announcement.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}

                          {announcement.is_published
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              announcement
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-slate-50"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              announcement
                            )
                          }
                          disabled={
                            deletingId ===
                            announcement.id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          {deletingId ===
                          announcement.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}

                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            CREATE / EDIT MODAL
        ===================================================== */}

        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              {/* MODAL HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-[#0F2B7B]">
                    {editingAnnouncement
                      ? "Edit Announcement"
                      : "Create New Announcement"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {editingAnnouncement
                      ? "Update the announcement information below."
                      : "Create an announcement for NSS volunteers and visitors."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl p-2 text-gray-500 transition hover:bg-slate-100 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-6 p-6"
              >

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Announcement Title
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Example: NSS Volunteer Meeting"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateForm(
                        "category",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  >
                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Description
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={6}
                    placeholder="Write the announcement details..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    required
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Keep the announcement clear and easy to understand.
                  </p>
                </div>

                {/* COLOR */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Announcement Color
                  </label>

                  <div className="flex items-center gap-3">

                    <input
                      type="color"
                      value={form.color}
                      onChange={(event) =>
                        updateForm(
                          "color",
                          event.target.value
                        )
                      }
                      className="h-12 w-16 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                    />

                    <input
                      type="text"
                      value={form.color}
                      onChange={(event) =>
                        updateForm(
                          "color",
                          event.target.value
                        )
                      }
                      placeholder="#0F2B7B"
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    />

                    <div
                      className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
                      style={{
                        backgroundColor:
                          form.color ||
                          "#0F2B7B",
                      }}
                    />
                  </div>
                </div>

                {/* PUBLISH */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <label className="flex cursor-pointer items-start gap-4">

                    <input
                      type="checkbox"
                      checked={
                        form.is_published
                      }
                      onChange={(event) =>
                        updateForm(
                          "is_published",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-[#0F2B7B] focus:ring-[#0F2B7B]"
                    />

                    <div>
                      <p className="font-bold text-gray-800">
                        Publish this announcement
                      </p>

                      <p className="mt-1 text-sm leading-5 text-gray-500">
                        Published announcements will be visible on the public website. Drafts remain hidden.
                      </p>
                    </div>

                  </label>
                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                      ? "Saving..."
                      : editingAnnouncement
                      ? "Save Changes"
                      : form.is_published
                      ? "Create & Publish"
                      : "Save Draft"}
                  </button>

                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}