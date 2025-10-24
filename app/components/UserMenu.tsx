"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut } from "lucide-react";

type Me = {
  id?: string;
  email?: string;
  is_active?: boolean;
  is_verified?: boolean;
  full_name?: string | null;
};

export default function UserMenu() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://3.236.237.205:8080";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!token) return;
    setLoading(true);
    fetch(`${apiBase}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => setMe(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiBase]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const onLogout = () => {
    try { localStorage.removeItem("jwt"); } catch {}
    setOpen(false);
    router.replace("/login");
  };

  const initials = (me?.full_name || me?.email || "").slice(0, 1).toUpperCase() || "U";
  const shortId = me?.id ? String(me.id).split("-")?.[0] : undefined;
  const nameFromEmail = me?.full_name || (me?.email || "").split("@")[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 w-9 rounded-full flex items-center justify-center border border-light-border dark:border-transparent bg-primary-500/10 text-primary-600 dark:bg-primary-500 dark:text-white"
        title="Account"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserIcon className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 card p-3 z-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-full flex items-center justify-center border border-light-border dark:border-dark-border bg-primary-500/10 text-primary-600 dark:bg-primary-500 dark:text-white">
              <span className="text-body font-semibold">{initials}</span>
            </div>
            <div className="min-w-0">
              <div className="text-body-sm font-semibold text-light-text dark:text-dark-text truncate">
                {loading ? "Loading…" : (nameFromEmail || "User")}
              </div>
              <div className="text-caption text-light-text-secondary dark:text-dark-text-secondary truncate" title={me?.email || ""}>
                {me?.email || ""}
              </div>
            </div>
          </div>
          <div className="text-caption text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
            {me ? "Logged in" : "Not authenticated"}{shortId ? ` · ${shortId}` : ""}
          </div>
          <div className="flex justify-end">
            <button onClick={onLogout} className="btn-secondary px-3 py-1 text-body-sm inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


