"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Submission } from "@/lib/types";
import { TAG_CATEGORIES, type TagId, parseTagString } from "@/lib/tags";

import { getTagClasses, resolveTagId } from "./peopleHelpers";
import PeopleTagFilterSelect from "./PeopleTagFilterSelect";
import PeopleSortSelect from "./PeopleSortSelect";

type PeopleProfilesClientProps = {
  submissions: Submission[];
  submissionsByEmail: Record<string, number>;
  selectedTag: string;
  selectedSort: "newest" | "oldest";
  basePath?: string;
};

type NotesState = Record<string, string>;
type Message = {
  id: string;
  text: string;
  sender: "user" | "contact";
  timestamp: Date;
};
type MessagesState = Record<string, Message[]>;

const NOTES_STORAGE_KEY = "tend.people.notes";
const MESSAGES_STORAGE_KEY = "tend.people.messages";

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "1d";
  }
  if (diffDays < 7) {
    return `${diffDays}d`;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatPhone = (submission: Submission) => {
  if (!submission.phoneNumber) {
    return "Not provided";
  }
  const digits = submission.phoneNumber.replace(/\D/g, "");
  let formatted = submission.phoneNumber;
  if (digits.length === 10) {
    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return formatted;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.charAt(0)?.toUpperCase() ?? "";
  return `${first}${last}` || "?";
};

export default function PeopleProfilesClient({
  submissions,
  submissionsByEmail,
  selectedTag,
  selectedSort,
  basePath,
}: PeopleProfilesClientProps) {
  const [notes, setNotes] = useState<NotesState>({});
  const [messages, setMessages] = useState<MessagesState>({});
  const [messageInput, setMessageInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState(submissions[0]?.id ?? "");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedNotes = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (storedNotes) {
      try {
        setNotes(JSON.parse(storedNotes) as NotesState);
      } catch {
        setNotes({});
      }
    }
    const storedMessages = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages) as MessagesState;
        // Convert timestamp strings back to Date objects
        Object.keys(parsed).forEach((key) => {
          parsed[key] = parsed[key].map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        });
        setMessages(parsed);
      } catch {
        setMessages({});
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [isLoaded, notes]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  }, [isLoaded, messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeEntry) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text: messageInput.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => ({
      ...prev,
      [activeEntry.submission.id]: [
        ...(prev[activeEntry.submission.id] ?? []),
        newMessage,
      ],
    }));
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedId]);

  const handleLogout = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.removeItem(NOTES_STORAGE_KEY);
    window.localStorage.removeItem(MESSAGES_STORAGE_KEY);
    window.location.href = "/";
  };

  useEffect(() => {
    if (!selectedId && submissions[0]?.id) {
      setSelectedId(submissions[0].id);
    }
  }, [selectedId, submissions]);

  const submissionsWithTagData = useMemo(
    () =>
      submissions.map((submission) => ({
        submission,
        tags: parseTagString(submission.tags),
      })),
    [submissions]
  );

  const selectedEntry = submissionsWithTagData.find(
    (entry) => entry.submission.id === selectedId
  );
  const activeEntry = selectedEntry ?? submissionsWithTagData[0];

  const getInboxSource = (submission: Submission) => {
    const source = (submission as Submission & { source?: string }).source;
    if (source === "sms" || source === "email" || source === "social") {
      return source;
    }
    return "form";
  };

  const renderSourceIcon = (source: "sms" | "email" | "social" | "form") => {
    if (source === "sms") {
      return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      );
    }
    if (source === "email") {
      return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m22 8-10 6L2 8" />
        </svg>
      );
    }
    if (source === "social") {
      return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a3 3 0 1 1-3-3 3 3 0 0 1 3 3Zm0 8a3 3 0 1 1-3-3 3 3 0 0 1 3 3ZM6 12a3 3 0 1 1-3-3 3 3 0 0 1 3 3Zm6-1 2.5-1.5M12 13l2.5 1.5" />
        </svg>
      );
    }
    return (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      </svg>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Inbox list */}
      <aside className="w-72 shrink-0 border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <PeopleTagFilterSelect selectedTag={selectedTag} basePath={basePath} />
            <PeopleSortSelect
              selectedTag={selectedTag}
              selectedSort={selectedSort}
              basePath={basePath}
            />
          </div>
        </div>
        <div className="h-[calc(100vh-57px)] overflow-y-auto">
          {submissionsWithTagData.map(({ submission, tags }, index) => {
            const details = submission.additionalDetails ?? "";
            const snippet =
              details.length > 60 ? `${details.slice(0, 60)}...` : details;
            const isActive = submission.id === activeEntry?.submission.id;
            const inboxSource = getInboxSource(submission);
            return (
              <button
                key={submission.id}
                type="button"
                onClick={() => setSelectedId(submission.id)}
                className={`relative w-full px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-purple-50/70"
                    : "bg-transparent hover:bg-white/70"
                } ${index > 0 ? "border-t border-gray-100" : ""}`}
              >
                {/* Colored dot indicator */}
                <span
                  className={`absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${
                    isActive ? "bg-purple-500" : "bg-blue-500"
                  }`}
                />

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                    {submission.firstName} {submission.lastName}
                  </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-gray-400">
                      <span className="rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-gray-500">
                        {renderSourceIcon(inboxSource)}
                      </span>
                      <span>
                        {inboxSource === "sms"
                          ? "Text"
                          : inboxSource === "email"
                          ? "Email"
                          : inboxSource === "social"
                          ? "DM"
                          : "Form"}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatDate(submission.createdAt)}
                  </span>
                </div>

                {submission.helpTopic ? (
                  <p className="mt-0.5 text-xs font-medium text-gray-700">
                    {submission.helpTopic}
                  </p>
                ) : null}

                {snippet ? (
                  <p className="mt-1 text-xs text-gray-500">{snippet}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat / Messaging panel */}
      <section className="flex min-w-0 flex-1 flex-col border-r border-gray-200 bg-[#f7f7f7] overflow-hidden">
        {activeEntry ? (
          <>
            {/* Chat header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                  {getInitials(
                    activeEntry.submission.firstName,
                    activeEntry.submission.lastName
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {activeEntry.submission.firstName}{" "}
                    {activeEntry.submission.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeEntry.submission.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                    JD
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900">
                      John Doe
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-[11px] font-medium text-purple-600 hover:text-purple-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat messages area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-4">
              {/* Timestamp */}
              <div className="mb-6 flex justify-center">
                <span className="rounded-full bg-gray-200/80 px-3 py-1 text-xs text-gray-500">
                  {formatDate(activeEntry.submission.createdAt)}
                </span>
              </div>

              {/* Initial submission as incoming message */}
              <div className="mb-4 flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                  {getInitials(
                    activeEntry.submission.firstName,
                    activeEntry.submission.lastName
                  )}
                </div>
                <div className="max-w-md">
                  <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-sm">
                    <p className="text-sm text-gray-800">
                      {activeEntry.submission.additionalDetails ||
                        `Hi, I need help with ${activeEntry.submission.helpTopic || "something"}.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI suggestion card (if applicable) */}
              {activeEntry.submission.helpTopic && (
                <div className="mb-4 flex items-start gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs text-teal-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                    </svg>
                  </div>
                  <p className="text-xs italic text-teal-600">
                    Grace (AI) is looking for the best resource...
                  </p>
                </div>
              )}

              {/* Sent messages */}
              {(messages[activeEntry.submission.id] ?? []).map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex items-end gap-2 ${
                    msg.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {msg.sender === "user" ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                      JD
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                      {getInitials(
                        activeEntry.submission.firstName,
                        activeEntry.submission.lastName
                      )}
                    </div>
                  )}
                  <div className="max-w-md">
                    <div
                      className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                        msg.sender === "user"
                          ? "rounded-tr-sm bg-gray-900 text-white"
                          : "rounded-tl-sm bg-white text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <p
                      className={`mt-1 text-[11px] text-gray-400 ${
                        msg.sender === "user" ? "text-right" : ""
                      }`}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Empty state if no messages yet */}
              {(messages[activeEntry.submission.id] ?? []).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-xs text-gray-400">
                    Send a test message below
                  </p>
                </div>
              )}
            </div>

            {/* Chat input area */}
            <div className="relative shrink-0 border-t border-gray-100 bg-white px-4 py-3">
              <button
                type="button"
                className="absolute right-4 top-3 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-600"
              >
                Assign
              </button>
              {/* Quick action pills */}
              <div className="mb-3 flex flex-wrap gap-2 pr-20">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
                >
                  <svg className="h-3 w-3 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                  Service Times
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
                >
                  <svg className="h-3 w-3 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                  Benevolence Process
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
                >
                  <svg className="h-3 w-3 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                  </svg>
                  Prayer Commitment
                </button>
              </div>

              {/* Reply/Notes tabs */}
              <div className="mb-2 flex items-center gap-4 border-b border-gray-100 pb-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-900"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Notes
                </button>
              </div>

              {/* Input field */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Write a reply via SMS..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              {/* Bottom actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
            Select a conversation to view messages.
          </div>
        )}
      </section>

      {/* Profile info panel (right) */}
      <aside className="w-80 shrink-0 overflow-y-auto bg-white">
        {activeEntry ? (
          <div className="p-5">
            {/* Profile header */}
            <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-xl font-semibold text-purple-700 ring-4 ring-purple-50">
                {getInitials(
                  activeEntry.submission.firstName,
                  activeEntry.submission.lastName
                )}
              </div>
              <p className="text-base font-semibold text-gray-900">
                {activeEntry.submission.firstName} {activeEntry.submission.lastName}
              </p>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Profile
              </p>
              <p className="mt-1 text-sm text-gray-500">{activeEntry.submission.email}</p>
            </div>

            {/* Topic tag */}
            {activeEntry.submission.helpTopic ? (
              <div className="mb-4 text-center">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getTagClasses(
                    resolveTagId(activeEntry.submission.helpTopic) ?? "other"
                  )}`}
                >
                  {activeEntry.submission.helpTopic}
                </span>
              </div>
            ) : null}

            {/* Contact info */}
            <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M7 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7zm3 15a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 10 17z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPhone(activeEntry.submission)}
                  </p>
                  <p className="text-xs text-gray-400">Mobile contact</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="h-4 w-4"
                      fill="currentColor"
                    >
                      <path d="M10 2a6 6 0 0 1 6 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 0 1 6-6zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {activeEntry.submission.primaryCampus
                        ? activeEntry.submission.primaryCampus
                            .replace(/\s*campus\s*/i, "")
                            .trim()
                        : "Not shared"}
                    </p>
                    <p className="text-xs text-gray-400">Campus</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-700">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="h-4 w-4"
                      fill="currentColor"
                    >
                      <path d="M6 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6l4 3V4a2 2 0 0 0-2-2H6z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                    {formatNumber(submissionsByEmail[activeEntry.submission.email] ?? 1)}
                    </p>
                    <p className="text-xs text-gray-400">Submission</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Tags */}
            <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-gray-400">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeEntry.tags.length > 0 ? (
                  activeEntry.tags.map((tag) => {
                    const label =
                      TAG_CATEGORIES.find((category) => category.id === tag)
                        ?.label ?? tag;
                    return (
                      <span
                        key={`${activeEntry.submission.id}-${tag}`}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getTagClasses(
                          tag as TagId
                        )}`}
                      >
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                    Untagged
                  </span>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <label
                htmlFor={`notes-${activeEntry.submission.id}`}
                className="text-xs font-medium uppercase tracking-widest text-gray-400"
              >
                Internal notes
              </label>
              <textarea
                id={`notes-${activeEntry.submission.id}`}
                value={notes[activeEntry.submission.id] ?? ""}
                onChange={(event) =>
                  setNotes((prev) => ({
                    ...prev,
                    [activeEntry.submission.id]: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Add internal notes..."
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Notes are saved locally.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Select a profile to view details.
          </div>
        )}
      </aside>
    </div>
  );
}
