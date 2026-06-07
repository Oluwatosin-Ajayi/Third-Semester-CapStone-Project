"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { SPECIALTIES } from "@/lib/schema";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError(
          "Location access denied — you can still search by name or city.",
        );
        setLocating(false);
      },
    );
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (userLocation) {
      params.set("lat", String(userLocation.lat));
      params.set("lng", String(userLocation.lng));
      params.set("radius", "20");
    }
    router.push(`/search?${params.toString()}`);
  }

  function handleSpecialtyClick(specialty: string) {
    router.push(`/search?specialties=${specialty}`);
  }

  function handleNearMe() {
    if (!userLocation) return;
    router.push(
      `/search?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10`,
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Find the Right Hospital,{" "}
            <span className="text-green-200">Right Now</span>
          </h1>
          <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
            Nigeria&apos;s most complete hospital directory. Search by name,
            city, LGA, or specialty — then export or share results instantly.
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex gap-2 max-w-2xl mx-auto shadow-lg"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by hospital name, city, or LGA..."
              className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 text-sm outline-none rounded-xl"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Location status */}
          <div className="mt-4 h-6">
            {locating && (
              <p className="text-green-200 text-sm">
                📍 Detecting your location...
              </p>
            )}
            {userLocation && !locating && (
              <button
                onClick={handleNearMe}
                className="text-green-200 text-sm underline hover:text-white transition-colors"
              >
                📍 Use my location — find hospitals within 10 km
              </button>
            )}
            {locationError && (
              <p className="text-green-300 text-sm">{locationError}</p>
            )}
          </div>
        </div>
      </section>

      {/* Quick specialty filters */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Browse by Specialty
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtyClick(specialty)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50 transition-all capitalize shadow-sm"
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: "🗺️",
              title: "Interactive Map",
              desc: "See hospitals plotted on a live Mapbox map with radius filtering.",
            },
            {
              icon: "📤",
              title: "Export & Share",
              desc: "Download results as CSV or share a direct link with anyone.",
            },
            {
              icon: "⭐",
              title: "Verified Ratings",
              desc: "Real ratings and reviews from patients across Nigeria.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© 2026 Carefinder — Nigeria&apos;s Civic Hospital Directory</p>
      </footer>
    </div>
  );
}
