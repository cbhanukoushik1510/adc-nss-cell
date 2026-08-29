"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronRight,
  Inbox,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
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
  role: string;
  designation: string;
  phone_number: string | null;
  department: string | null;
  is_active: boolean;
};

type CommunicationMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

type Conversation = {
  person: Authority;
  messages: CommunicationMessage[];
  lastMessage: CommunicationMessage | null;
  unreadCount: number;
};

/* =========================================================
   HELPERS
========================================================= */

function formatMessageTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMessageDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();

  const sameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (sameDay) {
    return formatMessageTime(dateString);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getRoleLabel(person: Authority) {
  return person.designation || person.role || "NSS Staff";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AuthorityMessagesPage() {
  const router = useRouter();

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  const [staff, setStaff] = useState<Authority[]>([]);
  const [messages, setMessages] = useState<
    CommunicationMessage[]
  >([]);

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null);

  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");

  const [view, setView] = useState<
    "inbox" | "sent" | "all"
  >("inbox");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [mobileConversationOpen, setMobileConversationOpen] =
    useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(
    null
  );

  /* =======================================================
     CURRENT AUTHORITY
  ======================================================= */

  const loadAuthority = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/login");
      return null;
    }

    const { data, error } = await supabase
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

    if (error) {
      throw new Error(
        error.message ||
          "Unable to load authority profile."
      );
    }

    if (!data) {
      await supabase.auth.signOut();
      router.replace("/login");
      return null;
    }

    return data as Authority;
  }, [router]);

  /* =======================================================
     LOAD STAFF
  ======================================================= */

  const loadStaff = useCallback(
    async (currentUserId: string) => {
      const { data, error } = await supabase
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
        .eq("is_active", true)
        .neq("user_id", currentUserId)
        .order("full_name", {
          ascending: true,
        });

      if (error) {
        throw new Error(
          error.message ||
            "Unable to load communication members."
        );
      }

      setStaff((data || []) as Authority[]);
    },
    []
  );

  /* =======================================================
     LOAD MESSAGES
  ======================================================= */

  const loadMessages = useCallback(
    async (currentUserId: string) => {
      const { data, error } = await supabase
        .from("communication_messages")
        .select(
          `
            id,
            sender_id,
            receiver_id,
            message,
            is_read,
            read_at,
            created_at,
            updated_at
          `
        )
        .or(
          `sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`
        )
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw new Error(
          error.message ||
            "Unable to load communication messages."
        );
      }

      setMessages(
        (data || []) as CommunicationMessage[]
      );
    },
    []
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  const loadData = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const currentAuthority =
          await loadAuthority();

        if (!currentAuthority) return;

        setAuthority(currentAuthority);

        await Promise.all([
          loadStaff(currentAuthority.user_id),
          loadMessages(currentAuthority.user_id),
        ]);
      } catch (err) {
        console.error(
          "Communication centre error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load communication centre."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadAuthority, loadStaff, loadMessages]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     REALTIME
  ======================================================= */

  useEffect(() => {
    if (!authority?.user_id) return;

    const channel = supabase
      .channel(
        `communication-${authority.user_id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "communication_messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage =
              payload.new as CommunicationMessage;

            if (
              newMessage.sender_id ===
                authority.user_id ||
              newMessage.receiver_id ===
                authority.user_id
            ) {
              setMessages((current) => {
                if (
                  current.some(
                    (item) =>
                      item.id === newMessage.id
                  )
                ) {
                  return current;
                }

                return [...current, newMessage];
              });
            }
          }

          if (payload.eventType === "UPDATE") {
            const updatedMessage =
              payload.new as CommunicationMessage;

            setMessages((current) =>
              current.map((item) =>
                item.id === updatedMessage.id
                  ? updatedMessage
                  : item
              )
            );
          }

          if (payload.eventType === "DELETE") {
            const deletedMessage =
              payload.old as CommunicationMessage;

            setMessages((current) =>
              current.filter(
                (item) =>
                  item.id !== deletedMessage.id
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authority?.user_id]);

  /* =======================================================
     CONVERSATIONS
  ======================================================= */

  const conversations = useMemo(() => {
    if (!authority) return [];

    return staff.map((person) => {
      const conversationMessages =
        messages.filter(
          (message) =>
            (message.sender_id ===
              authority.user_id &&
              message.receiver_id ===
                person.user_id) ||
            (message.sender_id ===
              person.user_id &&
              message.receiver_id ===
                authority.user_id)
        );

      const lastMessage =
        conversationMessages.length > 0
          ? conversationMessages[
              conversationMessages.length - 1
            ]
          : null;

      const unreadCount =
        conversationMessages.filter(
          (message) =>
            message.receiver_id ===
              authority.user_id &&
            !message.is_read
        ).length;

      return {
        person,
        messages: conversationMessages,
        lastMessage,
        unreadCount,
      };
    });
  }, [staff, messages, authority]);

  /* =======================================================
     FILTER STAFF
  ======================================================= */

  const filteredConversations =
    useMemo(() => {
      const value = search.trim().toLowerCase();

      return conversations
        .filter((conversation) => {
          if (!value) return true;

          return (
            conversation.person.full_name
              .toLowerCase()
              .includes(value) ||
            getRoleLabel(
              conversation.person
            )
              .toLowerCase()
              .includes(value) ||
            (
              conversation.person.department ||
              ""
            )
              .toLowerCase()
              .includes(value)
          );
        })
        .filter((conversation) => {
          if (view === "all") return true;

          if (view === "inbox") {
            return conversation.messages.some(
              (message) =>
                message.receiver_id ===
                authority?.user_id
            );
          }

          if (view === "sent") {
            return conversation.messages.some(
              (message) =>
                message.sender_id ===
                authority?.user_id
            );
          }

          return true;
        })
        .sort((a, b) => {
          const aTime =
            a.lastMessage
              ? new Date(
                  a.lastMessage.created_at
                ).getTime()
              : 0;

          const bTime =
            b.lastMessage
              ? new Date(
                  b.lastMessage.created_at
                ).getTime()
              : 0;

          return bTime - aTime;
        });
    }, [
      conversations,
      search,
      view,
      authority?.user_id,
    ]);

  /* =======================================================
     SELECTED CONVERSATION
  ======================================================= */

  const selectedConversation =
    useMemo(() => {
      if (!selectedUserId) return null;

      return (
        conversations.find(
          (conversation) =>
            conversation.person.user_id ===
            selectedUserId
        ) || null
      );
    }, [conversations, selectedUserId]);

  /* =======================================================
     UNREAD TOTAL
  ======================================================= */

  const unreadTotal = useMemo(() => {
    if (!authority) return 0;

    return messages.filter(
      (message) =>
        message.receiver_id ===
          authority.user_id &&
        !message.is_read
    ).length;
  }, [messages, authority]);

  /* =======================================================
     SELECT PERSON
  ======================================================= */

  const selectPerson = async (
    userId: string
  ) => {
    setSelectedUserId(userId);
    setMobileConversationOpen(true);

    if (!authority) return;

    const unreadMessages = messages.filter(
      (message) =>
        message.sender_id === userId &&
        message.receiver_id ===
          authority.user_id &&
        !message.is_read
    );

    if (unreadMessages.length === 0) return;

    const ids = unreadMessages.map(
      (message) => message.id
    );

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("communication_messages")
      .update({
        is_read: true,
        read_at: now,
        updated_at: now,
      })
      .in("id", ids)
      .eq("receiver_id", authority.user_id);

    if (error) {
      console.error(
        "Unable to mark messages as read:",
        error
      );
      return;
    }

    setMessages((current) =>
      current.map((message) =>
        ids.includes(message.id)
          ? {
              ...message,
              is_read: true,
              read_at: now,
              updated_at: now,
            }
          : message
      )
    );
  };

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = async () => {
    const text = messageText.trim();

    if (
      !text ||
      !authority ||
      !selectedConversation ||
      sending
    ) {
      return;
    }

    setSending(true);

    try {
      const receiverId =
        selectedConversation.person.user_id;

      const { data, error } = await supabase
        .from("communication_messages")
        .insert({
          sender_id: authority.user_id,
          receiver_id: receiverId,
          message: text,
        })
        .select(
          `
            id,
            sender_id,
            receiver_id,
            message,
            is_read,
            read_at,
            created_at,
            updated_at
          `
        )
        .single();

      if (error) {
        throw new Error(
          error.message ||
            "Unable to send message."
        );
      }

      if (data) {
        setMessages((current) => {
          if (
            current.some(
              (item) => item.id === data.id
            )
          ) {
            return current;
          }

          return [
            ...current,
            data as CommunicationMessage,
          ];
        });
      }

      setMessageText("");
    } catch (err) {
      console.error(
        "Send message error:",
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

  /* =======================================================
     ENTER TO SEND
  ======================================================= */

  const handleMessageKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading communication centre...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !authority) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Unable to load communication centre
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            onClick={() => loadData()}
            className="mt-6 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!authority) return null;

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

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck size={18} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="truncate text-[11px] text-blue-100">
                  {getRoleLabel(authority)}
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
              icon={<MessageCircle size={18} />}
              label="Dashboard"
              onClick={() =>
                router.push("/authority")
              }
            />

            <SidebarLink
              icon={<MessageSquare size={18} />}
              label="Events"
              onClick={() =>
                router.push("/authority/events")
              }
            />

            <SidebarLink
              icon={<Users size={18} />}
              label="Volunteers"
              onClick={() =>
                router.push(
                  "/authority/volunteers"
                )
              }
            />

            <SidebarLink
              icon={<CheckCheck size={18} />}
              label="Attendance"
              onClick={() =>
                router.push(
                  "/authority/attendance"
                )
              }
            />

            <SidebarLink
              icon={<Inbox size={18} />}
              label="Registrations"
              onClick={() =>
                router.push(
                  "/authority/registrations"
                )
              }
            />

            <SidebarLink
              icon={
                <MessageSquare size={18} />
              }
              label="Messages & Suggestions"
              active
              badge={unreadTotal}
              onClick={() =>
                router.push(
                  "/authority/messages"
                )
              }
            />

          </div>

        </nav>

        <div className="border-t border-slate-200 p-3">

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">

            <div className="flex items-center gap-2 text-[#0F2B7B]">

              <ShieldCheck size={16} />

              <span className="text-xs font-bold">
                Communication Centre
              </span>

            </div>

            <p className="mt-2 text-[10px] leading-4 text-gray-500">
              Communicate directly with authorized NSS
              authorities and coordinators.
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
          MOBILE MENU
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">

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
                  {getRoleLabel(authority)}
                </p>

              </div>

            </div>

            <nav className="flex-1 px-3 py-4">

              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Main Menu
              </p>

              <div className="mt-3 space-y-1">

                <MobileSidebarLink
                  icon={
                    <MessageCircle size={18} />
                  }
                  label="Dashboard"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority");
                  }}
                />

                <MobileSidebarLink
                  icon={
                    <MessageSquare size={18} />
                  }
                  label="Events"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/events"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<Users size={18} />}
                  label="Volunteers"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/volunteers"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={
                    <CheckCheck size={18} />
                  }
                  label="Attendance"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/attendance"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<Inbox size={18} />}
                  label="Registrations"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/registrations"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={
                    <MessageSquare size={18} />
                  }
                  label="Messages & Suggestions"
                  active
                  badge={unreadTotal}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/messages"
                    );
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
          MAIN AREA
      ===================================================== */}

      <div className="lg:pl-60">

        

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

          {/* PAGE TITLE */}

          <section className="mb-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">

                  <span>
                    Authority Portal
                  </span>

                  <ChevronRight size={13} />

                  <span className="text-[#0F2B7B]">
                    Communication
                  </span>

                </div>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Messages & Suggestions
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Direct communication between NSS
                  authorities and coordinators.
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

          {/* ERROR BANNER */}

          {error && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              <span>{error}</span>

              <button
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>

            </div>
          )}

          {/* =================================================
              COMMUNICATION LAYOUT
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="grid min-h-[calc(100vh-235px)] lg:grid-cols-[330px_1fr]">

              {/* =================================================
                  PEOPLE / INBOX
              ================================================= */}

              <div
                className={`border-r border-slate-200 ${
                  mobileConversationOpen
                    ? "hidden lg:block"
                    : "block"
                }`}
              >

                {/* PEOPLE HEADER */}

                <div className="border-b border-slate-200 p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-gray-900">
                        Communication
                      </h3>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {staff.length} active members
                      </p>

                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#0F2B7B]">
                      <Users size={18} />
                    </div>

                  </div>

                  {/* SEARCH */}

                  <div className="relative mt-4">

                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      placeholder="Search staff..."
                      className="w-full rounded-xl border border-gray-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* TABS */}

                  <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">

                    <ViewTab
                      label="Inbox"
                      active={view === "inbox"}
                      badge={unreadTotal}
                      onClick={() =>
                        setView("inbox")
                      }
                    />

                    <ViewTab
                      label="Sent"
                      active={view === "sent"}
                      onClick={() =>
                        setView("sent")
                      }
                    />

                    <ViewTab
                      label="All"
                      active={view === "all"}
                      onClick={() =>
                        setView("all")
                      }
                    />

                  </div>

                </div>

                {/* PEOPLE LIST */}

                <div className="max-h-[calc(100vh-390px)] overflow-y-auto">

                  {filteredConversations.length ===
                  0 ? (
                    <div className="p-8 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-gray-400">
                        <Users size={21} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-gray-700">
                        No conversations
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        No matching staff members found.
                      </p>

                    </div>
                  ) : (
                    filteredConversations.map(
                      (conversation) => (
                        <ConversationListItem
                          key={
                            conversation.person
                              .user_id
                          }
                          conversation={
                            conversation
                          }
                          active={
                            selectedUserId ===
                            conversation.person
                              .user_id
                          }
                          onClick={() =>
                            selectPerson(
                              conversation.person
                                .user_id
                            )
                          }
                        />
                      )
                    )
                  )}

                </div>

              </div>

              {/* =================================================
                  CHAT AREA
              ================================================= */}

              <div
                className={`flex min-w-0 flex-col ${
                  mobileConversationOpen
                    ? "flex"
                    : "hidden lg:flex"
                }`}
              >

                {selectedConversation ? (
                  <>
                    {/* CHAT HEADER */}

                    <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6">

                      <div className="flex min-w-0 items-center gap-3">

                        <button
                          onClick={() => {
                            setMobileConversationOpen(
                              false
                            );
                          }}
                          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
                        >
                          <ArrowLeft size={20} />
                        </button>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F2B7B] text-sm font-bold text-white">
                          {getInitials(
                            selectedConversation
                              .person.full_name
                          )}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                            {
                              selectedConversation
                                .person.full_name
                            }
                          </h3>

                          <p className="truncate text-xs text-gray-500">
                            {getRoleLabel(
                              selectedConversation
                                .person
                            )}

                            {selectedConversation
                              .person
                              .department &&
                              ` • ${selectedConversation.person.department}`}
                          </p>

                        </div>

                      </div>

                      <div className="hidden items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 sm:flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                        Active
                      </div>

                    </div>

                    {/* MESSAGES */}

                    <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">

                      {selectedConversation.messages.length ===
                      0 ? (
                        <div className="flex h-full min-h-[350px] items-center justify-center">

                          <div className="max-w-sm text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0F2B7B]">
                              <MessageCircle
                                size={28}
                              />
                            </div>

                            <h3 className="mt-4 font-bold text-gray-800">
                              Start a conversation
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                              Send a message to{" "}
                              <span className="font-semibold">
                                {
                                  selectedConversation
                                    .person
                                    .full_name
                                }
                              </span>
                              .
                            </p>

                          </div>

                        </div>
                      ) : (
                        <div className="mx-auto max-w-4xl space-y-3">

                          {selectedConversation.messages.map(
                            (message) => {
                              const isMine =
                                message.sender_id ===
                                authority.user_id;

                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    isMine
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >

                                  <div
                                    className={`max-w-[85%] sm:max-w-[70%] ${
                                      isMine
                                        ? "items-end"
                                        : "items-start"
                                    }`}
                                  >

                                    <div
                                      className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                        isMine
                                          ? "rounded-br-md bg-[#0F2B7B] text-white"
                                          : "rounded-bl-md border border-slate-200 bg-white text-gray-800"
                                      }`}
                                    >
                                      {message.message}
                                    </div>

                                    <div
                                      className={`mt-1 flex items-center gap-1.5 px-1 text-[10px] text-gray-400 ${
                                        isMine
                                          ? "justify-end"
                                          : "justify-start"
                                      }`}
                                    >

                                      <span>
                                        {formatMessageDate(
                                          message.created_at
                                        )}
                                      </span>

                                      {isMine &&
                                        (message.is_read ? (
                                          <CheckCheck
                                            size={13}
                                            className="text-[#1C4ED8]"
                                          />
                                        ) : (
                                          <Check
                                            size={13}
                                          />
                                        ))}

                                    </div>

                                  </div>

                                </div>
                              );
                            }
                          )}

                          <div
                            ref={
                              messagesEndRef
                            }
                          />

                        </div>
                      )}

                    </div>

                    {/* MESSAGE COMPOSER */}

                    <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">

                      <div className="mx-auto max-w-4xl">

                        <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-slate-50 p-2 focus-within:border-[#0F2B7B] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">

                          <textarea
                            value={messageText}
                            onChange={(event) =>
                              setMessageText(
                                event.target.value
                              )
                            }
                            onKeyDown={
                              handleMessageKeyDown
                            }
                            rows={1}
                            placeholder={`Write a message to ${selectedConversation.person.full_name}...`}
                            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none"
                          />

                          <button
                            onClick={sendMessage}
                            disabled={
                              sending ||
                              !messageText.trim()
                            }
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white transition hover:bg-[#163A8C] disabled:cursor-not-allowed disabled:opacity-50"
                            title="Send message"
                          >
                            {sending ? (
                              <RefreshCw
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <Send size={18} />
                            )}
                          </button>

                        </div>

                        <p className="mt-2 px-2 text-[10px] text-gray-400">
                          Press Enter to send • Shift +
                          Enter for a new line
                        </p>

                      </div>

                    </div>
                  </>
                ) : (
                  /* =================================================
                     NO CONVERSATION SELECTED
                  ================================================= */

                  <div className="flex flex-1 items-center justify-center bg-slate-50 px-6">

                    <div className="max-w-md text-center">

                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-[#0F2B7B]">
                        <MessageCircle
                          size={36}
                        />
                      </div>

                      <h2 className="mt-5 text-xl font-bold text-gray-900">
                        Communication Centre
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        Select an NSS authority or coordinator
                        from the list to view your conversation
                        or start a new message.
                      </p>

                      <div className="mt-5 flex flex-wrap justify-center gap-2">

                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                          Principal
                        </span>

                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                          Vice Principal
                        </span>

                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                          Program Officers
                        </span>

                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                          NSS Heads
                        </span>

                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                          Coordinators
                        </span>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </section>

          {/* FOOTER NOTICE */}

          <section className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">

            <div className="flex gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                <ShieldCheck size={18} />
              </div>

              <div>

                <h3 className="text-sm font-bold text-[#0F2B7B]">
                  Secure NSS Communication
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Messages are exchanged directly between
                  authenticated NSS staff members. Principal,
                  Vice Principal, Program Officers, Heads and
                  authorized coordinators can communicate with
                  one another through this centre.
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
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  icon,
  label,
  active = false,
  badge = 0,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
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

      <span className="flex-1">
        {label}
      </span>

      {badge > 0 && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
            active
              ? "bg-white text-[#0F2B7B]"
              : "bg-red-500 text-white"
          }`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}

      {active && (
        <ChevronRight size={15} />
      )}
    </button>
  );
}

/* =========================================================
   MOBILE SIDEBAR LINK
========================================================= */

function MobileSidebarLink({
  icon,
  label,
  active = false,
  badge = 0,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-[#0F2B7B] text-white"
          : "text-gray-600 hover:bg-slate-100"
      }`}
    >
      {icon}

      <span className="flex-1">
        {label}
      </span>

      {badge > 0 && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
            active
              ? "bg-white text-[#0F2B7B]"
              : "bg-red-500 text-white"
          }`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

/* =========================================================
   VIEW TAB
========================================================= */

function ViewTab({
  label,
  active,
  badge = 0,
  onClick,
}: {
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold transition ${
        active
          ? "bg-white text-[#0F2B7B] shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}

      {badge > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

/* =========================================================
   CONVERSATION LIST ITEM
========================================================= */

function ConversationListItem({
  conversation,
  active,
  onClick,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  const { person, lastMessage, unreadCount } =
    conversation;

  return (
    <button
      onClick={onClick}
      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition ${
        active
          ? "bg-blue-50"
          : "hover:bg-slate-50"
      }`}
    >

      <div
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          active
            ? "bg-[#0F2B7B] text-white"
            : "bg-slate-100 text-[#0F2B7B]"
        }`}
      >
        {getInitials(person.full_name)}

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-2">

          <p
            className={`truncate text-sm ${
              unreadCount > 0
                ? "font-bold text-gray-900"
                : "font-semibold text-gray-800"
            }`}
          >
            {person.full_name}
          </p>

          {lastMessage && (
            <span className="shrink-0 text-[10px] text-gray-400">
              {formatMessageDate(
                lastMessage.created_at
              )}
            </span>
          )}

        </div>

        <p className="mt-0.5 truncate text-[10px] font-medium text-[#0F2B7B]">
          {getRoleLabel(person)}
        </p>

        <p
          className={`mt-1 truncate text-xs ${
            unreadCount > 0
              ? "font-semibold text-gray-700"
              : "text-gray-400"
          }`}
        >
          {lastMessage
            ? lastMessage.message
            : "Start a conversation"}
        </p>

      </div>

    </button>
  );
}