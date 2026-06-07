import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { HospitalInputSchema } from "@/lib/schema";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  return user?.role === "admin" ? session : null;
}

export async function POST(request: NextRequest) {
  const session = await verifyAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = HospitalInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { latitude, longitude, ...rest } = parsed.data;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("hospitals")
    .insert({
      ...rest,
      email: rest.email || null,
      location: `POINT(${longitude} ${latitude})`,
      created_by: session.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Trigger ISR revalidation
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.REVALIDATE_SECRET,
      hospitalId: data.id,
    }),
  }).catch(() => {});

  return NextResponse.json(data, { status: 201 });
}
