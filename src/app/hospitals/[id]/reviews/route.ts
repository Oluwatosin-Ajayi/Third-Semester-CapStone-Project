import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ReviewInputSchema } from "@/lib/schema";

export async function POST(request: NextRequest) {
  // Must be logged in
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: "You must be logged in to leave a review" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ReviewInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    );
  }

  const { hospital_id, rating, text } = parsed.data;

  // Use service client to bypass RLS for upsert
  const serviceSupabase = createServiceClient();

  const { data, error } = await serviceSupabase
    .from("reviews")
    .upsert(
      {
        hospital_id,
        user_id: session.user.id,
        rating,
        text: text ?? null,
        status: "pending",
      },
      { onConflict: "user_id,hospital_id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, review: data }, { status: 201 });
}
