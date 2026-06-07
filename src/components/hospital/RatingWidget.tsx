"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthModal from "@/components/ui/AuthModal";

interface RatingWidgetProps {
  hospitalId: string;
  aggregateRating: number;
  reviewCount: number;
}

export default function RatingWidget({
  hospitalId,
  aggregateRating,
  reviewCount,
}: RatingWidgetProps) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Check current user session
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if user already reviewed this hospital
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("reviews")
      .select("rating, text")
      .eq("hospital_id", hospitalId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setExistingRating(data.rating);
          setSelectedRating(data.rating);
          setReviewText(data.text ?? "");
          setSubmitted(true);
        }
      });
  }, [user, hospitalId]);

  async function handleSubmit() {
    if (!selectedRating) {
      setError("Please select a star rating");
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hospital_id: hospitalId,
        rating: selectedRating,
        text: reviewText.trim() || undefined,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
      setExistingRating(selectedRating);
      setShowForm(false);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to submit review");
    }

    setSubmitting(false);
  }

  function handleAuthSuccess() {
    setShowAuthModal(false);
    setShowForm(true);
  }

  const displayStar = hoveredStar ?? selectedRating ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Rate this Hospital</h2>

      {/* Aggregate rating display */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
        <div className="text-4xl font-bold text-gray-900">
          {aggregateRating > 0 ? aggregateRating.toFixed(1) : "—"}
        </div>
        <div>
          <div className="flex mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${
                  i <= Math.round(aggregateRating)
                    ? "text-yellow-400"
                    : "text-gray-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {reviewCount > 0
              ? `${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
              : "No reviews yet"}
          </p>
        </div>
      </div>

      {/* Submitted confirmation */}
      {submitted && !showForm && (
        <div className="text-center py-2">
          <p className="text-green-600 font-medium text-sm mb-1">
            ✅ Your review has been submitted
          </p>
          <p className="text-gray-400 text-xs mb-3">
            It will appear after admin approval
          </p>
          <div className="flex justify-center mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className={`w-6 h-6 ${
                  i <= (existingRating ?? 0)
                    ? "text-yellow-400"
                    : "text-gray-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-green-600 hover:underline"
          >
            Edit your review
          </button>
        </div>
      )}

      {/* Not logged in */}
      {!user && !submitted && (
        <div className="text-center py-2">
          <p className="text-gray-500 text-sm mb-3">
            Sign in to leave a review
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Sign in / Sign up
          </button>
        </div>
      )}

      {/* Review form */}
      {(user || showForm) && (!submitted || showForm) && (
        <div>
          {user && (
            <p className="text-xs text-gray-400 mb-3">
              Signed in as {user.email}
            </p>
          )}

          {/* Star selector */}
          <p className="text-sm font-medium text-gray-700 mb-2">Your rating</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => setSelectedRating(star)}
                className="focus:outline-none"
                aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    star <= displayStar
                      ? "text-yellow-400"
                      : "text-gray-200 hover:text-yellow-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            {selectedRating && (
              <span className="ml-2 text-sm text-gray-500 self-center">
                {
                  ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                    selectedRating
                  ]
                }
              </span>
            )}
          </div>

          {/* Review text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Review{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Share your experience with this hospital..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {reviewText.length}/1000
            </p>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedRating}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            {showForm && submitted && (
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth modal */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
