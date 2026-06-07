import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Hospital, Review } from "@/types";
import type { HospitalInput, HospitalUpdate, SearchParams } from "@/lib/schema";

//Search hospitals with optional full-text search, filters, and
//PostGIS radius query. Used by the SSR /search page.

export async function searchHospitals(params: SearchParams): Promise<{
  hospitals: Hospital[];
  total: number;
}> {
  const supabase = await createClient();
  const {
    query,
    city,
    lga,
    specialties,
    ownership,
    radius,
    lat,
    lng,
    page,
    limit,
  } = params;

  const offset = ((page ?? 1) - 1) * (limit ?? 20);

  // --- Radius search via PostGIS RPC ---
  if (radius && lat != null && lng != null) {
    const { data, error } = await supabase.rpc("search_hospitals_nearby", {
      user_lat: lat,
      user_lng: lng,
      radius_km: radius,
      search_query: query ?? "",
      filter_specialties:
        specialties && specialties.length > 0 ? specialties : null,
      filter_ownership: ownership ?? null,
      result_limit: limit ?? 20,
      result_offset: offset,
    });

    if (error) throw new Error(`Radius search failed: ${error.message}`);

    return {
      hospitals: (data as Hospital[]) ?? [],
      total: data?.length ?? 0,
    };
  }

  // --- Standard text + filter search ---
  let queryBuilder = supabase.from("hospitals").select("*", { count: "exact" });

  // Full-text search across name, city, lga
  if (query && query.trim().length > 0) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,city.ilike.%${query}%,lga.ilike.%${query}%`,
    );
  }

  if (city) {
    queryBuilder = queryBuilder.ilike("city", `%${city}%`);
  }

  if (lga) {
    queryBuilder = queryBuilder.ilike("lga", `%${lga}%`);
  }

  if (ownership) {
    queryBuilder = queryBuilder.eq("ownership", ownership);
  }

  if (specialties && specialties.length > 0) {
    // GIN index on specialties[] — overlaps operator @>
    queryBuilder = queryBuilder.contains("specialties", specialties);
  }

  const { data, error, count } = await queryBuilder
    .order("rating_avg", { ascending: false })
    .range(offset, offset + (limit ?? 20) - 1);

  if (error) throw new Error(`Search failed: ${error.message}`);

  return {
    hospitals: (data as Hospital[]) ?? [],
    total: count ?? 0,
  };
}

/**
 * Get a single hospital by ID. Used by ISR detail page.
 */
export async function getHospitalById(id: string): Promise<Hospital | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`Failed to fetch hospital: ${error.message}`);
  }

  return data as Hospital;
}

/**
 * Get multiple hospitals by IDs. Used by the email share Route Handler.
 */
export async function getHospitalsByIds(ids: string[]): Promise<Hospital[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .in("id", ids);

  if (error) throw new Error(`Failed to fetch hospitals: ${error.message}`);

  return (data as Hospital[]) ?? [];
}

/**
 * Create a new hospital entry. Admin only — enforced by RLS.
 */
export async function createHospital(input: HospitalInput): Promise<Hospital> {
  const supabase = createServiceClient();

  const { latitude, longitude, ...rest } = input;

  const { data, error } = await supabase
    .from("hospitals")
    .insert({
      ...rest,
      email: rest.email || null,
      // PostGIS point — stored as WKT, Supabase handles the cast
      location: `POINT(${longitude} ${latitude})`,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create hospital: ${error.message}`);

  return data as Hospital;
}

//Update an existing hospital. Admin only — enforced by RLS.
//Triggers ISR revalidation after successful update.

