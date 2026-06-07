import Papa from "papaparse";
import type { Hospital } from "@/types";

export type ExportColumn =
  | "name"
  | "address"
  | "city"
  | "lga"
  | "phone"
  | "email"
  | "specialties"
  | "ownership"
  | "rating_avg"
  | "review_count";

export const ALL_EXPORT_COLUMNS: { key: ExportColumn; label: string }[] = [
  { key: "name", label: "Hospital Name" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "lga", label: "LGA" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "specialties", label: "Specialties" },
  { key: "ownership", label: "Ownership" },
  { key: "rating_avg", label: "Rating" },
  { key: "review_count", label: "Review Count" },
];

/**
 * Export a filtered list of hospitals to a CSV file download.
 * Entirely client-side — no server round-trip.
 */
export function exportHospitalsCSV(
  hospitals: Hospital[],
  columns: ExportColumn[],
  query: string = "",
): void {
  const rows = hospitals.map((h) => {
    const row: Partial<Record<ExportColumn, string | number>> = {};

    for (const col of columns) {
      if (col === "specialties") {
        row[col] = h.specialties.join(", ");
      } else if (col === "email") {
        row[col] = h.email ?? "";
      } else {
        row[col] = h[col] as string | number;
      }
    }

    return row;
  });

  // Build header labels from selected columns
  const fields = columns.map(
    (col) => ALL_EXPORT_COLUMNS.find((c) => c.key === col)?.label ?? col,
  );

  const csv = Papa.unparse({ fields, data: rows });

  // Generate filename: hospitals-{query}-{YYYY-MM-DD}.csv
  const date = new Date().toISOString().split("T")[0] ?? "today";
  const slug = query.trim().toLowerCase().replace(/\s+/g, "-") || "all";
  const filename = `hospitals-${slug}-${date}.csv`;

  // Trigger browser download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
