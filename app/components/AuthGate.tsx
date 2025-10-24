"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "../lib/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        router.replace("/login");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }
    setChecked(true);
    // Soft-validate token by calling /users/me; if unauthorized, redirect
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";
    fetch(`${apiBase}/users/me`, { headers: authHeaders() as HeadersInit })
      .then((r) => {
        if (r.ok) {
          setValid(true);
        } else {
          // Clear bad token and redirect
          try {
            localStorage.removeItem("jwt");
          } catch {}
          router.replace("/login");
        }
      })
      .catch(() => {
        // Network/API down — still block access
        try {
          localStorage.removeItem("jwt");
        } catch {}
        router.replace("/login");
      });
  }, [router]);

  if (!checked || !valid) return null;
  return <>{children}</>;
}
