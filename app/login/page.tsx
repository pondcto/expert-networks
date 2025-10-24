"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";

// Helper function to parse API errors into user-friendly messages
const parseApiError = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json();
    
    // Handle specific FastAPI error codes
    switch (errorData.detail) {
      case "LOGIN_BAD_CREDENTIALS":
        return "Invalid email or password. Please check your credentials and try again.";
      case "REGISTER_USER_ALREADY_EXISTS":
        return "An account with this email already exists. Please sign in instead.";
      case "REGISTER_INVALID_PASSWORD":
        return "Password must be at least 8 characters long.";
      case "LOGIN_USER_NOT_VERIFIED":
        return "Please verify your email address before signing in.";
      default:
        // If it's a string detail, return it; otherwise provide generic message
        if (typeof errorData.detail === 'string') {
          return errorData.detail.replace(/_/g, ' ').toLowerCase();
        }
        return "Authentication failed. Please try again.";
    }
  } catch {
    // If JSON parsing fails, return generic message
    return "An error occurred. Please try again.";
  }
};

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch(`${apiBase}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: name || undefined }),
        });
        if (!res.ok) {
          const errorMessage = await parseApiError(res);
          throw new Error(errorMessage);
        }
      }
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const res = await fetch(`${apiBase}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      if (!res.ok) {
        const errorMessage = await parseApiError(res);
        throw new Error(errorMessage);
      }
      const data = await res.json();
      const token = data?.access_token || data?.token || data;
      if (!token || typeof token !== "string") throw new Error("Invalid token response");
      localStorage.setItem("jwt", token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/images/login-bg.png')]">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md card">
          <div className="mb-5 text-center">
            <h1 className="text-title md:text-headline text-light-text dark:text-dark-text">
              Welcome to WindShift
            </h1>
            <div className="mt-1 text-title text-light-text-secondary dark:text-dark-text-secondary">Expert Networks Module</div>
          </div>
          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="block text-body-sm mb-1">Name</label>
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label className="block text-body-sm mb-1">E‑mail</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-body-sm mb-1">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? (mode === "signup" ? "Creating…" : "Signing in…") : mode === "signup" ? "Sign Up" : "Sign In"}
            </button>
            {error && <div className="text-red-600 text-body-sm">{error}</div>}
          </form>
          <div className="mt-4 text-body-sm text-light-text-secondary dark:text-dark-text-secondary text-center">
            {mode === "signup" ? (
              <span>
                Have an account?{" "}
                <button className="text-primary-500 hover:opacity-90" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                New here?{" "}
                <button className="text-primary-500 hover:opacity-90" onClick={() => setMode("signup")}>
                  Create account
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


