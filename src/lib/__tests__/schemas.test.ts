import { describe, it, expect } from "vitest";
import {
  HospitalInputSchema,
  SearchParamsSchema,
  ReviewInputSchema,
} from "@/lib/schema";

describe("HospitalInputSchema", () => {
  it("accepts a valid Nigerian phone number", () => {
    const result = HospitalInputSchema.safeParse({
      name: "Test Hospital",
      address: "123 Test Street",
      phone: "+2348012345678",
      city: "Lagos",
      lga: "Ikeja",
      latitude: 6.5,
      longitude: 3.3,
      specialties: ["emergency"],
      ownership: "private",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-Nigerian phone format", () => {
    const result = HospitalInputSchema.safeParse({
      name: "Test Hospital",
      address: "123 Test Street",
      phone: "08012345678",
      city: "Lagos",
      lga: "Ikeja",
      latitude: 6.5,
      longitude: 3.3,
      specialties: ["emergency"],
      ownership: "private",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Nigerian format");
  });

  it("rejects latitude outside Nigeria bounds", () => {
    const result = HospitalInputSchema.safeParse({
      name: "Test Hospital",
      address: "123 Test Street",
      phone: "+2348012345678",
      city: "Lagos",
      lga: "Ikeja",
      latitude: 51.5,
      longitude: 3.3,
      specialties: ["emergency"],
      ownership: "private",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Nigeria");
  });

  it("rejects longitude outside Nigeria bounds", () => {
    const result = HospitalInputSchema.safeParse({
      name: "Test Hospital",
      address: "123 Test Street",
      phone: "+2348012345678",
      city: "Lagos",
      lga: "Ikeja",
      latitude: 6.5,
      longitude: -0.1,
      specialties: ["emergency"],
      ownership: "private",
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one specialty", () => {
    const result = HospitalInputSchema.safeParse({
      name: "Test Hospital",
      address: "123 Test Street",
      phone: "+2348012345678",
      city: "Lagos",
      lga: "Ikeja",
      latitude: 6.5,
      longitude: 3.3,
      specialties: [],
      ownership: "private",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("At least one");
  });

  it("accepts optional email as undefined", () => {
    const result = HospitalInputSchema.safeParse({
      name: "Test Hospital",
      address: "123 Test Street",
      phone: "+2348012345678",
      city: "Lagos",
      lga: "Ikeja",
      latitude: 6.5,
      longitude: 3.3,
      specialties: ["emergency"],
      ownership: "public",
    });
    expect(result.success).toBe(true);
  });
});

describe("SearchParamsSchema", () => {
  it("coerces string radius to number", () => {
    const result = SearchParamsSchema.safeParse({ radius: "10" });
    expect(result.success).toBe(true);
    expect(result.data?.radius).toBe(10);
  });

  it("transforms single specialty string into array", () => {
    const result = SearchParamsSchema.safeParse({ specialties: "maternity" });
    expect(result.success).toBe(true);
    expect(result.data?.specialties).toEqual(["maternity"]);
  });

  it("defaults page to 1 when not provided", () => {
    const result = SearchParamsSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
  });
});

describe("ReviewInputSchema", () => {
  it("accepts a valid 5-star review", () => {
    const result = ReviewInputSchema.safeParse({
      hospital_id: "550e8400-e29b-41d4-a716-446655440000",
      rating: 5,
      text: "Excellent service",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating above 5", () => {
    const result = ReviewInputSchema.safeParse({
      hospital_id: "550e8400-e29b-41d4-a716-446655440000",
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating below 1", () => {
    const result = ReviewInputSchema.safeParse({
      hospital_id: "550e8400-e29b-41d4-a716-446655440000",
      rating: 0,
    });
    expect(result.success).toBe(false);
  });
});
