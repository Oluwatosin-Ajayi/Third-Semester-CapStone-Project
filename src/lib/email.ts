import type { Hospital } from "@/types";

/**
 * Builds the branded HTML email body for the hospital share feature.
 */
export function buildShareEmailHtml({
  hospitals,
  senderName,
  shareUrl,
}: {
  hospitals: Hospital[];
  senderName?: string;
  shareUrl?: string;
}): string {
  const senderLine = senderName
    ? `<p style="color:#374151;font-size:15px;margin:0 0 16px">
        <strong>${escapeHtml(senderName)}</strong> shared this hospital list with you via Carefinder.
       </p>`
    : `<p style="color:#374151;font-size:15px;margin:0 0 16px">
        Someone shared this hospital list with you via Carefinder.
       </p>`;

  const hospitalRows = hospitals
    .map(
      (h) => `
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px;background:#fff">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <h3 style="margin:0;font-size:15px;font-weight:600;color:#111827">
            ${escapeHtml(h.name)}
          </h3>
          <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:${
            h.ownership === "public" ? "#dbeafe" : "#ede9fe"
          };color:${h.ownership === "public" ? "#1d4ed8" : "#6d28d9"};white-space:nowrap;margin-left:8px">
            ${h.ownership}
          </span>
        </div>
        <p style="margin:0 0 6px;font-size:13px;color:#6b7280">
          📍 ${escapeHtml(h.address)}, ${escapeHtml(h.city)}
        </p>
        <p style="margin:0 0 6px;font-size:13px;color:#6b7280">
          📞 <a href="tel:${escapeHtml(h.phone)}" style="color:#16a34a;text-decoration:none">
            ${escapeHtml(h.phone)}
          </a>
        </p>
        ${
          h.email
            ? `<p style="margin:0 0 6px;font-size:13px;color:#6b7280">
                ✉️ <a href="mailto:${escapeHtml(h.email)}" style="color:#16a34a;text-decoration:none">
                  ${escapeHtml(h.email)}
                </a>
               </p>`
            : ""
        }
        ${
          h.specialties.length > 0
            ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">
                ${h.specialties
                  .map(
                    (s) =>
                      `<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0">
                        ${escapeHtml(s)}
                      </span>`,
                  )
                  .join("")}
               </div>`
            : ""
        }
        ${
          h.rating_avg > 0
            ? `<p style="margin:8px 0 0;font-size:12px;color:#9ca3af">
                ⭐ ${h.rating_avg.toFixed(1)} / 5 &nbsp;·&nbsp; ${h.review_count} review${h.review_count !== 1 ? "s" : ""}
               </p>`
            : ""
        }
      </div>
    `,
    )
    .join("");

  const viewOnlineSection = shareUrl
    ? `<div style="text-align:center;margin:24px 0">
        <a href="${escapeHtml(shareUrl)}"
           style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                  padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px">
          View on Carefinder
        </a>
       </div>`
    : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Hospital List from Carefinder</title>
    </head>
    <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <div style="max-width:600px;margin:32px auto;background:#f9fafb;padding:0 16px 32px">

        <!-- Header -->
        <div style="background:#16a34a;border-radius:16px 16px 0 0;padding:24px 28px;margin-bottom:0">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;
                        display:flex;align-items:center;justify-content:center">
              <span style="color:#fff;font-weight:700;font-size:14px">CF</span>
            </div>
            <span style="color:#fff;font-weight:700;font-size:18px">Carefinder</span>
          </div>
        </div>

        <!-- Body -->
        <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px;
                    border:1px solid #e5e7eb;border-top:none;margin-bottom:20px">
          ${senderLine}
          <p style="color:#6b7280;font-size:13px;margin:0 0 20px">
            ${hospitals.length} hospital${hospitals.length !== 1 ? "s" : ""} included:
          </p>

          ${hospitalRows}
          ${viewOnlineSection}
        </div>

        <!-- Footer -->
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin:0">
          Sent via <a href="https://carefinder.ng" style="color:#16a34a;text-decoration:none">Carefinder</a>
          — Nigeria&apos;s Civic Hospital Directory
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Plain text fallback for email clients that don't render HTML
 */
export function buildShareEmailText({
  hospitals,
  senderName,
}: {
  hospitals: Hospital[];
  senderName?: string;
}): string {
  const intro = senderName
    ? `${senderName} shared this hospital list with you via Carefinder.\n\n`
    : `Someone shared this hospital list with you via Carefinder.\n\n`;

  const rows = hospitals
    .map((h, i) =>
      [
        `${i + 1}. ${h.name} (${h.ownership})`,
        `   Address: ${h.address}, ${h.city} — ${h.lga} LGA`,
        `   Phone: ${h.phone}`,
        h.email ? `   Email: ${h.email}` : null,
        h.specialties.length > 0
          ? `   Specialties: ${h.specialties.join(", ")}`
          : null,
        h.rating_avg > 0 ? `   Rating: ${h.rating_avg.toFixed(1)} / 5` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  return `${intro}${rows}\n\n---\nSent via Carefinder — Nigeria's Civic Hospital Directory`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
