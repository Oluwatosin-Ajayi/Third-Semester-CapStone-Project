"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MAPBOX_TOKEN,
  NIGERIA_CENTER,
  NIGERIA_DEFAULT_ZOOM,
} from "@/lib/mapbox";
import type { Hospital } from "@/types";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface HospitalMapProps {
  hospitals: Hospital[];
  userLocation?: [number, number] | null;
  radius?: number | null;
  onMarkerClick: (id: string) => void;
}

export default function HospitalMap({
  hospitals,
  userLocation,
  radius,
  onMarkerClick,
}: HospitalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: userLocation ?? NIGERIA_CENTER,
      zoom: userLocation ? 11 : NIGERIA_DEFAULT_ZOOM,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when hospitals change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    hospitals.forEach((hospital) => {
      // Hospitals from Supabase don't return lat/lng directly —
      // we use the stored coordinates from the seed data
      // The location field is a PostGIS geography; we need lat/lng separately
      // For now we skip hospitals with no coordinates
      const lat = (hospital as { lat?: number }).lat;
      const lng = (hospital as { lng?: number }).lng;
      if (lat == null || lng == null) return;

      // Custom marker element
      const el = document.createElement("div");
      el.className = "hospital-marker";
      el.style.cssText = `
        width: 28px; height: 28px;
        background: #16a34a;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      `;
      el.innerHTML = `<svg width="14" height="14" fill="white" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
      </svg>`;

      el.addEventListener("click", () => onMarkerClick(hospital.id));

      const popup = new mapboxgl.Popup({ offset: 20, closeButton: false })
        .setHTML(`
          <div style="font-family:sans-serif;padding:4px">
            <p style="font-weight:600;font-size:13px;margin:0 0 2px">${hospital.name}</p>
            <p style="color:#6b7280;font-size:11px;margin:0">${hospital.city} · ${hospital.ownership}</p>
            <p style="color:#16a34a;font-size:11px;margin:4px 0 0">⭐ ${hospital.rating_avg > 0 ? hospital.rating_avg.toFixed(1) : "No ratings"}</p>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Fit map to markers if any
    if (markersRef.current.length > 0 && hospitals.length > 1) {
      const lngs = hospitals
        .map((h) => (h as { lng?: number }).lng)
        .filter((v): v is number => v != null);
      const lats = hospitals
        .map((h) => (h as { lat?: number }).lat)
        .filter((v): v is number => v != null);

      if (lngs.length > 0 && lats.length > 0) {
        map.fitBounds(
          [
            [Math.min(...lngs) - 0.1, Math.min(...lats) - 0.1],
            [Math.max(...lngs) + 0.1, Math.max(...lats) + 0.1],
          ],
          { padding: 60, maxZoom: 14 },
        );
      }
    }
  }, [hospitals, onMarkerClick]);

  // Draw radius circle when user location + radius are set
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || !radius) return;

    const addCircle = () => {
      // Remove existing circle
      if (map.getLayer("radius-fill")) map.removeLayer("radius-fill");
      if (map.getLayer("radius-line")) map.removeLayer("radius-line");
      if (map.getSource("radius-circle")) map.removeSource("radius-circle");

      // Generate circle GeoJSON
      const center = userLocation;
      const radiusMeters = radius * 1000;
      const points = 64;
      const coords = Array.from({ length: points + 1 }, (_, i) => {
        const angle = (i / points) * 2 * Math.PI;
        const dx = (radiusMeters / 111320) * Math.cos(angle);
        const dy =
          (radiusMeters / (111320 * Math.cos((center[1] * Math.PI) / 180))) *
          Math.sin(angle);
        return [center[0] + dy, center[1] + dx] as [number, number];
      });

      map.addSource("radius-circle", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [coords] },
        },
      });

      map.addLayer({
        id: "radius-fill",
        type: "fill",
        source: "radius-circle",
        paint: { "fill-color": "#16a34a", "fill-opacity": 0.08 },
      });

      map.addLayer({
        id: "radius-line",
        type: "line",
        source: "radius-circle",
        paint: {
          "line-color": "#16a34a",
          "line-width": 2,
          "line-opacity": 0.6,
        },
      });
    };

    if (map.isStyleLoaded()) {
      addCircle();
    } else {
      map.on("load", addCircle);
    }
  }, [userLocation, radius]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
