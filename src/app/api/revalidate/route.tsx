import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { RevalidateSchema } from "@/lib/schema";

export async function POST(request: NextRequest) {
  // Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parsed = RevalidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing required fields: secret, hospitalId" },
      { status: 422 }
    );
  }

  const { secret, hospitalId } = parsed.data;

  // Verify secret token
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: "Invalid revalidation secret" },
      { status: 401 }
    );
  }

  // Revalidate the specific hospital detail page
  try {
    revalidatePath(`/hospitals/${hospitalId}`);

    // Also revalidate search page so updated data appears there too
    revalidatePath("/search");

    return NextResponse.json(
      {
        revalidated: true,
        hospitalId,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}