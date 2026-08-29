"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Reply,
  Search,
  Send,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Authority = {
  id: string;
  user_id: string;
  full_name: string;
  role: string | null;
  designation: string | null;
  department: string | null;
  phone_number?: string | null;
  is_active: boolean;
};

type ActivityItem = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  event_date?: string | null;
  created_at?: string | null;
};

type Message = {
  id: string;
  activity_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
};

type MessageWithPeople = Message & {
  sender?: Authority | null;
  receiver?: Authority | null;
  activity?: ActivityItem | null;
};

/* =========================================================
   HELPERS
========================================================= */

function getDisplayRole(person: Authority | null | undefined) {
  if (!person) return "NSS Authority";

  return (
    person.designation ||
    person.role ||
    "NSS Authority"
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string | null | undefined) {
  if (!name) return "NA";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

/* =========================================================
   PAGE
========================================================= */

export default function POMessagesPage() {
  /* -------------------------------------------------------
     AUTHORITY
  ------------------------------------------------------- */

  const [currentAuthority, setCurrentAuthority] =
    useState<Authority | null>(null);

  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const [authorities, setAuthorities] = useState<
    Authority[]
  >([]);

  const [activities, setActivities] = useState<
    ActivityItem[]
  >([]);

  const [messages, setMessages] = useState<
    MessageWithPeople[]
  >([]);

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  const [activeTab, setActiveTab] = useState<
    "inbox" | "sent"
  >("inbox");

  const [selectedMessage, setSelectedMessage] =
    useState<MessageWithPeople | null>(null);

  const [showCompose, setShowCompose] =
    useState(false);

  const [showRecipientMenu, setShowRecipientMenu] =
    useState(false);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /* -------------------------------------------------------
     COMPOSE
  ------------------------------------------------------- */

  const [recipientId, setRecipientId] =
    useState("");

  const [activityId, setActivityId] =
    useState("");

  const [messageText, setMessageText] =
    useState("");

  /* =========================================================
     LOAD CURRENT AUTHORITY
  ========================================================= */

  const loadCurrentAuthority = useCallback(
    async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          authError.message ||
            "Unable to verify login."
        );
      }

      if (!user) {
        window.location.href = "/login";
        return null;
      }

      const { data, error: authorityError } =
        await supabase
          .from("authority")
          .select(
            `
              id,
              user_id,
              full_name,
              role,
              designation,
              department,
              phone_number,
              is_active
            `
          )
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();

      if (authorityError) {
        throw new Error(
          authorityError.message ||
            "Unable to load authority profile."
        );
      }

      if (!data) {
        throw new Error(
          "No active authority profile was found for this account."
        );
      }

      const authority = data as Authority;

      const role = String(
        authority.role || ""
      ).toLowerCase();

      const designation = String(
        authority.designation || ""
      ).toLowerCase();

      const isPO =
        role.includes("program officer") ||
        role.includes("program_officer") ||
        designation.includes("program officer");

      if (!isPO) {
        throw new Error(
          "This account is not authorized to access the Program Officer communication centre."
        );
      }

      setCurrentAuthority(authority);

      return authority;
    },
    []
  );

  /* =========================================================
     LOAD AUTHORITIES
  ========================================================= */

  const loadAuthorities = useCallback(
    async (currentId: string) => {
      const { data, error } = await supabase
        .from("authority")
        .select(
          `
            id,
            user_id,
            full_name,
            role,
            designation,
            department,
            phone_number,
            is_active
          `
        )
        .eq("is_active", true)
        .order("full_name", {
          ascending: true,
        });

      if (error) {
        throw new Error(
          error.message ||
            "Unable to load communication recipients."
        );
      }

      const filtered = (
        (data || []) as Authority[]
      ).filter((person) => person.id !== currentId);

      setAuthorities(filtered);
    },
    []
  );

  /* =========================================================
     LOAD ACTIVITIES
  ========================================================= */

  const loadActivities = useCallback(async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(100);

    if (error) {
      console.warn(
        "PO activity loading warning:",
        error
      );

      setActivities([]);
      return;
    }

    setActivities(
      ((data || []) as ActivityItem[])
    );
  }, []);

  /* =========================================================
     LOAD MESSAGES
  ========================================================= */

  const loadMessages = useCallback(
    async (authorityId: string) => {
      /*
       * We intentionally do not use a Supabase relationship
       * join here. This keeps the page compatible even when
       * foreign-key relationship names differ.
       */

      const { data, error } = await supabase
        .from("activity_messages")
        .select(
          `
            id,
            activity_id,
            sender_id,
            receiver_id,
            message,
            created_at
          `
        )
        .or(
          `sender_id.eq.${authorityId},receiver_id.eq.${authorityId}`
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw new Error(
          error.message ||
            "Unable to load messages."
        );
      }

      const rawMessages =
        (data || []) as Message[];

      /*
       * Load only the people actually referenced
       * by the returned messages.
       */

      const personIds = Array.from(
        new Set(
          rawMessages.flatMap((item) => [
            item.sender_id,
            item.receiver_id,
          ])
        )
      );

      let peopleMap = new Map<
        string,
        Authority
      >();

      if (personIds.length > 0) {
        const { data: people, error: peopleError } =
          await supabase
            .from("authority")
            .select(
              `
                id,
                user_id,
                full_name,
                role,
                designation,
                department,
                phone_number,
                is_active
              `
            )
            .in("id", personIds);

        if (!peopleError && people) {
          peopleMap = new Map(
            (people as Authority[]).map(
              (person) => [
                person.id,
                person,
              ]
            )
          );
        }
      }

      /*
       * Load referenced activities.
       */

      const activityIds = Array.from(
        new Set(
          rawMessages
            .map((item) => item.activity_id)
            .filter(Boolean)
        )
      );

      let activityMap = new Map<
        string,
        ActivityItem
      >();

      if (activityIds.length > 0) {
        const {
          data: activityData,
          error: activityError,
        } = await supabase
          .from("activities")
          .select("*")
          .in("id", activityIds);

        if (!activityError && activityData) {
          activityMap = new Map(
            (activityData as ActivityItem[]).map(
              (activity) => [
                activity.id,
                activity,
              ]
            )
          );
        }
      }

      const enriched: MessageWithPeople[] =
        rawMessages.map((item) => ({
          ...item,
          sender:
            peopleMap.get(item.sender_id) ||
            null,
          receiver:
            peopleMap.get(item.receiver_id) ||
            null,
          activity:
            activityMap.get(item.activity_id) ||
            null,
        }));

      setMessages(enriched);
    },
    []
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const authority =
        await loadCurrentAuthority();

      if (!authority) return;

      await Promise.all([
        loadAuthorities(authority.id),
        loadActivities(),
        loadMessages(authority.id),
      ]);
    } catch (err) {
      console.error(
        "PO Messages error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Communication Centre."
      );
    } finally {
      setLoading(false);
    }
  }, [
    loadCurrentAuthority,
    loadAuthorities,
    loadActivities,
    loadMessages,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     REALTIME MESSAGE REFRESH
  ========================================================= */

  useEffect(() => {
    if (!currentAuthority) return;

    const channel = supabase
      .channel(
        `po-message-centre-${currentAuthority.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_messages",
        },
        async () => {
          await loadMessages(
            currentAuthority.id
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    currentAuthority,
    loadMessages,
  ]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    if (!currentAuthority) return;

    setRefreshing(true);
    setError("");

    try {
      await Promise.all([
        loadAuthorities(currentAuthority.id),
        loadActivities(),
        loadMessages(currentAuthority.id),
      ]);
    } catch (err) {
      console.error(
        "PO message refresh error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh messages."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const handleSendMessage = async () => {
    if (!currentAuthority) return;

    setError("");

    if (!recipientId) {
      setError(
        "Please select a recipient."
      );
      return;
    }

    if (!activityId) {
      setError(
        "Please select the related NSS activity."
      );
      return;
    }

    const cleanMessage =
      messageText.trim();

    if (!cleanMessage) {
      setError(
        "Please enter a message."
      );
      return;
    }

    if (recipientId === currentAuthority.id) {
      setError(
        "You cannot send a message to yourself."
      );
      return;
    }

    setSending(true);

    try {
      const { data, error } =
        await supabase
          .from("activity_messages")
          .insert({
            activity_id: activityId,
            sender_id: currentAuthority.id,
            receiver_id: recipientId,
            message: cleanMessage,
          })
          .select(
            `
              id,
              activity_id,
              sender_id,
              receiver_id,
              message,
              created_at
            `
          )
          .single();

      if (error) {
        console.error(
          "PO send message error:",
          error
        );

        throw new Error(
          error.message ||
            "Unable to send message."
        );
      }

      if (data) {
        const newMessage =
          data as Message;

        const recipient =
          authorities.find(
            (person) =>
              person.id === recipientId
          ) || null;

        const activity =
          activities.find(
            (item) =>
              item.id === activityId
          ) || null;

        setMessages((previous) => [
          {
            ...newMessage,
            sender:
              currentAuthority,
            receiver:
              recipient,
            activity,
          },
          ...previous,
        ]);
      }

      setMessageText("");
      setRecipientId("");
      setActivityId("");
      setShowCompose(false);
      setShowRecipientMenu(false);
      setActiveTab("sent");
    } catch (err) {
      console.error(
        "PO message sending error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /* =========================================================
     REPLY
  ========================================================= */

  const handleReply = (
    message: MessageWithPeople
  ) => {
    if (!currentAuthority) return;

    const recipient =
      message.sender_id ===
      currentAuthority.id
        ? message.receiver
        : message.sender;

    setRecipientId(
      recipient?.id || ""
    );

    setActivityId(
      message.activity_id || ""
    );

    setMessageText("");

    setSelectedMessage(null);
    setShowCompose(true);
  };

  /* =========================================================
     FILTERED MESSAGES
  ========================================================= */

  const filteredMessages =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      const tabMessages =
        messages.filter((message) => {
          if (!currentAuthority) {
            return false;
          }

          if (activeTab === "inbox") {
            return (
              message.receiver_id ===
              currentAuthority.id
            );
          }

          return (
            message.sender_id ===
            currentAuthority.id
          );
        });

      if (!query) {
        return tabMessages;
      }

      return tabMessages.filter(
        (message) => {
          const sender =
            message.sender?.full_name ||
            "";

          const receiver =
            message.receiver?.full_name ||
            "";

          const activity =
            message.activity?.title ||
            "";

          const text =
            message.message || "";

          return (
            sender
              .toLowerCase()
              .includes(query) ||
            receiver
              .toLowerCase()
              .includes(query) ||
            activity
              .toLowerCase()
              .includes(query) ||
            text
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      messages,
      currentAuthority,
      activeTab,
      search,
    ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const inboxCount = useMemo(() => {
    if (!currentAuthority) return 0;

    return messages.filter(
      (message) =>
        message.receiver_id ===
        currentAuthority.id
    ).length;
  }, [
    messages,
    currentAuthority,
  ]);

  const sentCount = useMemo(() => {
    if (!currentAuthority) return 0;

    return messages.filter(
      (message) =>
        message.sender_id ===
        currentAuthority.id
    ).length;
  }, [
    messages,
    currentAuthority,
  ]);

  /* =========================================================
     SELECTED RECIPIENT
  ========================================================= */

  const selectedRecipient =
    authorities.find(
      (person) =>
        person.id === recipientId
    ) || null;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
            <MessageSquare
              size={22}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw
              size={15}
              className="animate-spin"
            />
            Loading Communication Centre...
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (error && !currentAuthority) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-bold text-red-800">
            Communication Centre unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadData}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b225f]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white shadow-sm sm:h-14 sm:w-14">
                <MessageSquare
                  size={25}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F2B7B]">
                  NSS Communication
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Communication Centre
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                  Communicate directly with authorized
                  NSS personnel and coordinate activities,
                  responsibilities and operational work.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSelectedMessage(null);
                  setShowCompose(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b225f]"
              >
                <Plus size={17} />
                New Message
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <X
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}
        </section>

        {/* ===================================================
            STATS
        =================================================== */}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Inbox size={19} />}
            label="Inbox"
            value={inboxCount}
          />

          <StatCard
            icon={<Send size={19} />}
            label="Sent"
            value={sentCount}
          />

          <StatCard
            icon={<Users size={19} />}
            label="Available Authorities"
            value={authorities.length}
          />
        </section>

        {/* ===================================================
            COMMUNICATION WORKSPACE
        =================================================== */}

        <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {/* TOOLBAR */}

          <div className="border-b border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              {/* TABS */}

              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("inbox")
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
                    activeTab === "inbox"
                      ? "bg-white text-[#0F2B7B] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Inbox size={16} />
                  Inbox
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {inboxCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("sent")
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
                    activeTab === "sent"
                      ? "bg-white text-[#0F2B7B] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Send size={16} />
                  Sent
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {sentCount}
                  </span>
                </button>
              </div>

              {/* SEARCH */}

              <div className="relative w-full xl:max-w-md">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search messages, people or activities..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-[#0F2B7B]/10"
                />
              </div>
            </div>
          </div>

          {/* MESSAGE LIST */}

          <div className="min-h-[500px]">
            {filteredMessages.length ===
            0 ? (
              <EmptyState
                activeTab={activeTab}
                search={search}
                onCompose={() => {
                  setError("");
                  setShowCompose(true);
                }}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMessages.map(
                  (message) => {
                    const isInbox =
                      currentAuthority?.id ===
                      message.receiver_id;

                    const otherPerson =
                      isInbox
                        ? message.sender
                        : message.receiver;

                    return (
                      <button
                        key={message.id}
                        type="button"
                        onClick={() =>
                          setSelectedMessage(
                            message
                          )
                        }
                        className="group flex w-full gap-4 p-4 text-left transition hover:bg-gray-50 sm:p-5"
                      >
                        {/* AVATAR */}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF0FF] text-sm font-bold text-[#0F2B7B]">
                          {getInitials(
                            otherPerson?.full_name
                          )}
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-gray-900">
                                {otherPerson?.full_name ||
                                  "Unknown Authority"}
                              </h3>

                              <p className="truncate text-xs text-gray-500">
                                {getDisplayRole(
                                  otherPerson
                                )}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-400">
                              <Clock3 size={13} />
                              {formatDateTime(
                                message.created_at
                              )}
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {message.activity?.title && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F4FA] px-2.5 py-1 text-[11px] font-semibold text-[#0F2B7B]">
                                <Activity
                                  size={12}
                                />
                                {message.activity.title}
                              </span>
                            )}

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isInbox
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {isInbox
                                ? "Received"
                                : "Sent"}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                            {message.message}
                          </p>
                        </div>

                        <div className="hidden shrink-0 items-center self-center text-gray-300 transition group-hover:text-[#0F2B7B] sm:flex">
                          <ChevronDown
                            size={18}
                            className="-rotate-90"
                          />
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          MESSAGE VIEW MODAL
      ===================================================== */}

      {selectedMessage && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF0FF] text-sm font-bold text-[#0F2B7B]">
                  {getInitials(
                    currentAuthority?.id ===
                      selectedMessage.receiver_id
                      ? selectedMessage.sender
                          ?.full_name
                      : selectedMessage.receiver
                          ?.full_name
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-gray-900">
                    {currentAuthority?.id ===
                    selectedMessage.receiver_id
                      ? selectedMessage.sender
                          ?.full_name
                      : selectedMessage.receiver
                          ?.full_name ||
                        "Authority"}
                  </h2>

                  <p className="truncate text-xs text-gray-500">
                    {getDisplayRole(
                      currentAuthority?.id ===
                        selectedMessage.receiver_id
                        ? selectedMessage.sender
                        : selectedMessage.receiver
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div className="overflow-y-auto px-5 py-6 sm:px-7">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {selectedMessage.activity
                  ?.title && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F4FA] px-3 py-1.5 text-xs font-semibold text-[#0F2B7B]">
                    <Activity size={13} />
                    {
                      selectedMessage.activity
                        .title
                    }
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                  <Clock3 size={13} />
                  {formatDateTime(
                    selectedMessage.created_at
                  )}
                </span>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoBox
                  label="From"
                  value={
                    selectedMessage.sender
                      ?.full_name ||
                    "Unknown"
                  }
                />

                <InfoBox
                  label="To"
                  value={
                    selectedMessage.receiver
                      ?.full_name ||
                    "Unknown"
                  }
                />
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  handleReply(
                    selectedMessage
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b225f]"
              >
                <Reply size={16} />
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          COMPOSE MODAL
      ===================================================== */}

      {showCompose && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0F2B7B]">
                  Communication
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  New Message
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCompose(false);
                  setError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="space-y-5">
                {/* RECIPIENT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Send To
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowRecipientMenu(
                          (value) => !value
                        )
                      }
                      className="flex min-h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 text-left outline-none transition hover:border-gray-300 focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
                    >
                      {selectedRecipient ? (
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF0FF] text-xs font-bold text-[#0F2B7B]">
                            {getInitials(
                              selectedRecipient.full_name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {
                                selectedRecipient.full_name
                              }
                            </p>

                            <p className="truncate text-xs text-gray-500">
                              {getDisplayRole(
                                selectedRecipient
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Select an authorized recipient
                        </span>
                      )}

                      <ChevronDown
                        size={17}
                        className="shrink-0 text-gray-400"
                      />
                    </button>

                    {showRecipientMenu && (
                      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl">
                        {authorities.length ===
                        0 ? (
                          <div className="px-4 py-5 text-center text-sm text-gray-500">
                            No other active authorities
                            are available.
                          </div>
                        ) : (
                          authorities.map(
                            (person) => (
                              <button
                                key={
                                  person.id
                                }
                                type="button"
                                onClick={() => {
                                  setRecipientId(
                                    person.id
                                  );
                                  setShowRecipientMenu(
                                    false
                                  );
                                }}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-gray-50 ${
                                  recipientId ===
                                  person.id
                                    ? "bg-[#F1F4FA]"
                                    : ""
                                }`}
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF0FF] text-xs font-bold text-[#0F2B7B]">
                                  {getInitials(
                                    person.full_name
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-gray-900">
                                    {
                                      person.full_name
                                    }
                                  </p>

                                  <p className="truncate text-xs text-gray-500">
                                    {getDisplayRole(
                                      person
                                    )}
                                  </p>
                                </div>

                                {recipientId ===
                                  person.id && (
                                  <Check
                                    size={17}
                                    className="text-[#0F2B7B]"
                                  />
                                )}
                              </button>
                            )
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIVITY */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Related NSS Activity
                  </label>

                  <div className="relative">
                    <Activity
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      value={activityId}
                      onChange={(event) =>
                        setActivityId(
                          event.target.value
                        )
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-700 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
                    >
                      <option value="">
                        Select NSS activity
                      </option>

                      {activities.map(
                        (activity) => (
                          <option
                            key={activity.id}
                            value={activity.id}
                          >
                            {activity.title}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  {activities.length ===
                    0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No activities were found.
                      Because your current
                      activity_messages table requires
                      activity_id, a related activity is
                      required before sending.
                    </p>
                  )}
                </div>

                {/* MESSAGE */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">
                      Message
                    </label>

                    <span className="text-xs text-gray-400">
                      {messageText.length}
                    </span>
                  </div>

                  <textarea
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(
                        event.target.value
                      )
                    }
                    rows={7}
                    placeholder="Write your message here..."
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#0F2B7B] focus:ring-2 focus:ring-[#0F2B7B]/10"
                  />
                </div>

                {/* INFO */}

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                      <MessageCircle
                        size={17}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#0F2B7B]">
                        Official NSS Communication
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        Messages are stored in the NSS
                        communication database and are
                        available to the authorized sender
                        and recipient.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 p-4 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() => {
                  setShowCompose(false);
                  setError("");
                }}
                disabled={sending}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={
                  sending ||
                  !recipientId ||
                  !activityId ||
                  !messageText.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0b225f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
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
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  activeTab,
  search,
  onCompose,
}: {
  activeTab: "inbox" | "sent";
  search: string;
  onCompose: () => void;
}) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F4FA] text-[#0F2B7B]">
        {activeTab === "inbox" ? (
          <Inbox size={28} />
        ) : (
          <Send size={28} />
        )}
      </div>

      <h3 className="mt-5 text-lg font-bold text-gray-900">
        {search
          ? "No matching messages"
          : activeTab === "inbox"
            ? "Your inbox is empty"
            : "No sent messages yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {search
          ? "Try a different search term or clear the search field."
          : activeTab === "inbox"
            ? "Messages received from authorized NSS personnel will appear here."
            : "Messages you send to authorized NSS personnel will appear here."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCompose}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b225f]"
        >
          <Plus size={16} />
          New Message
        </button>
      )}
    </div>
  );
}