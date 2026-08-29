"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Camera,
  CheckCircle,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  FolderOpen,
  Video,
  Upload,
  FileVideo,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

/* =========================================================
   TYPES
========================================================= */

type MediaType = "image" | "video";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  event_id: string | null;
  category: string;
  uploaded_by: string | null;
  is_published: boolean;
  created_at: string;
  media_type: MediaType;
}

interface GalleryForm {
  title: string;
  description: string;
  category: string;
  event_id: string;
  is_published: boolean;
}

type GalleryFilter =
  | "All"
  | "Published"
  | "Draft";

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_BUCKET = "gallery";

const MAX_IMAGES_PER_EVENT = 5;

const MAX_VIDEO_PER_EVENT = 1;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024;

const MAX_IMAGES_PER_UPLOAD = 5;

const emptyForm: GalleryForm = {
  title: "",
  description: "",
  category: "General",
  event_id: "",
  is_published: false,
};

const categories = [
  "General",
  "Events",
  "Community Service",
  "Awareness",
  "Camps",
  "Workshops",
  "Celebrations",
  "Volunteers",
  "Activities",
  "Other",
];

/* =========================================================
   HELPERS
========================================================= */

function getFileExtension(file: File) {
  const parts = file.name.split(".");

  return parts.length > 1
    ? parts[parts.length - 1].toLowerCase()
    : "file";
}

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

/*
 * Your database currently uses "photo" for images.
 * Internally we normalize both "photo" and "image"
 * to "image".
 */
function normalizeMediaType(
  value: string | null | undefined
): MediaType {
  return value === "video"
    ? "video"
    : "image";
}

/* =========================================================
   MAIN
========================================================= */

