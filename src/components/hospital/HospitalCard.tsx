import Link from "next/link";
import type { Hospital } from "@/types";

interface HospitalCardProps {
  hospital: Hospital;
  distance?: number | null;
  showActions?: boolean;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${
              i <= stars ? "text-yellow-400" : "text-gray-200"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {rating > 0 ? rating.toFixed(1) : "No ratings"}{" "}
        {count > 0 && `(${count})`}
      </span>
    </div>
  );
}

export default function HospitalCard({
  hospital,
  distance,
  showActions = false,
}: HospitalCardProps) {
  return (
    <Link
      href={`/hospitals/${hospital.id}`}
      className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-md transition-all group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-green-700 transition-colors truncate">
            {hospital.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {hospital.address}, {hospital.city}
          </p>
        </div>

        {/* Ownership badge */}
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
            hospital.ownership === "public"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {hospital.ownership}
        </span>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating
          rating={hospital.rating_avg}
          count={hospital.review_count}
        />
      </div>

      {/* Specialties */}
      {hospital.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hospital.specialties.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize"
            >
              {s}
            </span>
          ))}
          {hospital.specialties.length > 4 && (
            <span className="text-xs text-gray-400">
              +{hospital.specialties.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{hospital.lga} LGA</span>
        {distance != null && (
          <span className="text-green-600 font-medium">
            📍 {distance.toFixed(1)} km away
          </span>
        )}
      </div>
    </Link>
  );
}
