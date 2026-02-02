import "server-only";

type GoogleCalendarEnv = {
  clientId: string | undefined;
  clientSecret: string | undefined;
  redirectUri: string | undefined;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

type CalendarEventResponse = {
  items?: Array<{
    id?: string;
    summary?: string;
    htmlLink?: string;
    location?: string;
    start?: { date?: string; dateTime?: string };
    end?: { date?: string; dateTime?: string };
  }>;
};

export function getGoogleCalendarEnv(): GoogleCalendarEnv {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  };
}

export function buildGoogleCalendarAuthUrl(state: string) {
  const { clientId, redirectUri } = getGoogleCalendarEnv();

  if (!clientId || !redirectUri) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleCalendarEnv();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Google OAuth code.");
  }

  return (await response.json()) as TokenResponse;
}

export async function refreshAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getGoogleCalendarEnv();

  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar OAuth is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google Calendar token.");
  }

  return (await response.json()) as TokenResponse;
}

export async function fetchCalendarEvents(accessToken: string) {
  const params = new URLSearchParams({
    maxResults: "8",
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: new Date().toISOString(),
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (response.status === 401) {
    return { status: 401 as const, events: [] };
  }

  if (!response.ok) {
    throw new Error("Failed to fetch Google Calendar events.");
  }

  const data = (await response.json()) as CalendarEventResponse;
  const events =
    data.items?.map((item, index) => ({
      id: item.id ?? `${index}`,
      summary: item.summary ?? "Untitled event",
      start: item.start?.dateTime ?? item.start?.date ?? null,
      end: item.end?.dateTime ?? item.end?.date ?? null,
      allDay: Boolean(item.start?.date && !item.start?.dateTime),
      htmlLink: item.htmlLink ?? null,
      location: item.location ?? null,
    })) ?? [];

  return { status: 200 as const, events };
}
