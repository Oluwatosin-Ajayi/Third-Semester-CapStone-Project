"use client";

import { SPECIALTIES } from "@/lib/schema";
import type { FilterState } from "@/types";

interface FilterPanelProps {
  specialties: string[];
  ownership: "public" | "private" | null;
  radius: number | null;
  hasLocation: boolean;
  onChange: (filters: FilterState) => void;
}

const RADIUS_OPTIONS = [5, 10, 25, 50];

export default function FilterPanel({
  specialties,
  ownership,
  radius,
  hasLocation,
  onChange,
}: FilterPanelProps) {
  function toggleSpecialty(specialty: string) {
    const next = specialties.includes(specialty)
      ? specialties.filter((s) => s !== specialty)
      : [...specialties, specialty];
    onChange({ specialties: next, ownership, radius });
  }

  function setOwnership(val: "public" | "private" | null) {
    onChange({ specialties, ownership: val, radius });
  }

  function setRadius(val: number | null) {
    onChange({ specialties, ownership, radius: val });
  }

  function clearAll() {
    onChange({ specialties: [], ownership: null, radius: null });
  }

  const hasFilters =
    specialties.length > 0 || ownership !== null || radius !== null;

  return (
    <aside className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-green-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Ownership */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Ownership
        </h3>
        <div className="flex gap-2">
          {(["public", "private"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOwnership(ownership === type ? null : type)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-colors capitalize ${
                ownership === type
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-200 text-gray-600 hover:border-green-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Distance
        </h3>
        {!hasLocation ? (
          <p className="text-xs text-gray-400">
            Enable location to filter by distance
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((km) => (
              <button
                key={km}
                onClick={() => setRadius(radius === km ? null : km)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  radius === km
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-200 text-gray-600 hover:border-green-400"
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Specialties */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Specialties
        </h3>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((specialty) => (
            <button
              key={specialty}
              onClick={() => toggleSpecialty(specialty)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                specialties.includes(specialty)
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "border-gray-200 text-gray-600 hover:border-green-300"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
