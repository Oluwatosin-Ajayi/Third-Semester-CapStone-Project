import { createClient } from "@/lib/supabase/server";
import ReviewModerationRow from "@/components/admin/ReviewModerationRow";

export default async function ReviewsPage() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .order("created_at", { ascending: true });

  const pending = reviews?.filter((r) => r.status === "pending") ?? [];
  const others = reviews?.filter((r) => r.status !== "pending") ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-gray-500 text-sm mt-1">
          Approve or hide reviews submitted by users
        </p>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-2xl border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <h2 className="font-semibold text-gray-900">Pending</h2>
          {pending.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
              {pending.length} to review
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-gray-400 text-sm">
              No pending reviews — all caught up! ✅
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map((review) => (
              <ReviewModerationRow
                key={review.id}
                review={{
                  ...review,
                  hospital_name: review.hospitals?.name ?? "Unknown",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past moderated */}
      {others.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Moderated</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {others.map((review) => (
              <ReviewModerationRow
                key={review.id}
                review={{
                  ...review,
                  hospital_name: review.hospitals?.name ?? "Unknown",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