export default function AdminGalleryPage() {
  const [gallery, setGallery] =
    useState<GalleryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [publishingId, setPublishingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<GalleryFilter>("All");

  const [showForm, setShowForm] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState<GalleryItem | null>(null);

  const [form, setForm] =
    useState<GalleryForm>(emptyForm);

  /*
   * IMPORTANT:
   * Multiple files are now supported.
   */
  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  /* =======================================================
     LOAD GALLERY
  ======================================================= */

  const loadGallery = async (
    refresh = false
  ) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const {
        data,
        error: galleryError,
      } = await supabase
        .from("gallery")
        .select(`
          id,
          title,
          description,
          image_url,
          event_id,
          category,
          uploaded_by,
          is_published,
          created_at,
          media_type
        `)
        .order("created_at", {
          ascending: false,
        });

      if (galleryError) {
        throw galleryError;
      }

      const rows: GalleryItem[] =
        (data ?? []).map((item) => ({
          id: String(item.id),

          title: item.title,

          description:
            item.description,

          image_url:
            item.image_url,

          event_id:
            item.event_id,

          category:
            item.category,

          uploaded_by:
            item.uploaded_by,

          is_published:
            item.is_published,

          created_at:
            item.created_at,

          media_type:
            normalizeMediaType(
              item.media_type
            ),
        }));

      setGallery(rows);
    } catch (err) {
      console.error(
        "Gallery loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load gallery."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  /* =======================================================
     MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* =======================================================
     FORM
  ======================================================= */

  const openCreateForm = () => {
    clearMessages();

    setEditingItem(null);

    setForm({
      ...emptyForm,
    });

    setSelectedFiles([]);

    setShowForm(true);
  };

  const openEditForm = (
    item: GalleryItem
  ) => {
    clearMessages();

    setEditingItem(item);

    setForm({
      title: item.title || "",

      description:
        item.description || "",

      category:
        item.category || "General",

      event_id:
        item.event_id || "",

      is_published:
        item.is_published,
    });

    setSelectedFiles([]);

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);

    setEditingItem(null);

    setSelectedFiles([]);

    setForm({
      ...emptyForm,
    });
  };

  const updateForm = (
    field: keyof GalleryForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =======================================================
     FILE SELECT
  ======================================================= */

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    clearMessages();

    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      setSelectedFiles([]);
      return;
    }

    /*
     * EDIT MODE
     *
     * Editing an existing record replaces only
     * that one media item.
     */
    if (editingItem) {
      if (files.length > 1) {
        setError(
          "When editing gallery media, please select only one replacement file."
        );

        event.target.value = "";

        setSelectedFiles([]);

        return;
      }
    }

    /*
     * Detect image/video selection.
     */
    const hasVideo = files.some(
      (file) => isVideo(file)
    );

    const hasImage = files.some(
      (file) => isImage(file)
    );

    /*
     * Do not allow image + video together.
     */
    if (hasVideo && hasImage) {
      setError(
        "Please select either photos or one video, not both."
      );

      event.target.value = "";

      setSelectedFiles([]);

      return;
    }

    /*
     * Only one video.
     */
    if (hasVideo && files.length > 1) {
      setError(
        "Only one video can be uploaded at a time."
      );

      event.target.value = "";

      setSelectedFiles([]);

      return;
    }

    /*
     * Maximum five photos in one upload.
     */
    if (
      hasImage &&
      files.length > MAX_IMAGES_PER_UPLOAD
    ) {
      setError(
        `You can select a maximum of ${MAX_IMAGES_PER_UPLOAD} photos at once.`
      );

      event.target.value = "";

      setSelectedFiles([]);

      return;
    }

    /*
     * Validate every selected file.
     */
    for (const file of files) {
      if (
        !isImage(file) &&
        !isVideo(file)
      ) {
        setError(
          `Unsupported file: ${file.name}`
        );

        event.target.value = "";

        setSelectedFiles([]);

        return;
      }

      if (
        isImage(file) &&
        file.size > MAX_IMAGE_SIZE
      ) {
        setError(
          `${file.name} is larger than 10 MB.`
        );

        event.target.value = "";

        setSelectedFiles([]);

        return;
      }

      if (
        isVideo(file) &&
        file.size > MAX_VIDEO_SIZE
      ) {
        setError(
          `${file.name} is larger than 100 MB.`
        );

        event.target.value = "";

        setSelectedFiles([]);

        return;
      }
    }

    setSelectedFiles(files);
  };

  /* =======================================================
     EVENT MEDIA LIMIT
  ======================================================= */

  const getEventMediaCount = (
    eventId: string | null,
    mediaType: MediaType,
    excludeId?: string
  ) => {
    return gallery.filter((item) => {
      /*
       * Exclude current item while editing.
       */
      if (
        excludeId &&
        item.id === excludeId
      ) {
        return false;
      }

      /*
       * If event is selected, count only
       * media belonging to that event.
       */
      if (eventId) {
        if (
          item.event_id !== eventId
        ) {
          return false;
        }
      } else {
        /*
         * For media without an event,
         * only count media without an event.
         */
        if (item.event_id !== null) {
          return false;
        }
      }

      return (
        item.media_type ===
        mediaType
      );
    }).length;
  };

  /* =======================================================
     UPLOAD FILE
  ======================================================= */

  const uploadFile = async (
    file: File
  ) => {
    const extension =
      getFileExtension(file);

    const fileName =
      `${crypto.randomUUID()}.${extension}`;

    const filePath =
      `gallery/${fileName}`;

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: publicData,
    } =
      supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(
          filePath
        );

    if (
      !publicData.publicUrl
    ) {
      throw new Error(
        "Unable to create public media URL."
      );
    }

    return publicData.publicUrl;
  };

  /* =======================================================
     DELETE STORAGE FILE
  ======================================================= */

  const deleteStorageFile = async (
    url: string
  ) => {
    try {
      const marker =
        `/storage/v1/object/public/${STORAGE_BUCKET}/`;

      const index =
        url.indexOf(marker);

      if (index === -1) {
        return;
      }

      const path =
        url.substring(
          index + marker.length
        );

      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);
    } catch (err) {
      console.warn(
        "Storage cleanup failed:",
        err
      );
    }
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    /*
     * TITLE
     */
    if (!form.title.trim()) {
      setError(
        "Gallery title is required."
      );

      return;
    }

    /*
     * CREATE requires at least one file.
     */
    if (
      !editingItem &&
      selectedFiles.length === 0
    ) {
      setError(
        "Please select at least one photo or video."
      );

      return;
    }

    /*
     * EDIT allows maximum one replacement.
     */
    if (
      editingItem &&
      selectedFiles.length > 1
    ) {
      setError(
        "Only one replacement file can be selected while editing."
      );

      return;
    }

    setSaving(true);

    try {
      const eventId =
        form.event_id.trim() ||
        null;

      /*
       * =================================================
       * EDIT EXISTING MEDIA
       * =================================================
       */

      if (editingItem) {
        let mediaUrl =
          editingItem.image_url;

        let databaseMediaType =
          editingItem.media_type ===
          "video"
            ? "video"
            : "photo";

        /*
         * If a new replacement file was
         * selected, upload it first.
         */
        if (
          selectedFiles.length === 1
        ) {
          const file =
            selectedFiles[0];

          mediaUrl =
            await uploadFile(file);

          databaseMediaType =
            isVideo(file)
              ? "video"
              : "photo";
        }

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        const payload = {
          title:
            form.title.trim(),

          description:
            form.description.trim() ||
            null,

          image_url:
            mediaUrl,

          event_id:
            eventId,

          category:
            form.category.trim() ||
            "General",

          is_published:
            form.is_published,

          media_type:
            databaseMediaType,

          ...(user?.id
            ? {
                uploaded_by:
                  user.id,
              }
            : {}),
        };

        const {
          error: updateError,
        } =
          await supabase
            .from("gallery")
            .update(payload)
            .eq(
              "id",
              editingItem.id
            );

        if (updateError) {
          /*
           * If new storage file was uploaded
           * but database update failed,
           * remove the new file.
           */
          if (
            selectedFiles.length === 1 &&
            mediaUrl !==
              editingItem.image_url
          ) {
            await deleteStorageFile(
              mediaUrl
            );
          }

          throw updateError;
        }

        /*
         * Remove old file only after
         * successful database update.
         */
        if (
          selectedFiles.length === 1 &&
          editingItem.image_url !==
            mediaUrl
        ) {
          await deleteStorageFile(
            editingItem.image_url
          );
        }

        setSuccess(
          form.is_published
            ? "Gallery item updated and published successfully."
            : "Gallery item updated successfully."
        );
      }

      /*
       * =================================================
       * CREATE NEW MEDIA
       * =================================================
       */

      else {
        const files =
          selectedFiles;

        const isVideoUpload =
          files.length === 1 &&
          isVideo(files[0]);

        /*
         * =================================================
         * CHECK EVENT LIMITS
         * =================================================
         */

        if (eventId) {
          const existingPhotoCount =
            getEventMediaCount(
              eventId,
              "image"
            );

          const existingVideoCount =
            getEventMediaCount(
              eventId,
              "video"
            );

          /*
           * PHOTO LIMIT
           */
          if (!isVideoUpload) {
            const totalAfterUpload =
              existingPhotoCount +
              files.length;

            if (
              totalAfterUpload >
              MAX_IMAGES_PER_EVENT
            ) {
              const remaining =
                Math.max(
                  MAX_IMAGES_PER_EVENT -
                    existingPhotoCount,
                  0
                );

              if (remaining === 0) {
                throw new Error(
                  `This event already has the maximum ${MAX_IMAGES_PER_EVENT} photos.`
                );
              }

              throw new Error(
                `This event can accept only ${remaining} more photo${remaining === 1 ? "" : "s"}. Maximum is ${MAX_IMAGES_PER_EVENT} photos per event.`
              );
            }
          }

          /*
           * VIDEO LIMIT
           */
          if (isVideoUpload) {
            if (
              existingVideoCount >=
              MAX_VIDEO_PER_EVENT
            ) {
              throw new Error(
                "This event already has a video. Only 1 video is allowed per event."
              );
            }
          }
        }

        /*
         * =================================================
         * GET CURRENT USER
         * =================================================
         */

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        /*
         * =================================================
         * UPLOAD ALL FILES
         * =================================================
         */

        const uploadedUrls: string[] =
          [];

        try {
          for (
            const file of files
          ) {
            const url =
              await uploadFile(
                file
              );

            uploadedUrls.push(
              url
            );
          }
        } catch (uploadError) {
          /*
           * If any upload fails,
           * remove files already uploaded.
           */
          for (
            const url of
              uploadedUrls
          ) {
            await deleteStorageFile(
              url
            );
          }

          throw uploadError;
        }

        /*
         * =================================================
         * CREATE ONE DATABASE ROW
         * FOR EACH FILE
         * =================================================
         */

        const rows =
          uploadedUrls.map(
            (url) => ({
              title:
                form.title.trim(),

              description:
                form.description.trim() ||
                null,

              image_url:
                url,

              event_id:
                eventId,

              category:
                form.category.trim() ||
                "General",

              uploaded_by:
                user?.id || null,

              is_published:
                form.is_published,

              /*
               * IMPORTANT:
               * Your database uses "photo"
               * for image records.
               */
              media_type:
                isVideoUpload
                  ? "video"
                  : "photo",
            })
          );

        const {
          error: insertError,
        } =
          await supabase
            .from("gallery")
            .insert(rows);

        if (insertError) {
          /*
           * Database insert failed.
           * Remove all uploaded files.
           */
          for (
            const url of
              uploadedUrls
          ) {
            await deleteStorageFile(
              url
            );
          }

          throw insertError;
        }

        setSuccess(
          form.is_published
            ? `${files.length} ${files.length === 1 ? "media item" : "media items"} uploaded and published successfully.`
            : `${files.length} ${files.length === 1 ? "media item" : "media items"} saved as draft successfully.`
        );
      }

      /*
       * CLOSE FORM
       */
      closeForm();

      /*
       * REFRESH GALLERY
       */
      await loadGallery(true);
    } catch (err) {
      console.error(
        "Gallery save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save gallery item."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (
    item: GalleryItem
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${item.title}"?`
      );

    if (!confirmed) {
      return;
    }

    clearMessages();

    setDeletingId(item.id);

    try {
      const {
        error: deleteError,
      } =
        await supabase
          .from("gallery")
          .delete()
          .eq(
            "id",
            item.id
          );

      if (deleteError) {
        throw deleteError;
      }

      if (item.image_url) {
        await deleteStorageFile(
          item.image_url
        );
      }

      setGallery(
        (current) =>
          current.filter(
            (galleryItem) =>
              galleryItem.id !==
              item.id
          )
      );

      setSuccess(
        "Gallery item deleted successfully."
      );
    } catch (err) {
      console.error(
        "Gallery delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete gallery item."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     PUBLISH
  ======================================================= */

  const togglePublish = async (
    item: GalleryItem
  ) => {
    clearMessages();

    setPublishingId(item.id);

    try {
      const newStatus =
        !item.is_published;

      const {
        error: updateError,
      } =
        await supabase
          .from("gallery")
          .update({
            is_published:
              newStatus,
          })
          .eq(
            "id",
            item.id
          );

      if (updateError) {
        throw updateError;
      }

      setGallery(
        (current) =>
          current.map(
            (galleryItem) =>
              galleryItem.id ===
              item.id
                ? {
                    ...galleryItem,
                    is_published:
                      newStatus,
                  }
                : galleryItem
          )
      );

      setSuccess(
        newStatus
          ? "Gallery item published successfully."
          : "Gallery item unpublished successfully."
      );
    } catch (err) {
      console.error(
        "Gallery publish error:",
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

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCount =
    gallery.length;

  const publishedCount =
    gallery.filter(
      (item) =>
        item.is_published
    ).length;

  const draftCount =
    gallery.filter(
      (item) =>
        !item.is_published
    ).length;

  const photoCount =
    gallery.filter(
      (item) =>
        item.media_type ===
        "image"
    ).length;

  const videoCount =
    gallery.filter(
      (item) =>
        item.media_type ===
        "video"
    ).length;

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredGallery =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return gallery.filter(
        (item) => {
          if (
            filter ===
              "Published" &&
            !item.is_published
          ) {
            return false;
          }

          if (
            filter === "Draft" &&
            item.is_published
          ) {
            return false;
          }

          if (!searchText) {
            return true;
          }

          const searchable =
            [
              item.title,
              item.description,
              item.category,
              item.media_type,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            searchText
          );
        }
      );
    }, [
      gallery,
      search,
      filter,
    ]);

  /* =======================================================
     DATE
  ======================================================= */

  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <AdminDashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0F2B7B]">
              <Camera className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0F2B7B]">
                Gallery
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage NSS photos and videos.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                loadGallery(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
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
              onClick={
                openCreateForm
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white hover:bg-[#143a96]"
            >
              <Plus className="h-5 w-5" />

              Add Media
            </button>

          </div>
        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800">

            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />

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

        {/* =================================================
            ERROR
        ================================================= */}

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

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Total Media
            </p>

            <p className="mt-2 text-3xl font-bold text-[#0F2B7B]">
              {totalCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Photos
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {photoCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Videos
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {videoCount}
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

        </div>

        {/* =================================================
            MANAGEMENT
        ================================================= */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Gallery Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Each event can contain up to 5 photos and 1 video.
                </p>
              </div>

              <div className="relative w-full lg:w-[380px]">

                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search gallery..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

              {(
                [
                  "All",
                  "Published",
                  "Draft",
                ] as GalleryFilter[]
              ).map((item) => {
                const count =
                  item === "All"
                    ? totalCount
                    : item ===
                      "Published"
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
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold ${
                      active
                        ? "bg-[#0F2B7B] text-white"
                        : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}

                    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
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
                Loading gallery...
              </p>

            </div>
          ) : filteredGallery.length === 0 ? (

            /* EMPTY */

            <div className="p-14 text-center">

              <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No gallery items found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Start building your NSS gallery.
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

                    Add First Media
                  </button>
                )}

            </div>
          ) : (

            /* GALLERY GRID */

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 xl:grid-cols-4">

              {filteredGallery.map(
                (item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md"
                  >

                    {/* MEDIA */}

                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">

                      {item.media_type ===
                      "video" ? (
                        <video
                          src={
                            item.image_url
                          }
                          controls
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={
                            item.image_url
                          }
                          alt={
                            item.title
                          }
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      )}

                      {/* MEDIA TYPE */}

                      <div className="absolute left-3 top-3">

                        {item.media_type ===
                        "video" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                            <Video className="h-3.5 w-3.5" />

                            Video
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                            <ImageIcon className="h-3.5 w-3.5" />

                            Photo
                          </span>
                        )}

                      </div>

                      {/* STATUS */}

                      <div className="absolute right-3 top-3">

                        {item.is_published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm">
                            <CheckCircle className="h-3.5 w-3.5" />

                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-orange-700 shadow-sm">
                            <EyeOff className="h-3.5 w-3.5" />

                            Draft
                          </span>
                        )}

                      </div>

                    </div>

                    {/* CONTENT */}

                    <div className="p-4">

                      <h3 className="line-clamp-1 text-base font-bold text-gray-900">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-gray-500">
                          {
                            item.description
                          }
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0F2B7B]">
                          {item.category}
                        </span>

                      </div>

                      <p className="mt-3 text-xs font-medium text-gray-400">
                        Added{" "}
                        {formatDate(
                          item.created_at
                        )}
                      </p>

                      {/* ACTIONS */}

                      <div className="mt-4 grid grid-cols-3 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            togglePublish(
                              item
                            )
                          }
                          disabled={
                            publishingId ===
                            item.id
                          }
                          className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-bold ${
                            item.is_published
                              ? "border border-orange-200 bg-orange-50 text-orange-700"
                              : "bg-green-600 text-white"
                          }`}
                        >

                          {publishingId ===
                          item.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : item.is_published ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}

                          {item.is_published
                            ? "Hide"
                            : "Publish"}

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              item
                            )
                          }
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-gray-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" />

                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              item
                            )
                          }
                          disabled={
                            deletingId ===
                            item.id
                          }
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-bold text-red-700"
                        >

                          {deletingId ===
                          item.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
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

        {/* =================================================
            ADD / EDIT MODAL
        ================================================= */}

        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#0F2B7B]">

                    {editingItem ? (
                      <Edit3 className="h-5 w-5" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}

                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-[#0F2B7B]">
                      {editingItem
                        ? "Edit Gallery Media"
                        : "Add Gallery Media"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {editingItem
                        ? "Replace the selected media."
                        : "Upload up to 5 photos or one video."}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                  className="rounded-xl p-2 text-gray-500 hover:bg-slate-100"
                >
                  <X className="h-6 w-6" />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-6 p-6"
              >

                {/* =================================================
                    FILE UPLOAD
                ================================================= */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">

                    {editingItem
                      ? "Replace Media"
                      : "Upload Photos / Video"}

                    {!editingItem && (
                      <span className="text-red-500">
                        {" "}*
                      </span>
                    )}

                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-[#0F2B7B] hover:bg-blue-50">

                    {selectedFiles.length >
                    0 ? (
                      <div className="w-full">

                        {/* SELECTED FILES */}

                        <div className="grid gap-3 sm:grid-cols-2">

                          {selectedFiles.map(
                            (
                              file,
                              index
                            ) => (
                              <div
                                key={`${file.name}-${index}`}
                                className="rounded-xl border border-slate-200 bg-white p-3 text-left"
                              >

                                <div className="flex items-center gap-3">

                                  {isVideo(
                                    file
                                  ) ? (
                                    <FileVideo className="h-8 w-8 shrink-0 text-purple-600" />
                                  ) : (
                                    <ImageIcon className="h-8 w-8 shrink-0 text-blue-600" />
                                  )}

                                  <div className="min-w-0">

                                    <p className="truncate text-xs font-bold text-gray-800">
                                      {file.name}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                      {(
                                        file.size /
                                        (1024 *
                                          1024)
                                      ).toFixed(
                                        2
                                      )}{" "}
                                      MB
                                    </p>

                                  </div>

                                </div>

                              </div>
                            )
                          )}

                        </div>

                        <p className="mt-4 text-sm font-bold text-[#0F2B7B]">
                          {selectedFiles.length}{" "}
                          {selectedFiles.length ===
                          1
                            ? "file"
                            : "files"}{" "}
                          selected
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Click to choose different files
                        </p>

                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-gray-400" />

                        <p className="mt-3 text-sm font-bold text-gray-700">
                          Click to upload
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {editingItem
                            ? "Select one replacement file"
                            : "Select up to 5 photos at once"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          JPG, PNG, WEBP or MP4
                        </p>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple={
                        !editingItem
                      }
                      onChange={
                        handleFileChange
                      }
                      className="hidden"
                    />

                  </label>

                  <p className="mt-2 text-xs text-gray-400">
                    Maximum: 10 MB per image, 100 MB per video.
                  </p>

                </div>

                {/* =================================================
                    TITLE
                ================================================= */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">

                    Title

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>

                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="NSS Community Service Programme"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* =================================================
                    EVENT ID
                ================================================= */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Event ID
                  </label>

                  <input
                    type="text"
                    value={
                      form.event_id
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "event_id",
                        event.target.value
                      )
                    }
                    placeholder="Paste the event UUID"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Leave empty for media not attached to a specific event.
                  </p>

                </div>

                {/* =================================================
                    CATEGORY
                ================================================= */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Category
                  </label>

                  <div className="relative">

                    <FolderOpen className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <select
                      value={
                        form.category
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "category",
                          event.target.value
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    >

                      {categories.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          >
                            {
                              category
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Describe the photo or video..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* =================================================
                    PUBLISH
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <label className="flex cursor-pointer items-start gap-4">

                    <input
                      type="checkbox"
                      checked={
                        form.is_published
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "is_published",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-5 w-5"
                    />

                    <div>

                      <p className="font-bold text-gray-800">
                        Publish this media
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Published media will be visible on the public website.
                      </p>

                    </div>

                  </label>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 text-sm font-bold text-white hover:bg-[#143a96] disabled:opacity-60"
                  >

                    {saving && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                      ? "Uploading..."
                      : editingItem
                      ? "Save Changes"
                      : "Upload Media"}

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