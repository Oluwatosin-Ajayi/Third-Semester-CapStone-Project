import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { getHospitalById, getReviews } from "@/lib/supabase/query";
import RatingWidget from "@/components/hospital/RatingWidget";
import { SPECIALTIES } from "@/lib/schema";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const hospital = await getHospitalById(resolvedParams.id);
  if (!hospital) return { title: "Hospital not found" };
  return {
    title: `${hospital.name} — Carefinder`,
    description: `${hospital.name} in ${hospital.city}, ${hospital.lga} LGA. Specialties: ${hospital.specialties.join(", ")}.`,
  };
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating);
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i <= stars ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function HospitalDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const [hospital, reviews] = await Promise.all([
    getHospitalById(resolvedParams.id),
    getReviews(resolvedParams.id, "approved"),
  ]);

  if (!hospital) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/search"
          className="text-sm text-green-600 hover:underline mb-6 inline-block"
        >
          ← Back to search
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {hospital.name}
              </h1>
              <p className="text-gray-500">
                {hospital.address}, {hospital.city}
              </p>
              <p className="text-gray-400 text-sm">{hospital.lga} LGA</p>
            </div>
            <span
              className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                hospital.ownership === "public"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {hospital.ownership}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={hospital.rating_avg} />
            <span className="text-gray-600 text-sm">
              {hospital.rating_avg > 0
                ? `${hospital.rating_avg.toFixed(1)} / 5`
                : "No ratings yet"}
              {hospital.review_count > 0 &&
                ` · ${hospital.review_count} review${hospital.review_count !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mb-4">
            {hospital.specialties.map((s) => (
              <span
                key={s}
                className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm capitalize"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Phone
              </p>
              <a
                href={`tel:${hospital.phone}`}
                className="text-green-600 font-medium hover:underline"
              >
                {hospital.phone}
              </a>
            </div>
            {hospital.email && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Email
                </p>
                <a
                  href={`mailto:${hospital.email}`}
                  className="text-green-600 font-medium hover:underline"
                >
                  {hospital.email}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {hospital.description_md && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-3">About</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: hospital.description_md }}
                />
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No approved reviews yet. Be the first to review!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.text && (
                        <p className="text-sm text-gray-600">{review.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {hospital.visiting_hours && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  Visiting Hours
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {hospital.visiting_hours}
                </p>
              </div>
            )}

            {/* Rating widget */}
            <RatingWidget
              hospitalId={hospital.id}
              aggregateRating={hospital.rating_avg}
              reviewCount={hospital.review_count}
            />

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <a
                  href={`tel:${hospital.phone}`}
                  className="block w-full text-center py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  📞 Call Now
                </a>
                <Link
                  href={`/search?city=${hospital.city}`}
                  className="block w-full text-center py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  More in {hospital.city}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
