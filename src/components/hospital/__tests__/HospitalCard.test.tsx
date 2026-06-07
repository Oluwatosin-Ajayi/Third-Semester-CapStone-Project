import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HospitalCard from "@/components/hospital/HospitalCard";
import type { Hospital } from "@/types";

const mockHospital: Hospital = {
  id: "test-id-123",
  name: "Lagos University Teaching Hospital",
  address: "Ishaga Road, Idi-Araba",
  city: "Lagos",
  lga: "Mushin",
  phone: "+2341234567890",
  email: "info@luth.gov.ng",
  specialties: ["emergency", "surgery", "pediatric", "maternity"],
  ownership: "public",
  rating_avg: 4.5,
  review_count: 120,
  created_at: "2025-01-01T00:00:00Z",
};

describe("HospitalCard", () => {
  it("renders hospital name", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(
      screen.getByText("Lagos University Teaching Hospital"),
    ).toBeInTheDocument();
  });

  it("renders address and city", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(screen.getByText(/Ishaga Road/)).toBeInTheDocument();
  });

  it("renders ownership badge", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(screen.getByText("public")).toBeInTheDocument();
  });

  it("renders specialties", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(screen.getByText("emergency")).toBeInTheDocument();
    expect(screen.getByText("surgery")).toBeInTheDocument();
  });

  it("shows +N more when specialties exceed 4", () => {
    const hospital = {
      ...mockHospital,
      specialties: ["emergency", "surgery", "pediatric", "maternity", "dental"],
    };
    render(<HospitalCard hospital={hospital} />);
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("shows distance when provided", () => {
    render(<HospitalCard hospital={mockHospital} distance={3.7} />);
    expect(screen.getByText(/3\.7 km away/)).toBeInTheDocument();
  });

  it("does not show distance when not provided", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(screen.queryByText(/km away/)).not.toBeInTheDocument();
  });

  it("renders LGA", () => {
    render(<HospitalCard hospital={mockHospital} />);
    expect(screen.getByText("Mushin LGA")).toBeInTheDocument();
  });

  it("links to the correct hospital detail page", () => {
    render(<HospitalCard hospital={mockHospital} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/hospitals/test-id-123");
  });
});
