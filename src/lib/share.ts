/**
 * Encode current search filters into a shareable URL
 */
export function buildShareUrl(params: {
  query?: string;
  city?: string;
  lga?: string;
  specialties?: string[];
  ownership?: "public" | "private" | null;
  radius?: number | null;
  lat?: number | null;
  lng?: number | null;
}): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const url = new URL("/search", base);

  if (params.query) url.searchParams.set("query", params.query);
  if (params.city) url.searchParams.set("city", params.city);
  if (params.lga) url.searchParams.set("lga", params.lga);
  if (params.ownership) url.searchParams.set("ownership", params.ownership);
  if (params.radius) url.searchParams.set("radius", String(params.radius));
  if (params.lat != null) url.searchParams.set("lat", String(params.lat));
  if (params.lng != null) url.searchParams.set("lng", String(params.lng));

  if (params.specialties && params.specialties.length > 0) {
    params.specialties.forEach((s) =>
      url.searchParams.append("specialties", s),
    );
  }

  return url.toString();
}

/**
 * Decode a shareable URL back into filter params
 * Used by the SSR /search page to restore state from URL
 */
export function parseShareUrl(searchParams: Record<string, string | string[]>) {
  return {
    query: asString(searchParams["query"]) ?? "",
    city: asString(searchParams["city"]),
    lga: asString(searchParams["lga"]),
    ownership: asString(searchParams["ownership"]) as
      | "public"
      | "private"
      | null,
    radius: asNumber(searchParams["radius"]),
    lat: asNumber(searchParams["lat"]),
    lng: asNumber(searchParams["lng"]),
    specialties: asArray(searchParams["specialties"]),
  };
}

function asString(val: string | string[] | undefined): string | null {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

function asNumber(val: string | string[] | undefined): number | null {
  const str = asString(val);
  if (!str) return null;
  const n = parseFloat(str);
  return isNaN(n) ? null : n;
}

function asArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}