export async function updateHospital(
  id: string,
  input: HospitalUpdate,
): Promise<Hospital> {
  const supabase = createServiceClient();

  const { latitude, longitude, ...rest } = input;

  const updatePayload: Record<string, unknown> = { ...rest };

  if (latitude != null && longitude != null) {
    updatePayload["location"] = `POINT(${longitude} ${latitude})`;
  }

  const { data, error } = await supabase
    .from("hospitals")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update hospital: ${error.message}`);

  // Trigger ISR revalidation
  await triggerRevalidation(id);

  return data as Hospital;
}

/**
 * Delete a hospital. Admin only — cascades to images & reviews.
 */
export async function deleteHospital(id: string): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.from("hospitals").delete().eq("id", id);

  if (error) throw new Error(`Failed to delete hospital: ${error.message}`);
}

/**
 * Get reviews for a hospital, optionally filtered by status.
 * Public gets approved only; admin gets all.
 */
export async function getReviews(
  hospitalId: string,
  status?: "approved" | "pending" | "hidden",
): Promise<Review[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select("*")
    .eq("hospital_id", hospitalId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);

  return (data as Review[]) ?? [];
}

/**
 * Get all pending reviews — for admin moderation queue.
 */
export async function getPendingReviews(): Promise<
  (Review & { hospital_name: string })[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error)
    throw new Error(`Failed to fetch pending reviews: ${error.message}`);

  return (data ?? []).map((r) => ({
    ...(r as Review),
    hospital_name: (r as { hospitals: { name: string } }).hospitals?.name ?? "",
  }));
}

/**
 * Submit a new review. Requires authenticated user.
 */
export async function submitReview(
  hospitalId: string,
  userId: string,
  rating: number,
  text?: string,
): Promise<Review> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        hospital_id: hospitalId,
        user_id: userId,
        rating,
        text: text ?? null,
        status: "pending",
      },
      { onConflict: "user_id,hospital_id" },
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to submit review: ${error.message}`);

  return data as Review;
}

/**
 * Moderate a review — approve or hide. Admin only.
 */
export async function moderateReview(
  reviewId: string,
  status: "approved" | "hidden" | "pending",
): Promise<Review> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) throw new Error(`Failed to moderate review: ${error.message}`);

  return data as Review;
}
// USER / AUTH QUERIES

/**
 * Get the current user's role from public.users.
 * Used by middleware and server components.
 */
export async function getUserRole(
  userId: string,
): Promise<"admin" | "user" | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) return null;

  return (data?.role as "admin" | "user") ?? null;
}

// IMAGE QUERIES
//Get all images for a hospital.

export async function getHospitalImages(hospitalId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hospital_images")
    .select("*")
    .eq("hospital_id", hospitalId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch images: ${error.message}`);

  return data ?? [];
}

//Save image metadata after upload to Supabase Storage.

export async function saveHospitalImage(
  hospitalId: string,
  storagePath: string,
  uploadedBy: string,
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("hospital_images")
    .insert({
      hospital_id: hospitalId,
      storage_path: storagePath,
      uploaded_by: uploadedBy,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save image record: ${error.message}`);

  return data;
}

// Delete an image record and remove from Storage.

export async function deleteHospitalImage(
  imageId: string,
  storagePath: string,
) {
  const supabase = createServiceClient();

  // Remove from storage
  await supabase.storage.from("hospital-images").remove([storagePath]);

  // Remove DB record
  const { error } = await supabase
    .from("hospital_images")
    .delete()
    .eq("id", imageId);

  if (error) throw new Error(`Failed to delete image: ${error.message}`);
}

//Trigger ISR revalidation for a hospital detail page.
//Called after create/update operations.

async function triggerRevalidation(hospitalId: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!siteUrl || !secret) return;

  try {
    await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, hospitalId }),
    });
  } catch {
    // Non-fatal — page will revalidate on next request
    console.warn(`ISR revalidation failed for hospital ${hospitalId}`);
  }
}

export async function getHospitalsById(ids: string[]): Promise<Hospital[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .in("id", ids);

  if (error) {
    console.error("getHospitalsById error:", JSON.stringify(error, null, 2));
    throw new Error(`Failed to fetch hospitals: ${error.message}`);
  }

  return (data as Hospital[]) ?? [];
}
