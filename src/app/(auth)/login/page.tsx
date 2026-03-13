"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../hooks";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/chat");
    } catch {
      // error already set in context
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 40px 10px 13px",
    borderRadius: 9,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(74,222,128,0.18)",
    color: "#d1fae5",
    fontSize: 16,
    fontFamily: "DM Sans, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      className="w-full overflow-y-auto"
      style={{ background: "#09160d", minHeight: "100dvh" }}
    >
      <div className="flex justify-center px-4 py-8 sm:py-16">
        <div
          className="w-full rounded-2xl p-5 sm:p-8"
          style={{
            maxWidth: 400,
            background: "#0b1d0f",
            border: "1px solid rgba(74,222,128,0.18)",
          }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div
              className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-black text-[19px] shrink-0"
              style={{
                background: "linear-gradient(135deg,#4ade80,#16a34a)",
                color: "#09160d",
              }}
            >
              A
            </div>
            <div>
              <div className="font-bold text-[16px] text-white">Amara</div>
              <div
                className="text-[11px]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                by GGCL Academy
              </div>
            </div>
          </div>

          <div className="font-bold text-[18px] sm:text-[20px] text-white mb-1">
            Welcome back
          </div>
          <div
            className="text-[13px] mb-5 sm:mb-6"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Sign in to continue your learning journey
          </div>

          {error && (
            <div
              className="text-[12.5px] px-4 py-3 rounded-lg mb-5"
              style={{
                background: "rgba(239,68,68,0.09)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-[11.5px] mb-2"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                style={inputStyle}
              />
            </div>

            <div className="mb-5 sm:mb-6">
              <label
                className="block text-[11.5px] mb-2"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[16px]"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.35)",
                    padding: 0,
                  }}
                  tabIndex={-1}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-[11px] rounded-[9px] font-bold text-[14px] border-none"
              style={{
                background: "linear-gradient(135deg,#4ade80,#16a34a)",
                color: "#09160d",
                fontFamily: "DM Sans, sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div
            className="text-center mt-5 text-[13px]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#4ade80" }}>
              Create one
            </Link>
          </div>
          <div className="text-center mt-3">
            <Link
              href="/chat"
              className="text-[12px]"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Continue without signing in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
