import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildShareUrl, parseShareUrl } from "@/lib/share";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
});

describe("buildShareUrl", () => {
  it("builds a URL with query and city", () => {
    const url = buildShareUrl({ query: "Lagos", city: "Lagos" });
    expect(url).toContain("/search");
    expect(url).toContain("query=Lagos");
    expect(url).toContain("city=Lagos");
  });

  it("appends multiple specialties as separate params", () => {
    const url = buildShareUrl({
      specialties: ["maternity", "emergency"],
    });
    expect(url).toContain("specialties=maternity");
    expect(url).toContain("specialties=emergency");
  });

  it("omits null/undefined params", () => {
    const url = buildShareUrl({ query: "Abuja" });
    expect(url).not.toContain("city=");
    expect(url).not.toContain("radius=");
  });

  it("includes radius, lat, lng when provided", () => {
    const url = buildShareUrl({ radius: 10, lat: 6.5, lng: 3.3 });
    expect(url).toContain("radius=10");
    expect(url).toContain("lat=6.5");
    expect(url).toContain("lng=3.3");
  });
});

describe("parseShareUrl", () => {
  it("parses a simple query string", () => {
    const params = parseShareUrl({ query: "Lagos" });
    expect(params.query).toBe("Lagos");
  });

  it("parses specialties array", () => {
    const params = parseShareUrl({
      specialties: ["maternity", "dental"],
    });
    expect(params.specialties).toEqual(["maternity", "dental"]);
  });

  it("converts radius string to number", () => {
    const params = parseShareUrl({ radius: "10" });
    expect(params.radius).toBe(10);
  });

  it("returns empty query when not present", () => {
    const params = parseShareUrl({});
    expect(params.query).toBe("");
  });
});
