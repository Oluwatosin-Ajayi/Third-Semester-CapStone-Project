import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { access_token, refresh_token } = body ?? {};
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const supabase = await createClient();
  try {
    // Set the session on the server so cookies are written
    // supabase.auth.setSession is available on server clients
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
