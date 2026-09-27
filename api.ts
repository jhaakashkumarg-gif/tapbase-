export interface SessionInput {
  email: string;
  method: "password" | "magic_link";
}

export interface AttendanceInput {
  status: "checked_in" | "checked_out";
  campusName: string;
  occurredAt: string;
}

export interface ReminderMutationInput {
  reminderId: string;
  action: "created" | "updated" | "completed";
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

const baseUrl = (import.meta.env.VITE_GEOSYNC_API_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!baseUrl) {
    throw new Error("GeoSync API is not configured.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

/**
 * Backend boundary for the GeoSync web client. Set VITE_GEOSYNC_API_URL to
 * enable these calls; without it, the MVP remains in local demonstration mode.
 */
export const geoSyncApi = {
  isConfigured: Boolean(baseUrl),
  auth: {
    createSession: (input: SessionInput) => request<{ accessToken?: string; user?: unknown }>("/auth/session", {
      method: "POST",
      body: input,
    }),
  },
  attendance: {
    update: (input: AttendanceInput) => request<void>("/attendance", {
      method: "POST",
      body: input,
    }),
  },
  reminders: {
    mutate: (input: ReminderMutationInput) => request<void>("/reminders/events", {
      method: "POST",
      body: input,
    }),
  },
};
