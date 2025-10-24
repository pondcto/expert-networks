export function getToken(): string | null {
  try {
    return localStorage.getItem("jwt");
  } catch {
    return null;
  }
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = typeof window !== "undefined" ? getToken() : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return { ...(extra || {}), ...headers };
}


