import { z } from "zod";

// ============================================================
// HOSPITAL SCHEMAS
// ============================================================

export const HospitalInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z
    .string()
    .regex(/^\+234[0-9]{10}$/, "Phone must be Nigerian format: +234XXXXXXXXXX"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  city: z.string().min(2, "City must be at least 2 characters"),
  lga: z.string().min(2, "LGA must be at least 2 characters"),
  latitude: z
    .number()
    .min(4, "Latitude must be within Nigeria (4–14)")
    .max(14, "Latitude must be within Nigeria (4–14)"),
  longitude: z
    .number()
    .min(2, "Longitude must be within Nigeria (2–15)")
    .max(15, "Longitude must be within Nigeria (2–15)"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  ownership: z.enum(["public", "private"], {
    message: "Ownership must be public or private",
  }),
  description_md: z.string().optional(),
  visiting_hours: z.string().optional(),
});

export type HospitalInput = z.infer<typeof HospitalInputSchema>;

// Partial version for updates — all fields optional
export const HospitalUpdateSchema = HospitalInputSchema.partial();
export type HospitalUpdate = z.infer<typeof HospitalUpdateSchema>;

// ============================================================
// SEARCH / FILTER SCHEMAS
// ============================================================

export const SearchParamsSchema = z.object({
  query: z.string().optional().default(""),
  city: z.string().optional(),
  lga: z.string().optional(),
  specialties: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val : [val];
    }),
  ownership: z.enum(["public", "private"]).optional().nullable(),
  radius: z.coerce.number().positive().optional().nullable(),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

// ============================================================
// REVIEW SCHEMAS
// ============================================================

export const ReviewInputSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital ID"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  text: z.string().max(1000, "Review cannot exceed 1000 characters").optional(),
});

export type ReviewInput = z.infer<typeof ReviewInputSchema>;

export const ReviewModerationSchema = z.object({
  reviewId: z.string().uuid(),
  status: z.enum(["approved", "hidden", "pending"]),
});

export type ReviewModeration = z.infer<typeof ReviewModerationSchema>;

// ============================================================
// EMAIL SHARE SCHEMA
// ============================================================

export const ShareEmailSchema = z.object({
  to: z.string().email("Invalid recipient email"),
  hospitalIds: z
    .array(z.string().uuid())
    .min(1, "Select at least one hospital")
    .max(20, "Cannot share more than 20 hospitals at once"),
  senderName: z.string().optional(),
});

export type ShareEmailInput = z.infer<typeof ShareEmailSchema>;

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ============================================================
// REVALIDATE SCHEMA
// ============================================================

export const RevalidateSchema = z.object({
  secret: z.string().min(1),
  hospitalId: z.string().uuid(),
});

export type RevalidateInput = z.infer<typeof RevalidateSchema>;

// ============================================================
// CONSTANTS — used across the app
// ============================================================

export const SPECIALTIES = [
  "emergency",
  "maternity",
  "pediatric",
  "dental",
  "surgery",
  "cardiology",
  "neurology",
  "oncology",
  "ophthalmology",
  "orthopedics",
  "psychiatry",
  "radiology",
  "physiotherapy",
  "dermatology",
  "urology",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;
