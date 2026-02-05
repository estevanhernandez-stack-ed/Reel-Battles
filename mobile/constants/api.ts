import Constants from "expo-constants";

function getApiUrl(): string {
  const extra = Constants.expoConfig?.extra;
  if (extra?.apiBase) {
    return extra.apiBase;
  }

  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const host = debuggerHost.split(":")[0];
      return `http://${host}:5000`;
    }
    return "http://localhost:5000";
  }

  return "https://cinegame.replit.app";
}

export const API_BASE = getApiUrl();

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
