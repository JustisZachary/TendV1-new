"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  summary: string;
  start: string | null;
  end: string | null;
  allDay: boolean;
  htmlLink: string | null;
  location: string | null;
};

type CalendarResponse = {
  events: CalendarEvent[];
};

type LoadState = "loading" | "disconnected" | "connected" | "error";

const buttonClassName =
  "inline-flex items-center gap-2 rounded-full bg-[#5b5ce6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4b4dd8]";

const formatOptions: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

function formatEventDate(value: string | null, allDay: boolean) {
  if (!value) {
    return "Date TBD";
  }

  const formatter = new Intl.DateTimeFormat(
    "en-US",
    allDay ? { dateStyle: "medium" } : formatOptions,
  );
  return formatter.format(new Date(value));
}

export default function CalendarEventsClient() {
  const [state, setState] = useState<LoadState>("loading");
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const description = useMemo(() => {
    if (state === "connected") {
      return "Your Google Calendar events are synced below.";
    }
    if (state === "disconnected") {
      return "Link Google Calendar to see upcoming meetings here.";
    }
    if (state === "error") {
      return "We hit a snag loading Google Calendar. Try reconnecting.";
    }
    return "Checking for a connected calendar...";
  }, [state]);

  useEffect(() => {
    let ignore = false;

    const loadEvents = async () => {
      try {
        const response = await fetch("/api/google-calendar/events");

        if (ignore) {
          return;
        }

        if (response.status === 401) {
          setState("disconnected");
          return;
        }

        if (!response.ok) {
          setState("error");
          return;
        }

        const data = (await response.json()) as CalendarResponse;
        setEvents(data.events ?? []);
        setState("connected");
      } catch {
        if (!ignore) {
          setState("error");
        }
      }
    };

    loadEvents();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="mt-0 flex min-h-[60vh] flex-col items-center justify-center px-2 py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <svg
          aria-hidden="true"
          className="h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V5m8 2V5M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        {state === "connected" ? "Your calendar" : "No calendars"}
      </h2>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      {(state === "disconnected" || state === "error") && (
        <div className="mt-6 flex justify-center">
          <a className={buttonClassName} href="/api/google-calendar/connect">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1a6.5 6.5 0 0 1 0-13c1.9 0 3.2.8 4 1.5l2.7-2.6C17.2 2.5 14.9 1.5 12 1.5 6.9 1.5 2.7 5.7 2.7 10.8S6.9 20.1 12 20.1c6 0 7.5-4.2 7.5-6.4 0-.4 0-.7-.1-1H12z"
                />
                <path
                  fill="#34A853"
                  d="M3.9 7.4l3.2 2.3A5.4 5.4 0 0 1 12 5.3c1.5 0 2.8.5 3.8 1.4l2.7-2.6C16.7 2.5 14.5 1.5 12 1.5a9.3 9.3 0 0 0-8.1 5.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 20.1c2.4 0 4.5-.8 6-2.1l-2.8-2.3c-.8.6-1.8 1-3.2 1a5.4 5.4 0 0 1-5.1-3.7l-3.2 2.5a9.3 9.3 0 0 0 8.3 4.8z"
                />
                <path
                  fill="#4285F4"
                  d="M19.4 11.6H12v3.9h5.5c-.3 1.1-1 2.1-2 2.8l2.8 2.3c1.6-1.4 2.7-3.6 2.7-6.1 0-.4 0-.7-.1-1z"
                />
              </svg>
            </span>
            Add with Google
          </a>
        </div>
      )}

      {state === "connected" && (
        <div className="mt-6 space-y-3 text-left">
          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
              No upcoming events found yet.
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {event.summary}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatEventDate(event.start, event.allDay)}
                      {event.end ? ` • Ends ${formatEventDate(event.end, event.allDay)}` : ""}
                    </p>
                    {event.location && (
                      <p className="mt-1 text-xs text-gray-500">
                        {event.location}
                      </p>
                    )}
                  </div>
                  {event.htmlLink && (
                    <a
                      className="text-xs font-semibold text-purple-700 hover:text-purple-800"
                      href={event.htmlLink}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open in Google
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
