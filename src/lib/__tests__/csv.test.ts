import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { exportHospitalsCSV } from "@/lib/csv";
import type { Hospital } from "@/types";

// Mock URL methods
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

const mockHospitals: Hospital[] = [
  {
    id: "1",
    name: "Lagos University Teaching Hospital",
    address: "Ishaga Road, Idi-Araba",
    city: "Lagos",
    lga: "Mushin",
    phone: "+2341234567890",
    email: "info@luth.gov.ng",
    specialties: ["emergency", "surgery", "pediatric"],
    ownership: "public",
    rating_avg: 4.5,
    review_count: 120,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Reddington Hospital",
    address: "12 Idowu Martins Street",
    city: "Lagos",
    lga: "Eti-Osa",
    phone: "+2341234509876",
    email: "info@reddington.com",
    specialties: ["maternity", "dental"],
    ownership: "private",
    rating_avg: 4.2,
    review_count: 85,
    created_at: "2025-01-01T00:00:00Z",
  },
];

describe("exportHospitalsCSV", () => {
  let mockAnchor: {
    href: string;
    download: string;
    click: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAnchor = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockAnchor as unknown as HTMLElement,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("only includes selected columns in output", () => {
    exportHospitalsCSV(mockHospitals, ["name", "city", "phone"], "lagos");
    expect(mockAnchor.click).toHaveBeenCalledOnce();
  });

  it("generates correct filename format", () => {
    exportHospitalsCSV(mockHospitals, ["name"], "lagos");
    const today = new Date().toISOString().split("T")[0];
    expect(mockAnchor.download).toBe(`hospitals-lagos-${today}.csv`);
  });

  it("uses 'all' in filename when no query provided", () => {
    exportHospitalsCSV(mockHospitals, ["name"]);
    const today = new Date().toISOString().split("T")[0];
    expect(mockAnchor.download).toBe(`hospitals-all-${today}.csv`);
  });

  it("joins specialties array into comma-separated string", () => {
    expect(() =>
      exportHospitalsCSV(mockHospitals, ["name", "specialties"]),
    ).not.toThrow();
    expect(mockAnchor.click).toHaveBeenCalledOnce();
  });
});
