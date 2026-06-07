"use client";

import { useState } from "react";
import {
  exportHospitalsCSV,
  ALL_EXPORT_COLUMNS,
  type ExportColumn,
} from "@/lib/csv";
import type { Hospital } from "@/types";

interface ExportButtonProps {
  hospitals: Hospital[];
  query?: string;
}

export default function ExportButton({
  hospitals,
  query = "",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExportColumn[]>([
    "name",
    "address",
    "phone",
    "city",
    "lga",
    "specialties",
  ]);

  function toggle(col: ExportColumn) {
    setSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  }

  function handleExport() {
    exportHospitalsCSV(hospitals, selected, query);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={hospitals.length === 0}
        className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:border-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        Export CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-4">
              Select columns to export
            </h3>
            <div className="space-y-2 mb-6">
              {ALL_EXPORT_COLUMNS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(key)}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selected.length === 0}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-40"
              >
                Download ({hospitals.length} rows)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
