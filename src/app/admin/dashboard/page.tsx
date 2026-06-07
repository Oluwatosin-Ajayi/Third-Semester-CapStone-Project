import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch stats in parallel
  const [hospitalsRes, pendingReviewsRes] = await Promise.all([
    supabase
      .from("hospitals")
      .select("id, name, city, ownership, rating_avg, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("reviews")
      .select("id", { count: "exact" })
      .eq("status", "pending"),
  ]);

  const hospitals = hospitalsRes.data ?? [];
  const totalHospitals = hospitalsRes.count ?? 0;
  const pendingReviews = pendingReviewsRes.count ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage the Carefinder hospital directory
          </p>
        </div>
        <Link
          href="/admin/hospitals/new"
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
        >
          + Add Hospital
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Hospitals", value: totalHospitals, icon: "🏥" },
          {
            label: "Pending Reviews",
            value: pendingReviews,
            icon: "⭐",
            alert: pendingReviews > 0,
          },
          {
            label: "Public Hospitals",
            value: hospitals.filter((h) => h.ownership === "public").length,
            icon: "🏛️",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl border p-5 ${
              stat.alert ? "border-yellow-300" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              {stat.alert && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  Needs attention
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent hospitals table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Hospitals</h2>
          <span className="text-xs text-gray-400">Last 10 added</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Name", "City", "Type", "Rating", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital) => (
                <tr
                  key={hospital.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {hospital.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {hospital.city}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        hospital.ownership === "public"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {hospital.ownership}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {hospital.rating_avg > 0
                      ? `⭐ ${Number(hospital.rating_avg).toFixed(1)}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/hospitals/${hospital.id}/edit`}
                        className="text-xs text-green-600 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/hospitals/${hospital.id}`}
                        className="text-xs text-gray-400 hover:underline"
                        target="_blank"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hospitals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No hospitals yet.</p>
              <Link
                href="/admin/hospitals/new"
                className="text-green-600 text-sm hover:underline mt-1 inline-block"
              >
                Add the first one →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
