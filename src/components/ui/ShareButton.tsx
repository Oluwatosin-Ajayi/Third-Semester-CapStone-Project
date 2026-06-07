"use client";

import { useState } from "react";
import type { Hospital } from "@/types";

interface ShareButtonProps {
  shareUrl: string;
  hospitals: Hospital[];
}

export default function ShareButton({ shareUrl, hospitals }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleHospital(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  async function handleEmailSend() {
    if (!email || selectedIds.length === 0) return;
    setSending(true);
    setEmailError("");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, hospitalIds: selectedIds }),
      });
      if (!res.ok) {
        const err = await res.json();
        setEmailError(err.error ?? "Failed to send email");
      } else {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setOpen(false);
        }, 2000);
      }
    } catch {
      setEmailError("Network error — please try again");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:border-green-400 transition-colors whitespace-nowrap"
      >
        Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Share Results</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Copy link */}
            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                Shareable Link
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 truncate"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Email share */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                Send via Email
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              {/* Hospital selection */}
              {hospitals.length > 0 && (
                <div className="border border-gray-100 rounded-xl max-h-40 overflow-y-auto mb-3">
                  {hospitals.slice(0, 20).map((h) => (
                    <label
                      key={h.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(h.id)}
                        onChange={() => toggleHospital(h.id)}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-xs text-gray-700 truncate">
                        {h.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {emailError && (
                <p className="text-xs text-red-500 mb-2">{emailError}</p>
              )}

              <button
                onClick={handleEmailSend}
                disabled={sending || !email || selectedIds.length === 0 || sent}
                className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-40"
              >
                {sent
                  ? "Sent! ✓"
                  : sending
                    ? "Sending..."
                    : `Send to ${selectedIds.length} hospital${selectedIds.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
