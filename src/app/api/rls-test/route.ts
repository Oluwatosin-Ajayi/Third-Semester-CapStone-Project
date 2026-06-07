import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Attempt insert as non-admin
  const { error } = await supabase.from("hospitals").insert({
    name: "RLS Test Hospital",
    address: "Test Address",
    city: "Lagos",
    lga: "Ikeja",
    phone: "+2348012345678",
    ownership: "public",
    specialties: ["emergency"],
    location: "POINT(3.3 6.5)",
  });

  if (error) {
    return NextResponse.json(
      { error: "RLS blocked write", detail: error.message },
      { status: 403 },
    );
  }

  return NextResponse.json({ inserted: true });
}
