// Mapbox token helper + coordinate utilities

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/**
 * Nigeria bounding box — used to constrain map initial view
 */
export const NIGERIA_BOUNDS: [[number, number], [number, number]] = [
  [2.676932, 4.240594], // SW corner
  [14.680174, 13.865924], // NE corner
];

export const NIGERIA_CENTER: [number, number] = [8.6753, 9.082];
export const NIGERIA_DEFAULT_ZOOM = 5.5;

/**
 * Build a Supabase Storage public URL for a hospital image
 */
export function getStorageUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/hospital-images/${storagePath}`;
}

/**
 * Convert degrees to radians
 */
export function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Haversine distance between two coordinates (km)
 * Used client-side when PostGIS isn't available
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
