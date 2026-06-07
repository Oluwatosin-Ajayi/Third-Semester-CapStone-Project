"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/types";

interface Props {
  review: Review & { hospital_name: string };
}

export default function ReviewModerationRow({ review }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(review.status);

  async function moderate(status: "approved" | "hidden") {
    setLoading(true);
    const res = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setCurrent(status);
      router.refresh();
    }
    setLoading(false);
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    hidden: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="px-6 py-4 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-sm text-gray-900">
            {review.hospital_name}
          </span>
          <span className="text-gray-300">·</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${
                  i <= review.rating ? "text-yellow-400" : "text-gray-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${statusColors[current]}`}
          >
            {current}
          </span>
        </div>
        {review.text && (
          <p className="text-sm text-gray-600 mb-1">{review.text}</p>
        )}
        <p className="text-xs text-gray-400">
          {new Date(review.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        {current !== "approved" && (
          <button
            onClick={() => moderate("approved")}
            disabled={loading}
            className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {current !== "hidden" && (
          <button
            onClick={() => moderate("hidden")}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Hide
          </button>
        )}
      </div>
    </div>
  );
}
