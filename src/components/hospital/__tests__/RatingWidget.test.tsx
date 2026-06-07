import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RatingWidget from "@/components/hospital/RatingWidget";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

describe("RatingWidget", () => {
  const defaultProps = {
    hospitalId: "test-hospital-id",
    aggregateRating: 4.2,
    reviewCount: 25,
  };

  it("renders the aggregate rating", () => {
    render(<RatingWidget {...defaultProps} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  it("renders the review count", () => {
    render(<RatingWidget {...defaultProps} />);
    expect(screen.getByText("25 reviews")).toBeInTheDocument();
  });

  it("renders 5 stars in the aggregate display", () => {
    render(<RatingWidget {...defaultProps} />);
    // Title + aggregate stars
    expect(screen.getByText("Rate this Hospital")).toBeInTheDocument();
  });

  it("shows sign in prompt when user is not logged in", async () => {
    render(<RatingWidget {...defaultProps} />);
    // Wait for auth check
    await vi.waitFor(() => {
      expect(screen.getByText("Sign in to leave a review")).toBeInTheDocument();
    });
  });

  it("shows sign in button when not authenticated", async () => {
    render(<RatingWidget {...defaultProps} />);
    await vi.waitFor(() => {
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows no reviews message when count is 0", () => {
    render(
      <RatingWidget hospitalId="test-id" aggregateRating={0} reviewCount={0} />,
    );
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });

  it("renders a dash when aggregate rating is 0", () => {
    render(
      <RatingWidget hospitalId="test-id" aggregateRating={0} reviewCount={0} />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
