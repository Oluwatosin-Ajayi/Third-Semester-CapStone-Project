import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ShareEmailSchema } from "@/lib/schema";
import { createServiceClient } from "@/lib/supabase/service";
import { buildShareEmailHtml, buildShareEmailText } from "@/lib/email";
import { buildShareUrl } from "@/lib/share";
import type { Hospital } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting — simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

async function fetchHospitalsByIds(ids: string[]): Promise<Hospital[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .in("id", ids);

  if (error) {
    console.error("fetchHospitalsByIds error:", JSON.stringify(error, null, 2));
    throw new Error(`Failed to fetch hospitals: ${error.message}`);
  }

  return (data as Hospital[]) ?? [];
}

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429 },
    );
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const parsed = ShareEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => i.message),
      },
      { status: 422 },
    );
  }

  const { to, hospitalIds, senderName } = parsed.data;

  // Fetch hospitals directly using service client
  let hospitals: Hospital[];
  try {
    hospitals = await fetchHospitalsByIds(hospitalIds);
  } catch (err) {
    console.error("Failed to fetch hospitals for email:", err);
    return NextResponse.json(
      { error: "Failed to load hospital data" },
      { status: 500 },
    );
  }

  if (hospitals.length === 0) {
    return NextResponse.json(
      { error: "None of the specified hospitals were found" },
      { status: 404 },
    );
  }

  // Build share URL for the View on Carefinder button
  const shareUrl = buildShareUrl({
    query: hospitals.map((h) => h.city).join(" "),
  });

  // Build email content
  const html = buildShareEmailHtml({ hospitals, senderName, shareUrl });
  const text = buildShareEmailText({ hospitals, senderName });

  // Send via Resend
  try {
    const { error } = await resend.emails.send({
      from: "Carefinder <onboarding@resend.dev>",
      to: [to],
      subject: `${hospitals.length} hospital${hospitals.length !== 1 ? "s" : ""} shared with you via Carefinder`,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, sent: hospitals.length },
      { status: 200 },
    );
  } catch (err) {
    console.error("Resend exception:", err);
    return NextResponse.json(
      { error: "Email service unavailable. Please try again later." },
      { status: 503 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
