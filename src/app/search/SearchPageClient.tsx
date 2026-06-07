"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/ui/Navbar";
import SearchBar from "@/app/search/SearchBar";
import FilterPanel from "@/app/search/FilterPanel";
import HospitalCard from "@/components/hospital/HospitalCard";
import ExportButton from "@/components/ui/ExportButton";
import ShareButton from "@/components/ui/ShareButton";
import { createClient } from "@/lib/supabase/client";
import { buildShareUrl } from "@/lib/share";
import type { Hospital, FilterState } from "@/types";

// Lazy-load map — avoids SSR hydration errors
const HospitalMap = dynamic(() => import("@/components/map/HospitalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading map...</p>
    </div>
  ),
});

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  // Read initial state from URL
  const query = searchParams.get("query") ?? "";
  const city = searchParams.get("city") ?? undefined;
  const lga = searchParams.get("lga") ?? undefined;
  const ownership = searchParams.get("ownership") as
    | "public"
    | "private"
    | null;
  const radius = searchParams.get("radius")
    ? Number(searchParams.get("radius"))
    : null;
  const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
  const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;
  const specialties = searchParams.getAll("specialties");

  // Sync user location from URL params
  useEffect(() => {
    if (lat != null && lng != null) {
      setUserLocation([lng, lat]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      });
    }
  }, [lat, lng]);

  // Fetch hospitals from Supabase
  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let q = supabase.from("hospitals").select("*", { count: "exact" });

      if (query) {
        q = q.or(
          `name.ilike.%${query}%,city.ilike.%${query}%,lga.ilike.%${query}%`,
        );
      }
      if (city) q = q.ilike("city", `%${city}%`);
      if (lga) q = q.ilike("lga", `%${lga}%`);
      if (ownership) q = q.eq("ownership", ownership);
      if (specialties.length > 0) q = q.contains("specialties", specialties);

      const { data, count, error } = await q
        .order("rating_avg", { ascending: false })
        .limit(50);

      if (error) throw error;

      setHospitals((data as Hospital[]) ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, city, lga, ownership, specialties.join(","), radius]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  // Update URL when filters change
  function handleFilterChange(filters: FilterState) {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (filters.ownership) params.set("ownership", filters.ownership);
    if (filters.radius) params.set("radius", String(filters.radius));
    if (lat) params.set("lat", String(lat));
    if (lng) params.set("lng", String(lng));
    filters.specialties.forEach((s) => params.append("specialties", s));
    router.push(`/search?${params.toString()}`);
  }

  function handleSearch(newQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery) params.set("query", newQuery);
    else params.delete("query");
    router.push(`/search?${params.toString()}`);
  }

  function handleMarkerClick(id: string) {
    router.push(`/hospitals/${id}`);
  }

  const shareUrl = buildShareUrl({
    query,
    city,
    lga,
    specialties,
    ownership,
    radius,
    lat,
    lng,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search bar strip */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <SearchBar defaultValue={query} onSearch={handleSearch} />
          </div>
          <ExportButton hospitals={hospitals} query={query} />
          <ShareButton shareUrl={shareUrl} hospitals={hospitals} />
          <button
            onClick={() => setShowMap((v) => !v)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              showMap
                ? "bg-green-600 text-white border-green-600"
                : "border-gray-200 text-gray-600 hover:border-green-400"
            }`}
          >
            {showMap ? "Hide Map" : "Show Map"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterPanel
              specialties={specialties}
              ownership={ownership}
              radius={radius}
              hasLocation={userLocation != null}
              onChange={handleFilterChange}
            />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Map */}
            {showMap && (
              <div className="h-80 mb-6 rounded-2xl overflow-hidden">
                <HospitalMap
                  hospitals={hospitals}
                  userLocation={userLocation}
                  radius={radius}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            )}

            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading
                  ? "Searching..."
                  : `${total} hospital${total !== 1 ? "s" : ""} found`}
              </p>
            </div>

            {/* Results list */}
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-40 bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🏥</p>
                <p className="text-gray-500 font-medium">No hospitals found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {hospitals.map((hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    distance={hospital.distance_km}
                    showActions
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
